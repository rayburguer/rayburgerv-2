-- ==============================================================================
-- LOGISTICS & PAYMENT SCHEMA UPDATE (STRICT MODE)
-- ==============================================================================

DO $$ 
BEGIN 
    -- 1. Add delivery_type to orders (Enforce 'pickup' or 'delivery')
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'delivery_type') THEN
        ALTER TABLE public.orders ADD COLUMN delivery_type text CHECK (delivery_type IN ('pickup', 'delivery'));
    END IF;

    -- 2. Add delivery_cost to orders (Ensure strict total handling)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'delivery_cost') THEN
        ALTER TABLE public.orders ADD COLUMN delivery_cost numeric DEFAULT 0;
    END IF;

    -- 3. Add delivery_zone to orders (Optional but good for analytics/debugging)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'delivery_zone') THEN
        ALTER TABLE public.orders ADD COLUMN delivery_zone text;
    END IF;

END $$;
