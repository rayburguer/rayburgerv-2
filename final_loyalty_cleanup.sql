-- ==============================================================================
-- LIMPIEZA RADICAL Y SISTEMA DE LEALTAD DEFINITIVO (V4 - Anti-Fraude)
-- ==============================================================================

-- 1. FASE DE DESTRUCCIÓN (Borrar el "Cáncer")
DROP TRIGGER IF EXISTS on_order_delivered ON orders;
DROP TRIGGER IF EXISTS on_order_delivered_duplicate ON orders; 
DROP TRIGGER IF EXISTS on_order_paid ON orders;
DROP TRIGGER IF EXISTS tr_final_loyalty_system ON orders;

DROP FUNCTION IF EXISTS process_loyalty_rewards CASCADE;
DROP FUNCTION IF EXISTS handle_cashback CASCADE;
DROP FUNCTION IF EXISTS process_final_loyalty_logic CASCADE; -- Asegurar borrado de funci贸n previa

-- 2. INFRAESTRUCTURA DE PAGOS (Asegurar Tablas)
CREATE TABLE IF NOT EXISTS wallet_transactions (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
    amount numeric NOT NULL,
    type text NOT NULL CHECK (type IN ('credit', 'debit')), -- Strict type check
    description text,
    created_at timestamptz DEFAULT now()
);

-- Habilitar RLS en wallet_transactions
ALTER TABLE wallet_transactions ENABLE ROW LEVEL SECURITY;

-- Política: Usuarios ven sus propias transacciones
DROP POLICY IF EXISTS "Users view own transactions" ON wallet_transactions;
CREATE POLICY "Users view own transactions" ON wallet_transactions
    FOR SELECT USING (auth.uid() = user_id);

-- 3. FUNCIÓN DE NEGOCIO SAGRADA (3-5-8% + Anti-Fraude)
CREATE OR REPLACE FUNCTION process_final_loyalty_logic()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    buyer_id uuid;
    referrer_id uuid;
    order_total numeric;
    user_tier text;
    cashback_percent numeric;
    cashback_amount numeric;
    commission_amount numeric;
    points_earned int;
    current_points int;
    new_level text;
    buyer_role text;
BEGIN
    buyer_id := NEW.user_id;

    -- A. VALIDACIONES INICIALES
    -- ---------------------------------------------------------
    -- 1. Solo procesar si hay usuario (no invitados)
    IF buyer_id IS NULL THEN
        RETURN NEW;
    END IF;

    -- 2. [SEGURIDAD] Anti-Fraude Admin (Regla #3)
    -- Los admins NO ganan puntos ni cashback
    SELECT role INTO buyer_role FROM profiles WHERE id = buyer_id;
    
    IF buyer_role = 'admin' THEN
        RETURN NEW; -- Salida silenciosa, el admin no juega.
    END IF;

    -- 3. Obtener Total Válido
    order_total := COALESCE(NEW.total_amount, (to_jsonb(NEW)->>'total')::numeric, 0);
    
    IF order_total <= 0 THEN
        RETURN NEW;
    END IF;

    -- B. CÁLCULO DE GAMIFICATION (PUNTOS Y NIVEL)
    -- ---------------------------------------------------------
    -- Calculamos los nuevos puntos ganados (10x)
    points_earned := ROUND(order_total * 10)::int;
    
    -- Actualizamos Puntos del Usuario y obtenemos el nuevo total
    UPDATE profiles 
    SET points = COALESCE(points, 0) + points_earned
    WHERE id = buyer_id
    RETURNING points INTO current_points;

    -- Determinamos Nuevo Nivel basado en Puntos Totales
    -- Bronce: 0 - 999 | Plata: 1000 - 2999 | Oro: 3000+
    IF current_points >= 3000 THEN
        new_level := 'oro';
        cashback_percent := 0.08;
    ELSIF current_points >= 1000 THEN
        new_level := 'plata';
        cashback_percent := 0.05;
    ELSE
        new_level := 'bronce';
        cashback_percent := 0.03;
    END IF;

    -- Actualizamos Nivel en DB si ha cambiado
    UPDATE profiles 
    SET membership_level = new_level
    WHERE id = buyer_id AND membership_level IS DISTINCT FROM new_level;

    -- C. CÁLCULO DE DINERO (CASHBACK)
    -- ---------------------------------------------------------
    user_tier := new_level; -- Usamos el nivel ACTUALIZADO
    cashback_amount := ROUND(order_total * cashback_percent, 2);
    commission_amount := ROUND(order_total * 0.02, 2); -- 2% fijo para Padrino

    -- Aplicar Cashback al Usuario
    UPDATE profiles 
    SET wallet_balance = COALESCE(wallet_balance, 0) + cashback_amount
    WHERE id = buyer_id;

    -- [AUDIT] Log Usuario
    INSERT INTO wallet_transactions (user_id, amount, type, description, created_at)
    VALUES (buyer_id, cashback_amount, 'credit', 'Cashback de Lealtad (' || INITCAP(user_tier) || ')', NOW());

    -- D. CÁLCULO DE PADRINO (COMMISSIONS)
    -- ---------------------------------------------------------
    SELECT referred_by INTO referrer_id FROM profiles WHERE id = buyer_id;

    IF referrer_id IS NOT NULL THEN
        -- Aplicar Comisión al Padrino
        UPDATE profiles 
        SET wallet_balance = COALESCE(wallet_balance, 0) + commission_amount
        WHERE id = referrer_id;

        -- [AUDIT] Log Padrino
        INSERT INTO wallet_transactions (user_id, amount, type, description, created_at)
        VALUES (referrer_id, commission_amount, 'credit', 'Comisión por Referido (2%)', NOW());
    END IF;

    RETURN NEW;
END;
$$;

-- 4. EL ÚNICO JUEZ (TRIGGER FINAL)
CREATE TRIGGER tr_final_loyalty_system
AFTER UPDATE ON orders
FOR EACH ROW
WHEN (
    OLD.status IS DISTINCT FROM 'delivered' AND 
    NEW.status = 'delivered'
)
EXECUTE FUNCTION process_final_loyalty_logic();

-- 5. VISTA DE PROGRESO (Front-End Friendly)
DROP VIEW IF EXISTS v_user_progress;
CREATE OR REPLACE VIEW v_user_progress AS
SELECT 
    id AS user_id,
    full_name,
    membership_level AS user_level,
    points,
    -- Cálculos de Progreso
    CASE 
        WHEN points >= 3000 THEN 100 -- Oro Max
        WHEN points >= 1000 THEN ROUND(((points - 1000)::numeric / 2000) * 100, 0) -- Plata a Oro
        ELSE ROUND((points::numeric / 1000) * 100, 0) -- Bronce a Plata
    END AS porcentaje_progreso_nivel,
    CASE 
        WHEN points >= 3000 THEN 0
        WHEN points >= 1000 THEN (3000 - points) -- Faltan para Oro
        ELSE (1000 - points) -- Faltan para Plata
    END AS falta_para_siguiente_nivel,
    -- Gamification Extra
    CASE
        WHEN points >= 3000 THEN 0 -- Ya eres Oro
        ELSE 1 -- Falsa bandera
    END AS puntos_para_burger_gratis
FROM profiles;
