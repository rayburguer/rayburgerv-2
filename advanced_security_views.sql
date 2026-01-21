-- ==============================================================================
-- SOLUCION "SENIOR SQL EXPERT" - RECUPERACIÓN DE VISTAS DE INTELIGENCIA
-- Objetivo: Restaurar v_influencer_stats y v_ventas_por_hora con máxima seguridad (Admin Only).
-- ==============================================================================

-- 1. VISTA: VENTAS POR HORA (Heatmap de Ventas)
-- Permite saber cuáles son las horas pico del negocio.
DROP VIEW IF EXISTS v_ventas_por_hora;

CREATE VIEW v_ventas_por_hora WITH (security_barrier) AS
SELECT 
    EXTRACT(HOUR FROM created_at AT TIME ZONE 'America/Caracas') AS hora_del_dia,
    COUNT(*) AS cantidad_pedidos,
    SUM(total_amount) AS total_facturato
FROM orders
WHERE status IN ('paid', 'delivered', 'preparing')
  -- SECURITY BARRIER: Solo Admin
  AND (
      auth.role() = 'service_role' 
      OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  )
GROUP BY 1
ORDER BY 1 ASC;


-- 2. VISTA: ESTADÍSTICAS DE INFLUENCERS (Referral Performance)
-- Muestra quiénes son los usuarios que más clientes traen y cuánto dinero generan.
DROP VIEW IF EXISTS v_influencer_stats;

CREATE VIEW v_influencer_stats WITH (security_barrier) AS
SELECT 
    p_inf.full_name AS influencer_name,
    p_inf.phone AS influencer_phone,
    COUNT(DISTINCT p_ref.id) AS total_referidos, -- Cuántos hijos tiene
    COALESCE(SUM(o.total_amount), 0) AS dinero_generado_por_red -- Cuánto han gastado sus hijos
FROM profiles p_inf
-- Unimos con los usuarios que dicen "fui referido por p_inf"
JOIN profiles p_ref ON p_ref.referred_by = p_inf.id
-- Unimos con las órdenes PAGADAS de esos referidos
LEFT JOIN orders o ON o.user_id = p_ref.id AND o.status IN ('paid', 'delivered')
WHERE 
  -- SECURITY BARRIER: Solo Admin
  (
      auth.role() = 'service_role' 
      OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  )
GROUP BY p_inf.id, p_inf.full_name, p_inf.phone
HAVING COUNT(DISTINCT p_ref.id) > 0 -- Solo mostrar gente que ha referido al menos a uno
ORDER BY dinero_generado_por_red DESC;


-- PERMISOS
-- Aunque tiene barrera de seguridad, otorgamos SELECT a authenticated para que el dashboard pueda consultarla
-- (Ya que el dashboard corre como usuario autenticado, pero la fila filtra si es admin o no).
GRANT SELECT ON v_ventas_por_hora TO authenticated;
GRANT SELECT ON v_influencer_stats TO authenticated;

SELECT 'Vistas de Inteligencia Restauradas y Blindadas' as result;
