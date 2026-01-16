-- ==============================================================================
-- RAY BURGER (V3) - BACKEND SPECIFICATIONS FINAL
-- ==============================================================================

-- 1. TABLA DE CONFIGURACIÓN (App Config)
CREATE TABLE IF NOT EXISTS public.app_config (
    key text PRIMARY KEY,
    value text NOT NULL,
    description text
);

-- Seed de Tasa Dolar (Ejemplo: 45.00 Bs/$)
INSERT INTO public.app_config (key, value, description)
VALUES ('tasa_dolar', '45.00', 'Tasa de cambio del día (Bs)')
ON CONFLICT (key) DO NOTHING;


-- 2. TABLA DE TRANSACCIONES (Wallet History)
CREATE TABLE IF NOT EXISTS public.wallet_transactions (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    profile_id uuid REFERENCES public.profiles(id) NOT NULL,
    amount numeric NOT NULL, -- Positivo (crédito) o Negativo (débito)
    type text NOT NULL, -- 'cashback', 'referral_bonus', 'redeem', 'purchase'
    description text,
    order_id uuid REFERENCES public.orders(id), -- Opcional
    created_at timestamptz DEFAULT now()
);


-- 3. ACTUALIZACAR PROFILES (User Level)
-- Aseguramos que profile tenga user_level
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'user_level') THEN
        ALTER TABLE profiles ADD COLUMN user_level text DEFAULT 'Bronce';
    END IF;
END $$;


-- 4. VISTA: MENÚ COMPLETO (Precio USD + Precio BS)
-- Join Cross con app_config para tener la tasa disponible en cada fila
CREATE OR REPLACE VIEW public.v_menu_completo AS
SELECT 
    p.id,
    p.name,
    p.description,
    p.image_url,
    p.category,
    p.price_usd,
    -- Cálculo dinámico de Bolívares
    ROUND(p.price_usd * (SELECT value::numeric FROM public.app_config WHERE key = 'tasa_dolar'), 2) as precio_bs,
    -- Tasa de referencia informativa
    (SELECT value FROM public.app_config WHERE key = 'tasa_dolar') as tasa_referencia
FROM public.products p
WHERE p.is_active = true;


-- 5. VISTA: PROGRESO DE USUARIO (Gamificación)
CREATE OR REPLACE VIEW public.v_user_progress AS
SELECT 
    id as user_id,
    full_name,
    points,
    user_level,
    -- Lógica de Niveles
    -- Bronce: 0-5000 | Plata: 5000-20000 | Oro: >20000
    CASE 
        WHEN points < 5000 THEN 'Bronce'
        WHEN points < 20000 THEN 'Plata'
        ELSE 'Oro'
    END as nivel_calculado,
    
    -- Meta Siguiente Nivel
    CASE 
        WHEN points < 5000 THEN 5000 - points
        WHEN points < 20000 THEN 20000 - points
        ELSE 0
    END as falta_para_siguiente_nivel,
    
    -- Porcentaje Progreso (Visual 0-100)
    CASE 
        WHEN points < 5000 THEN ROUND((points::numeric / 5000) * 100, 1)
        WHEN points < 20000 THEN ROUND(((points - 5000)::numeric / 15000) * 100, 1) -- Progreso dentro de Plata
        ELSE 100
    END as porcentaje_progreso,

    -- Burger Gratis (Ejemplo: Cada 10,000 puntos)
    -- Countdown cíclico
    (10000 - (points % 10000)) as puntos_para_burger_gratis

FROM public.profiles;


-- 6. ACTUALIZAR TRIGGER DE LEALTAD (Con Logs y Niveles)
CREATE OR REPLACE FUNCTION process_loyalty_rewards()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER 
AS $$
DECLARE
    buyer_id uuid;
    referrer_id uuid;
    order_total numeric;
    points_earned integer;
    cashback_buyer numeric;
    commission_referrer numeric;
    new_level text;
    current_points integer;
BEGIN
    BEGIN
        buyer_id := NEW.user_id;

        -- Leer Total
        order_total := COALESCE(NEW.total_amount, 0); 
        IF order_total = 0 THEN
             order_total := COALESCE((to_jsonb(NEW)->>'total')::numeric, 0);
        END IF;

        IF order_total <= 0 THEN
            RETURN NEW;
        END IF;

        -- Cálculos (1 USD = 100 Puntos)
        points_earned := FLOOR(order_total * 100)::integer; 
        cashback_buyer := ROUND(order_total * 0.03, 2);
        commission_referrer := ROUND(order_total * 0.02, 2);

        -- A. RECOMPENSAR AL COMPRADOR
        UPDATE profiles 
        SET 
            wallet_balance = COALESCE(wallet_balance, 0) + cashback_buyer,
            points = COALESCE(points, 0) + points_earned
        RETURNING points INTO current_points; -- Capturamos los nuevos puntos para calcular nivel
        
        -- Insertar Log Transacción Comprador
        INSERT INTO wallet_transactions (profile_id, amount, type, description, order_id)
        VALUES (buyer_id, cashback_buyer, 'cashback', 'Cashback 3% por Orden #' ||  substring(NEW.id::text, 1, 8), NEW.id);

        -- Calcular y Actualizar Nivel (Bronce/Plata/Oro)
        IF current_points < 5000 THEN new_level := 'Bronce';
        ELSIF current_points < 20000 THEN new_level := 'Plata';
        ELSE new_level := 'Oro';
        END IF;

        UPDATE profiles SET user_level = new_level WHERE id = buyer_id;

        -- B. RECOMPENSAR AL PADRINO
        SELECT referred_by INTO referrer_id FROM profiles WHERE id = buyer_id;

        IF referrer_id IS NOT NULL THEN
            UPDATE profiles 
            SET 
                wallet_balance = COALESCE(wallet_balance, 0) + commission_referrer,
                points = COALESCE(points, 0) + points_earned -- Padrino también gana puntos
            WHERE id = referrer_id;

             -- Insertar Log Transacción Padrino
            INSERT INTO wallet_transactions (profile_id, amount, type, description, order_id)
            VALUES (referrer_id, commission_referrer, 'referral_bonus', 'Bono 2% por referido', NEW.id);
        END IF;

    EXCEPTION WHEN OTHERS THEN
        RAISE WARNING 'Error en Motor de Lealtad (Order %): %', NEW.id, SQLERRM;
        RETURN NEW;
    END;

    RETURN NEW;
END;
$$;
