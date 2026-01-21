-- ==============================================================================
-- SOLUCIÓN FINAL DEFINITIVA (V2) - "TODO EN UNO"
-- Este script reemplaza a TODOS los anteriores. Ejecútalo para limpiar los 89 errores.
-- ==============================================================================
-- OBJETIVO:
-- 1. Activar RLS en tablas faltantes (delivery_zones, app_config).
-- 2. Convertir Vistas a "SECURITY INVOKER" (Estándar Seguro) para eliminar advertencias.
-- 3. Mantener funcional el Dashboard y el Menú.

-- ------------------------------------------------------------------------------
-- PARTE 1: TABLAS FALTANTES (RLS)
-- ------------------------------------------------------------------------------

-- App Config
ALTER TABLE IF EXISTS public.app_config ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read config" ON public.app_config;
CREATE POLICY "Public read config" ON public.app_config FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admin manage config" ON public.app_config;
CREATE POLICY "Admin manage config" ON public.app_config FOR ALL USING (
  auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin')
);

-- Delivery Zones
ALTER TABLE IF EXISTS public.delivery_zones ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read zones" ON public.delivery_zones;
CREATE POLICY "Public read zones" ON public.delivery_zones FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admin manage zones" ON public.delivery_zones;
CREATE POLICY "Admin manage zones" ON public.delivery_zones FOR ALL USING (
  auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin')
);

-- ------------------------------------------------------------------------------
-- PARTE 2: CORRECCIÓN DE VISTAS (SECURITY INVOKER)
-- Al usar security_invoker=true, la vista respeta el RLS de las tablas base.
-- Esto satisface a Supabase y es más seguro.
-- ------------------------------------------------------------------------------

-- 2.1 MENU COMPLETO (Público)
DROP VIEW IF EXISTS public.v_menu_completo;
CREATE VIEW public.v_menu_completo WITH (security_invoker=true, security_barrier=true) AS
SELECT 
    p.id, p.name, p.description, p.image_url, p.category, p.price_usd,
    ROUND(p.price_usd * (SELECT value::numeric FROM public.app_config WHERE key = 'tasa_dolar'), 2) as precio_bs,
    (SELECT value FROM public.app_config WHERE key = 'tasa_dolar') as tasa_referencia
FROM public.products p
WHERE p.is_active = true;

-- 2.2 VENTAS POR HORA (Admin)
DROP VIEW IF EXISTS public.v_ventas_por_hora;
CREATE VIEW public.v_ventas_por_hora WITH (security_invoker=true, security_barrier=true) AS
SELECT 
    EXTRACT(HOUR FROM created_at) AS hora_del_dia,
    COUNT(*) AS cantidad_pedidos,
    SUM(total_amount) AS total_facturato
FROM orders
WHERE status IN ('paid', 'delivered', 'preparing')
GROUP BY 1
ORDER BY 1 ASC;

-- 2.3 INFLUENCER STATS (Admin)
DROP VIEW IF EXISTS public.v_influencer_stats;
CREATE VIEW public.v_influencer_stats WITH (security_invoker=true, security_barrier=true) AS
SELECT 
    p_inf.full_name AS influencer_name,
    p_inf.phone AS influencer_phone,
    COUNT(DISTINCT p_ref.id) AS total_referidos,
    COALESCE(SUM(o.total_amount), 0) AS dinero_generado_por_red
FROM profiles p_inf
JOIN profiles p_ref ON p_ref.referred_by = p_inf.id
LEFT JOIN orders o ON o.user_id = p_ref.id AND o.status IN ('paid', 'delivered')
GROUP BY p_inf.id, p_inf.full_name, p_inf.phone
HAVING COUNT(DISTINCT p_ref.id) > 0
ORDER BY dinero_generado_por_red DESC;

-- 2.4 PENDING ORDERS (Admin)
DROP VIEW IF EXISTS public.v_admin_pending_orders;
CREATE VIEW public.v_admin_pending_orders WITH (security_invoker=true, security_barrier=true) AS
SELECT 
    o.id AS order_id,
    o.created_at,
    o.total_amount AS total_order,
    o.status,
    pr.screenshot_url AS payment_proof_url,
    COALESCE(p.full_name, o.guest_name, 'Cliente Desconocido') AS customer_name,
    COALESCE(p.phone, o.guest_contact, 'Sin Teléfono') AS customer_phone
FROM orders o
LEFT JOIN profiles p ON o.user_id = p.id
LEFT JOIN payment_reports pr ON o.id = pr.order_id;
-- NOTA: Al ser INVOKER, si un usuario normal consulta esto, el RLS de 'orders' le bloqueará (o le mostrará solo SUS ordenes). Perfecto.

-- 2.5 TOP PRODUCTOS (Admin)
DROP VIEW IF EXISTS public.v_top_productos;
CREATE VIEW public.v_top_productos WITH (security_invoker=true, security_barrier=true) AS
SELECT 
    p.name,
    p.image_url,
    SUM(oi.quantity) as total_vendido
FROM order_items oi
JOIN orders o ON oi.order_id = o.id
JOIN products p ON oi.product_id = p.id
WHERE o.status IN ('paid', 'delivered') 
  AND o.created_at >= NOW() - INTERVAL '30 days'
GROUP BY p.id, p.name, p.image_url
ORDER BY total_vendido DESC;

-- 2.6 BUSINESS HEALTH (Admin)
DROP VIEW IF EXISTS public.v_business_health;
CREATE VIEW public.v_business_health WITH (security_invoker=true, security_barrier=true) AS
SELECT 
    COUNT(id) as total_reviews,
    ROUND(AVG(rating_sabor), 1) as avg_sabor,
    ROUND(AVG(rating_atencion), 1) as avg_atencion,
    ROUND(AVG(rating_tiempo), 1) as avg_tiempo,
    ROUND(AVG(rating_empaque), 1) as avg_empaque,
    ROUND((AVG(rating_sabor) + AVG(rating_atencion) + AVG(rating_tiempo) + AVG(rating_empaque)) / 4, 1) as overall_score
FROM public.order_feedback;


SELECT 'SOLUCION FINAL V2 APLICADA: Tablas Aseguradas y Vistas convertidas a INVOKER.' as result;
