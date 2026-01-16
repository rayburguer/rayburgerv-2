-- ==============================================================================
-- REPARACIÓN TOTAL DE RPC (GET_ADMIN_ORDERS)
-- Objetivo: Borrar cualquier versión corrupta y levantar el acceso blindado.
-- ==============================================================================

-- 1. Eliminar versiones previas (para evitar errores de firma)
DROP FUNCTION IF EXISTS get_admin_orders();

-- 2. Crear Función Blindada (Security Definer)
-- NOTA: Usamos RETURNS TABLE para compatibilidad con el frontend
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
        -- Lógica de monto pagado
        CASE 
            WHEN o.status IN ('paid', 'delivered', 'preparing') THEN o.total_amount 
            ELSE 0 
        END AS amount_paid_real,
        o.status,
        o.payment_proof_url,
        (o.payment_details->>'reference') AS payment_ref,
        -- JOIN COALESCE: Si p.full_name es null, busca guest_name, sino 'Desconocido'
        COALESCE(p.full_name, o.guest_name, 'Cliente Desconocido') AS customer_name,
        COALESCE(p.phone, o.guest_contact, 'Sin Teléfono') AS customer_phone
    FROM orders o
    LEFT JOIN profiles p ON o.user_id = p.id
    ORDER BY o.created_at DESC;
END;
$$;

-- 3. Permisos
GRANT EXECUTE ON FUNCTION get_admin_orders() TO authenticated;
GRANT EXECUTE ON FUNCTION get_admin_orders() TO service_role;
