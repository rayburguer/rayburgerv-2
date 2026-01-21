-- ==============================================================================
-- ACCESO PÚBLICO (CONTROLADO) A PEDIDOS DE INVITADOS
-- Permitimos que la página de confirmación lea el pedido usando solo el UUID.
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.get_public_order_details(p_order_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER -- Ejecuta como admin para saltar RLS
SET search_path = public
AS $$
DECLARE
    v_order json;
BEGIN
    SELECT json_build_object(
        'id', o.id,
        'user_id', o.user_id,
        'guest_name', o.guest_name,
        'guest_contact', o.guest_contact,
        'total_amount', o.total_amount,
        'status', o.status,
        'delivery_type', o.delivery_type,
        'delivery_zone', o.delivery_zone,
        'delivery_cost', o.delivery_cost,
        'created_at', o.created_at,
        'items', (
            SELECT json_agg(json_build_object(
                'quantity', oi.quantity,
                'unit_price', oi.unit_price,
                'customization', oi.customization,
                'product', (SELECT json_build_object('name', p.name) FROM products p WHERE p.id = oi.product_id)
            ))
            FROM order_items oi
            WHERE oi.order_id = o.id
        ),
        'user', (
            SELECT json_build_object(
                'email', u.email,
                'full_name', u.full_name,
                'phone', u.phone
            )
            FROM profiles u
            WHERE u.id = o.user_id
        )
    ) INTO v_order
    FROM orders o
    WHERE o.id = p_order_id;
    
    RETURN v_order;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_public_order_details TO anon, authenticated;
