-- ==============================================================================
-- REPARACIÓN TOTAL DE RPC (VERSION JSON - A PRUEBA DE BALAS)
-- Objetivo: Usar JSON para evitar errores de tipos estrictos de PostgREST.
-- ==============================================================================

DROP FUNCTION IF EXISTS get_admin_orders();

CREATE OR REPLACE FUNCTION get_admin_orders()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER 
SET search_path = public
AS $$
BEGIN
    RETURN (
        SELECT json_agg(t) FROM (
            SELECT 
                o.id AS order_id,
                o.created_at,
                o.total_amount AS total_order,
                CASE 
                    WHEN o.status IN ('paid', 'delivered', 'preparing') THEN o.total_amount 
                    ELSE 0 
                END AS amount_paid_real,
                o.status,
                o.payment_proof_url,
                (o.payment_details->>'reference') AS payment_ref,
                -- Lógica de Nombre: Prioridad Profile > Guest > 'Cliente Desconocido'
                COALESCE(p.full_name, o.guest_name, 'Cliente Desconocido') AS customer_name,
                COALESCE(p.phone, o.guest_contact, 'Sin Teléfono') AS customer_phone
            FROM orders o
            LEFT JOIN profiles p ON o.user_id = p.id
            ORDER BY o.created_at DESC
        ) t
    );
END;
$$;

-- Permisos
GRANT EXECUTE ON FUNCTION get_admin_orders() TO authenticated;
GRANT EXECUTE ON FUNCTION get_admin_orders() TO service_role;
