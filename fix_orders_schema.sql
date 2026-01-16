-- ALERTA: Ejecuta esto si obtienes error "column total_amount does not exist"
-- Esto creará la columna que falta en la tabla 'orders'.

DO $$ 
BEGIN 
    -- 1. Verificar si existe 'total_amount', si no, crearla
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'total_amount') THEN
        ALTER TABLE orders ADD COLUMN total_amount numeric DEFAULT 0;
    END IF;

    -- 2. (Opcional) Verificar si existe 'total' errónea y quizás migrar datos (si fuera el caso)
    -- Si 'total' existe y 'total_amount' estaba vacía, podrías querer copiar datos, 
    -- pero por seguridad solo añadimos la correcta.
END $$;

-- 3. Asegurar permisos (si aplica)
GRANT ALL ON orders TO authenticated;
GRANT ALL ON orders TO service_role;
