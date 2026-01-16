-- ==============================================================================
-- ADMIN TOTAL CONTROL - SCHEMA UPDATE
-- ==============================================================================

-- 1. CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS public.categories (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL,
    slug text NOT NULL,
    created_at timestamptz DEFAULT now()
);

-- Migrate existing categories from products table (safely)
INSERT INTO public.categories (name, slug)
SELECT DISTINCT category, lower(replace(category, ' ', '-'))
FROM public.products
WHERE category IS NOT NULL
ON CONFLICT DO NOTHING;

-- 2. PRODUCTS UPDATE (Soft Delete & Category FK)
DO $$ 
BEGIN 
    -- Add category_id if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'category_id') THEN
        ALTER TABLE public.products ADD COLUMN category_id uuid REFERENCES public.categories(id);
    END IF;

    -- Backfill category_id based on name matching (Best effort migration)
    UPDATE public.products p
    SET category_id = c.id
    FROM public.categories c
    WHERE p.category = c.name
    AND p.category_id IS NULL;

    -- Add is_archived for Soft Delete logic (Protect Order History)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'is_archived') THEN
        ALTER TABLE public.products ADD COLUMN is_archived boolean DEFAULT false;
    END IF;
END $$;

-- 3. PRODUCT MODIFIERS TABLE
CREATE TABLE IF NOT EXISTS public.product_modifiers (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL,
    type text CHECK (type IN ('base', 'extra', 'special')),
    price_usd numeric DEFAULT 0,
    is_active boolean DEFAULT true,
    created_at timestamptz DEFAULT now()
);

-- 4. SALES STATS VIEW (v_stats_ventas)
-- Usamos 'total_amount' de la tabla orders para evitar errores si 'amount_paid_real' no existe física en la tabla.
-- 'pedidos_entregados' se basa en status='completed'.
CREATE OR REPLACE VIEW public.v_stats_ventas AS
SELECT 
    -- Ventas HOY: Suma de total_amount de ordenes completadas hoy (Timezone: Caracas)
    COALESCE((SELECT SUM(total_amount) FROM orders WHERE status = 'delivered' AND DATE(created_at AT TIME ZONE 'America/Caracas') = DATE(NOW() AT TIME ZONE 'America/Caracas')), 0) as ventas_totales,
    -- Pedidos HOY
    (SELECT COUNT(*) FROM orders WHERE status = 'delivered' AND DATE(created_at AT TIME ZONE 'America/Caracas') = DATE(NOW() AT TIME ZONE 'America/Caracas')) as pedidos_entregados,
    -- Clientes Registrados (Este sí es histórico acumulado)
    (SELECT COUNT(*) FROM profiles) as clientes_registrados;
