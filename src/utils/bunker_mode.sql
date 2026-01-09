-- ########################################################
-- # BUNKER MODE: RAYBURGER DATABASE SECURITY HARDENING   #
-- ########################################################

-- 1. SCHEMA HARDENING (profiles)
-- Ensure birth_date is mandatory and phone is unique
ALTER TABLE public.profiles 
    ALTER COLUMN birth_date SET NOT NULL,
    ADD CONSTRAINT profiles_unique_phone UNIQUE (phone);

-- 2. SECURITY (RLS - Row Level Security)

-- Enable RLS on all critical tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rewards ENABLE ROW LEVEL SECURITY;

-- POLICIES FOR 'PROFILES'
-- Users can read their own profile
CREATE POLICY "Users can view own profile" 
ON public.profiles FOR SELECT 
USING (auth.uid() = id);

-- Users can update their own profile (limited fields usually, but for now simple)
CREATE POLICY "Users can update own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = id);

-- Admins can do everything
CREATE POLICY "Admins have full access to profiles" 
ON public.profiles FOR ALL 
USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role = 'admin'
    )
);

-- POLICIES FOR 'ORDERS'
-- Users can view their own orders
CREATE POLICY "Users can view own orders" 
ON public.orders FOR SELECT 
USING (auth.uid() = user_id);

-- Admins can view and update all orders
CREATE POLICY "Admins have full access to orders" 
ON public.orders FOR ALL 
USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role = 'admin'
    )
);

-- POLICIES FOR 'FEEDBACK'
-- Users can insert feedback
CREATE POLICY "Users can insert own feedback" 
ON public.feedback FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Admins can view all feedback
CREATE POLICY "Admins can view feedback" 
ON public.feedback FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role = 'admin'
    )
);

-- POLICIES FOR 'REWARDS'
-- Authenticated users can see rewards (to claim them)
CREATE POLICY "Authenticated users can view rewards" 
ON public.rewards FOR SELECT 
TO authenticated 
USING (TRUE);

-- Only admins can manage rewards
CREATE POLICY "Admins can manage rewards" 
ON public.rewards FOR ALL 
USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role = 'admin'
    )
);

-- 3. FOUNDER LOCK: TRIGGER para limitar a 20 fundadores
-- Esta es la lógica de blindaje nivel base de datos

CREATE OR REPLACE FUNCTION enforce_founder_limit()
RETURNS TRIGGER AS $$
BEGIN
    -- Solo actuar si el nuevo registro intenta ser fundador
    IF NEW.is_founder = TRUE THEN
        -- Si ya hay 20 fundadores (excluyendo el registro actual si es un UPDATE)
        IF (SELECT count(*) FROM public.profiles WHERE is_founder = TRUE AND id <> NEW.id) >= 20 THEN
            RAISE EXCEPTION 'Bunker Error: Se ha alcanzado el límite máximo de 20 Socios Fundadores.';
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_enforce_founder_limit ON public.profiles;
CREATE TRIGGER trigger_enforce_founder_limit
BEFORE INSERT OR UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION enforce_founder_limit();

-- NOTA: El trigger anterior `trigger_check_founder` de marketing_migration.sql 
-- se encargaba de asignar automáticamente el status a los primeros 20. 
-- Este nuevo trigger lo "asegura" (bloquea cualquier intento manual posterior).
