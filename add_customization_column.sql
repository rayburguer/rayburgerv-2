-- ==============================================================================
-- ADD CUSTOMIZATION TO ORDER ITEMS
-- ==============================================================================

-- Agregar columna JSONB para guardar modificadores (Sin Cebolla, Extra Bacon, etc.)
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'order_items' AND column_name = 'customization') THEN
        ALTER TABLE public.order_items ADD COLUMN customization JSONB;
    END IF;
END $$;
