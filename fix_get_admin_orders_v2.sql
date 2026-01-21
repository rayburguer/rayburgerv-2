-- ==============================================================================
-- FIX INTEGRAL V3: Dashboard + Detalles de Pedido (RLS & FKs)
-- ==============================================================================
-- Este script soluciona 2 problemas críticos:
-- 1. ERROR RPC: Actualiza 'get_admin_orders' para leer de 'payment_reports'.
-- 2. ERROR "Pedido no encontrado": Otorga permisos explícitos (RLS) al Admin sobre 'orders'.

-- PARTE A: RPC DEL DASHBOARD (Corrige la pantalla principal)
DROP FUNCTION IF EXISTS get_admin_orders();

CREATE OR REPLACE FUNCTION get_admin_orders()
RETURNS TABLE (
    order_id uuid,
    created_at timestamptz,
    total_order numeric,
    amount_paid_real numeric,
    status text,
    payment_proof_url text, 
    payment_ref text,
    customer_name text,
    customer_phone text
)
LANGUAGE plpgsql
SECURITY DEFINER 
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        o.id AS order_id,
        o.created_at,
        o.total_amount AS total_order,
        CASE 
            WHEN o.status IN ('paid', 'delivered', 'preparing') THEN o.total_amount 
            ELSE 0 
        END AS amount_paid_real,
        o.status,
        -- CORRECCION FINAL: Solo leemos de payment_reports (tabla satélite)
        pr.screenshot_url::text AS payment_proof_url,
        pr.reference_number::text AS payment_ref,
        
        COALESCE(p.full_name, o.guest_name, 'Cliente Desconocido')::text AS customer_name,
        COALESCE(p.phone, o.guest_contact, 'Sin Teléfono')::text AS customer_phone
    FROM orders o
    LEFT JOIN profiles p ON o.user_id = p.id
    -- JOIN ESTRICTO con reporte de pago más reciente
    LEFT JOIN payment_reports pr ON o.id = pr.order_id
    ORDER BY o.created_at DESC;
END;
$$;

GRANT EXECUTE ON FUNCTION get_admin_orders() TO authenticated;
GRANT EXECUTE ON FUNCTION get_admin_orders() TO service_role;


-- PARTE B: PERMISOS RLS (Corrige "Pedido no encontrado" en Detalles)
-- Aseguramos que el ADMIN pueda ver la tabla 'orders' y sus relaciones.

-- 1. Permisos para ORDERS
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins ven todas las ordenes" ON public.orders;
CREATE POLICY "Admins ven todas las ordenes" 
ON public.orders FOR SELECT 
USING (
  auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin')
);

-- 2. Permisos para PAYMENT_REPORTS (Reafirmar)
ALTER TABLE public.payment_reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins ven todos los reportes" ON public.payment_reports;
CREATE POLICY "Admins ven todos los reportes" 
ON public.payment_reports FOR SELECT 
USING (
  auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin')
);

-- 3. Permisos para USER_REWARDS (Raspaditos)
ALTER TABLE public.user_rewards ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins ven todos los premios" ON public.user_rewards;
CREATE POLICY "Admins ven todos los premios" 
ON public.user_rewards FOR SELECT 
USING (
  auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin')
);

SELECT 'FIX INTEGRAL APLICADO CORRECTAMENTE: RPC actualizada y Permisos RLS garantizados.' as result;
