-- 1. Limpieza total de la vista con error
DROP VIEW IF EXISTS public.v_business_health;

-- 2. Asegurar que la tabla tenga los nombres que el Frontend espera
-- Usamos "rating_sabor", etc., que es lo que pide el código
CREATE TABLE IF NOT EXISTS public.order_feedback (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id uuid REFERENCES public.orders(id) NOT NULL UNIQUE,
    user_id uuid REFERENCES public.profiles(id) NOT NULL,
    rating_sabor integer CHECK (rating_sabor BETWEEN 1 AND 10),
    rating_atencion integer CHECK (rating_atencion BETWEEN 1 AND 10),
    rating_tiempo integer CHECK (rating_tiempo BETWEEN 1 AND 10),
    rating_empaque integer CHECK (rating_empaque BETWEEN 1 AND 10),
    comment text,
    created_at timestamptz DEFAULT now()
);

-- 3. Crear la Vista de Salud con los nombres de columna correctos
CREATE OR REPLACE VIEW public.v_business_health AS
SELECT 
    COUNT(id) as total_reviews,
    ROUND(AVG(rating_sabor), 1) as avg_sabor,
    ROUND(AVG(rating_atencion), 1) as avg_atencion,
    ROUND(AVG(rating_tiempo), 1) as avg_tiempo,
    ROUND(AVG(rating_empaque), 1) as avg_empaque,
    ROUND((AVG(rating_sabor) + AVG(rating_atencion) + AVG(rating_tiempo) + AVG(rating_empaque)) / 4, 1) as overall_score
FROM public.order_feedback;

-- 4. Función de Recompensa Ajustada a $0.25
CREATE OR REPLACE FUNCTION process_feedback_reward()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER 
AS $$
BEGIN
    -- Sumar los $0.25 de premio
    UPDATE profiles 
    SET wallet_balance = COALESCE(wallet_balance, 0) + 0.25
    WHERE id = NEW.user_id;

    -- Registrar la transacción
    INSERT INTO wallet_transactions (profile_id, amount, type, description, order_id)
    VALUES (NEW.user_id, 0.25, 'reward', 'Bono por Feedback Pedido #' || SUBSTRING(NEW.order_id::text, 1, 8), NEW.order_id);
    
    RETURN NEW;
END;
$$;

-- 5. Reactivar el Trigger
DROP TRIGGER IF EXISTS on_feedback_created ON order_feedback;
CREATE TRIGGER on_feedback_created
AFTER INSERT ON order_feedback
FOR EACH ROW
EXECUTE FUNCTION process_feedback_reward();
