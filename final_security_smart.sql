-- ==============================================================================
-- INFORME SENIOR & LIMPIEZA INTELIGENTE (SMART CLEANUP)
-- Análisis exhaustivo de dependencias y redundancias.
-- ==============================================================================

-- 1. VISTAS ACTIVAS (CRÍTICAS - NO BORRAR)
-- Estas vistas se están usando en el código fuente actual (src/app/...).
-- ACCIÓN: Asegurar con RLS (Admin Only) en lugar de borrar.

-- A. TOP PRODUCTOS (Usada en admin-products.ts)
-- Problema original: Security Definer. Solución: Security Barrier + Admin Check.
DROP VIEW IF EXISTS public.v_top_productos;
CREATE VIEW public.v_top_productos WITH (security_barrier) AS
SELECT 
    p.name,
    p.image_url,
    SUM(oi.quantity) as total_vendido
FROM order_items oi
JOIN orders o ON oi.order_id = o.id
JOIN products p ON oi.product_id = p.id
WHERE o.status IN ('paid', 'delivered') 
  AND o.created_at >= NOW() - INTERVAL '30 days' -- Optimización Senior: Limitar a 30 días para queries rápidas
  -- SEGURIDAD: Solo Admin
  AND (auth.role() = 'service_role' OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))
GROUP BY p.id, p.name, p.image_url
ORDER BY total_vendido DESC;
GRANT SELECT ON public.v_top_productos TO authenticated;


-- B. BUSINESS HEALTH (Usada en admin/page.tsx)
-- Problema original: Security Definer. Solución: Security Barrier.
DROP VIEW IF EXISTS public.v_business_health;
CREATE VIEW public.v_business_health WITH (security_barrier) AS
SELECT 
    COUNT(id) as total_reviews,
    ROUND(AVG(rating_sabor), 1) as avg_sabor,
    ROUND(AVG(rating_atencion), 1) as avg_atencion,
    ROUND(AVG(rating_tiempo), 1) as avg_tiempo,
    ROUND(AVG(rating_empaque), 1) as avg_empaque,
    ROUND((AVG(rating_sabor) + AVG(rating_atencion) + AVG(rating_tiempo) + AVG(rating_empaque)) / 4, 1) as overall_score
FROM public.order_feedback
WHERE
  -- SEGURIDAD: Solo Admin
  (auth.role() = 'service_role' OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
GRANT SELECT ON public.v_business_health TO authenticated;


-- 2. VISTAS ZOMBIES (CONFIRMADAS - BORRAR)
-- Análisis de grep en src/: 0 resultados. 
-- Son redundantes con las nuevas v_stats_ventas y v_ventas_por_hora.
DROP VIEW IF EXISTS public.v_reporte_ventas_diar; -- Reemplazada por v_stats_ventas
DROP VIEW IF EXISTS public.v_best_sellers; -- Redundante con v_top_productos
DROP VIEW IF EXISTS public.v_admin_dashboard_v3; -- Deprecada v3


-- 3. FUNCIONES CRÍTICAS (Welcome Bonus & Feedback)
-- Se detectó vulnerabilidad "Mutable Search Path". Se parchean aquí.
CREATE OR REPLACE FUNCTION public.process_feedback_reward()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER 
SET search_path = public -- FIX
AS $$
BEGIN
    UPDATE profiles SET wallet_balance = COALESCE(wallet_balance, 0) + 0.25 WHERE id = NEW.user_id;
    INSERT INTO wallet_transactions (profile_id, amount, type, description, order_id)
    VALUES (NEW.user_id, 0.25, 'reward', 'Bono Feedback', NEW.order_id);
    RETURN NEW;
END;
$$;


SELECT 'Limpieza Inteligente Completada: 2 Vistas Salvadas y Aseguradas, 3 Zombies Eliminados.' as result;
