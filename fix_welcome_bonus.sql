-- FIX WELCOME BONUS (ANTI-DOUBLE DIP)
-- Ejecutar este script para corregir el bono de bienvenida doble.

CREATE OR REPLACE FUNCTION public.apply_welcome_bonus()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Idempotency Check: Si ya tiene saldo (por race condition o insert manual), NO dar bono.
    IF COALESCE(NEW.wallet_balance, 0) > 0 THEN
        RETURN NEW;
    END IF;

    -- Asignar saldo inicial
    NEW.wallet_balance := 0.50;
    RETURN NEW;
END;
$$;

-- Confirmación visual
SELECT 'Bono de bienvenida blindado correctamente.' as status;
