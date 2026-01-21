-- ==============================================================================
-- SEGURIDAD AVANZADA (CIERRE DE BRECHAS EN VISTAS) - VERSION CORREGIDA
-- Problema: Error "column o.payment_proof_url does not exist".
-- Solución: Igual que en el RPC, hacemos JOIN con payment_reports para sacar la foto.
-- ==============================================================================

-- Vista 1: VENTAS (Stats financieras)
DROP VIEW IF EXISTS v_stats_ventas;
CREATE VIEW v_stats_ventas WITH (security_barrier) AS
SELECT 
    DATE(created_at) as fecha,
    COUNT(*) as total_orders,
    SUM(total_amount) as total_money
FROM orders
WHERE status IN ('paid', 'delivered')
  -- SOLO ADMINS PUEDEN VER ESTO
  AND (
      auth.role() = 'service_role' 
      OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  )
GROUP BY 1;

-- Vista 2: PENDIENTES ADMIN (CORREGIDA)
DROP VIEW IF EXISTS v_admin_pending_orders;
CREATE VIEW v_admin_pending_orders WITH (security_barrier) AS
SELECT 
    o.id AS order_id,
    o.created_at,
    o.total_amount AS total_order,
    o.status,
    -- CORRECCION: Sacamos el screenshot de payment_reports
    pr.screenshot_url AS payment_proof_url,
    COALESCE(p.full_name, o.guest_name, 'Cliente Desconocido') AS customer_name,
    COALESCE(p.phone, o.guest_contact, 'Sin Teléfono') AS customer_phone
FROM orders o
LEFT JOIN profiles p ON o.user_id = p.id
-- JOIN con payment_reports para la imagen
LEFT JOIN payment_reports pr ON o.id = pr.order_id
WHERE 
  -- SOLO ADMINS
  (
      auth.role() = 'service_role' 
      OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Vista 3: PUBLIC MENU (Esta sí debe ser publica, pero la hacemos segura)
DROP VIEW IF EXISTS v_menu_completo;
CREATE VIEW v_menu_completo AS
SELECT 
    p.id, 
    p.name, 
    p.description, 
    p.price_usd, 
    p.image_url, 
    c.name as category_name
FROM products p
JOIN categories c ON p.category_id = c.id
WHERE p.is_active = true AND p.is_archived = false;

-- PERMISOS EXPLICITOS
GRANT SELECT ON v_stats_ventas TO authenticated;
GRANT SELECT ON v_admin_pending_orders TO authenticated;
GRANT SELECT ON v_menu_completo TO anon, authenticated;

-- Mensaje de éxito
SELECT 'Vistas aseguradas y corregidas (JOIN payment_reports)' as result;
