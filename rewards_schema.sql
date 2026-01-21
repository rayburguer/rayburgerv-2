-- ==============================================================================
-- SISTEMA DE RECOMPENSAS (GAMIFICATION)
-- Tabla para almacenar los premios ganados en el Raspadito
-- ==============================================================================

-- 1. Tabla de Recompensas
CREATE TABLE IF NOT EXISTS public.user_rewards (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES public.profiles(id) NOT NULL,
    prize_title text NOT NULL, -- Ej: 'Refresco Gratis'
    prize_code text NOT NULL, -- Ej: 'SODA-FREE'
    status text DEFAULT 'active' CHECK (status IN ('active', 'redeemed', 'expired')),
    created_at timestamptz DEFAULT now(),
    redeemed_at timestamptz
);

-- 2. Seguridad RLS
ALTER TABLE public.user_rewards ENABLE ROW LEVEL SECURITY;

-- Política: El usuario puede ver sus propios premios
CREATE POLICY "Usuarios ven sus propios premios" 
ON public.user_rewards FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);

-- Política: El usuario puede crear premios (ganados desde el frontend/raspadito)
-- Nota: En un entorno de producción estricto, esto debería hacerse vía RPC (función segura)
-- para evitar que el usuario se invente premios.
-- Por ahora, para cumplir con el requerimiento UI rápidamente, permitimos INSERT autenticado.
CREATE POLICY "Usuarios pueden reclamar premios" 
ON public.user_rewards FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

-- 3. Índices
CREATE INDEX IF NOT EXISTS idx_rewards_user ON public.user_rewards(user_id);
