-- ==============================================================================
-- RAY BURGER LOYALTY ENGINE (V3) - 100x VALUE EDITION
-- ==============================================================================

-- 0. LIMPIEZA INICIAL (SOLO PARA PRUEBAS)
-- Ejecuta esto para resetear todos los saldos y puntos a cero.
UPDATE profiles SET wallet_balance = 0, points = 0;


-- 1. ACTUALIZAR TABLA PROFILES (Asegurar columnas)
DO $$ 
BEGIN 
    -- Wallet Balance
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'wallet_balance') THEN
        ALTER TABLE profiles ADD COLUMN wallet_balance numeric DEFAULT 0.00;
    END IF;

    -- Points
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'points') THEN
        ALTER TABLE profiles ADD COLUMN points integer DEFAULT 0;
    END IF;

    -- Referred By
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'referred_by') THEN
        ALTER TABLE profiles ADD COLUMN referred_by uuid REFERENCES profiles(id);
    END IF;
END $$;


-- 2. FUNCIÓN DE RECOMPENSAS (PL/pgSQL) CON ESCALA 1:100
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
BEGIN
    BEGIN
        buyer_id := NEW.user_id;

        -- Leer Total (Soporte dual total/total_amount)
        order_total := COALESCE(NEW.total_amount, 0); 
        IF order_total = 0 THEN
             order_total := COALESCE((to_jsonb(NEW)->>'total')::numeric, 0);
        END IF;

        IF order_total <= 0 THEN
            RETURN NEW;
        END IF;

        -- NUEVA ESCALA: $1 = 100 Puntos
        -- Convertimos a entero multiplicando por 100.
        points_earned := FLOOR(order_total * 100)::integer; 
        
        -- Cashback: 3% (Dinero real)
        cashback_buyer := ROUND(order_total * 0.03, 2);
        
        -- Comisión Padrino: 2% (Dinero real)
        commission_referrer := ROUND(order_total * 0.02, 2);

        -- A. RECOMPENSAR AL COMPRADOR
        UPDATE profiles 
        SET 
            wallet_balance = COALESCE(wallet_balance, 0) + cashback_buyer,
            points = COALESCE(points, 0) + points_earned
        WHERE id = buyer_id;

        -- B. RECOMPENSAR AL PADRINO (Si existe)
        SELECT referred_by INTO referrer_id FROM profiles WHERE id = buyer_id;

        IF referrer_id IS NOT NULL THEN
            UPDATE profiles 
            SET 
                wallet_balance = COALESCE(wallet_balance, 0) + commission_referrer,
                points = COALESCE(points, 0) + points_earned 
            WHERE id = referrer_id;
        END IF;

    EXCEPTION WHEN OTHERS THEN
        RAISE WARNING 'Error en Motor de Lealtad (Order %): %', NEW.id, SQLERRM;
        RETURN NEW;
    END;

    RETURN NEW;
END;
$$;


-- 3. TRIGGER (Re-creación segura)
DROP TRIGGER IF EXISTS on_order_delivered ON orders;

CREATE TRIGGER on_order_delivered
AFTER UPDATE OF status ON orders
FOR EACH ROW
WHEN (
    OLD.status <> 'completed' AND 
    NEW.status = 'completed'      
)
EXECUTE FUNCTION process_loyalty_rewards();
