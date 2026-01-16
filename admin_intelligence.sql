-- ==============================================================================
-- ADMIN INTELLIGENCE LAYER
-- ==============================================================================

-- 1. VISTA: TOP PRODUCTOS (Ranking de Ventas)
-- Cuenta la cantidad total vendida de cada producto en órdenes ENTREGADAS.
CREATE OR REPLACE VIEW public.v_top_productos AS
SELECT 
    p.name,
    p.image_url,
    SUM(oi.quantity) as total_vendido
FROM order_items oi
JOIN orders o ON oi.order_id = o.id
JOIN products p ON oi.product_id = p.id
WHERE o.status = 'delivered' AND o.created_at >= NOW() - INTERVAL '7 days'
GROUP BY p.id, p.name, p.image_url
ORDER BY total_vendido DESC;

-- 2. VISTA: VENTAS POR HORA (Mapa de Calor)
-- Agrupa las órdenes ENTREGADAS por la hora del día (0-23) para detectar horas pico.
CREATE OR REPLACE VIEW public.v_ventas_por_hora AS
SELECT 
    EXTRACT(HOUR FROM created_at) as hora_del_dia,
    COUNT(*) as cantidad_pedidos
FROM orders
WHERE status = 'delivered' AND created_at >= NOW() - INTERVAL '7 days'
GROUP BY hora_del_dia
ORDER BY cantidad_pedidos DESC;
