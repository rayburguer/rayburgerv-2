-- ==============================================================================
-- RESTAURACIÓN DE VISTA CRÍTICA ADMIN
-- Objetivo: Restaurar la vista v_admin_pending_orders que desapareció/se rompió.
-- ==============================================================================

DROP VIEW IF EXISTS v_admin_pending_orders;

CREATE OR REPLACE VIEW v_admin_pending_orders AS
SELECT 
    o.id AS order_id,
    o.created_at,
    o.total_amount AS total_order,
    o.status,
    o.payment_proof_url,
    -- Datos del Usuario (o Invitado)
    COALESCE(p.full_name, o.guest_name, 'Cliente Desconocido') AS customer_name,
    COALESCE(p.phone, o.guest_contact, 'Sin Teléfono') AS customer_phone,
    -- Cálculos de Pago Real (Amount Paid)
    -- Si hay payment_ref, asumimos pagado total o parcial. 
    -- Para simplificar V3: Monto Pagado = Total Orden (si es paid/delivered)
    CASE 
        WHEN o.status IN ('paid', 'delivered', 'preparing') THEN o.total_amount 
        ELSE 0 
    END AS amount_paid_real,
    -- Referencia Pago
    (o.payment_details->>'reference') AS payment_ref
FROM orders o
LEFT JOIN profiles p ON o.user_id = p.id;

-- Permisos
GRANT SELECT ON v_admin_pending_orders TO authenticated;
GRANT SELECT ON v_admin_pending_orders TO service_role;
