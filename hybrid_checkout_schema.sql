-- ==============================================================================
-- HYBRID CHECKOUT & SECURITY UPDATE (STRICT MODE + DEFENSIVE)
-- ==============================================================================

DO $$ 
BEGIN 
    -- 1. ORDERS: Allow NULL user_id for Guest Checkout
    -- "Consistencia de IDs": Strict check if constraint exists before dropping/altering
    ALTER TABLE public.orders ALTER COLUMN user_id DROP NOT NULL;

    -- 2. ORDERS: Guest Info Columns (Defensive Add)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'guest_name') THEN
        ALTER TABLE public.orders ADD COLUMN guest_name text;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'guest_contact') THEN
        ALTER TABLE public.orders ADD COLUMN guest_contact text;
    END IF;

    -- 3. ORDERS: Ensure Delivery Columns (Safety Check if previous script failed)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'delivery_type') THEN
        ALTER TABLE public.orders ADD COLUMN delivery_type text CHECK (delivery_type IN ('pickup', 'delivery'));
    END IF;

    -- 4. PROFILES: Admin Role Column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'role') THEN
        ALTER TABLE public.profiles ADD COLUMN role text DEFAULT 'customer';
    END IF;

    -- 5. SET ADMIN: Elevate the Owner (ID from Layout)
    -- "1738e367-3afd-4b39-afc2-be95875e1ce8"
    UPDATE public.profiles 
    SET role = 'admin' 
    WHERE id = '1738e367-3afd-4b39-afc2-be95875e1ce8';

END $$;

-- 6. WELCOME BONUS ($0.50) - Trigger Logic
-- "Función simple que solo se dispare una vez por usuario nuevo"
CREATE OR REPLACE FUNCTION public.apply_welcome_bonus()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Asignar saldo inicial
    NEW.wallet_balance := COALESCE(NEW.wallet_balance, 0) + 0.50;
    
    -- (Opcional) Log de Transacción en Tabla Aparte (si existe)
    -- INSERT INTO wallet_transactions ... (Skipped for simplicity per request)
    
    RETURN NEW;
END;
$$;

-- Drop trigger if exists to ensure clean update
DROP TRIGGER IF EXISTS tr_welcome_bonus ON public.profiles;

-- Create Trigger (BEFORE INSERT ensures balance is there immediately)
CREATE TRIGGER tr_welcome_bonus
BEFORE INSERT ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.apply_welcome_bonus();
