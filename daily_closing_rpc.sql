-- ==============================================================================
-- MÓDULO: CIERRE DE CAJA (RPC)
-- Objetivo: Generar reporte financiero del día con desglose.
-- ==============================================================================

DROP FUNCTION IF EXISTS generate_daily_closing(DATE);

CREATE OR REPLACE FUNCTION generate_daily_closing(report_date DATE DEFAULT CURRENT_DATE)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result json;
    
    -- Variables para totales
    v_total_sales NUMERIC;
    v_total_orders INTEGER;
    
    -- Desglose
    v_pickup_count INTEGER;
    v_delivery_count INTEGER;
    v_pickup_total NUMERIC;
    v_delivery_total NUMERIC;
BEGIN
    -- 1. Totales Generales (Status Validados)
    SELECT 
        COALESCE(SUM(total_amount), 0),
        COUNT(*)
    INTO 
        v_total_sales,
        v_total_orders
    FROM orders
    WHERE 
        DATE(created_at AT TIME ZONE 'America/Caracas') = report_date
        AND status IN ('paid', 'delivered', 'completed', 'preparing'); -- Incluimos 'preparing' = dinero ya entró

    -- 2. Desglose Pickup
    SELECT 
        COALESCE(COUNT(*), 0),
        COALESCE(SUM(total_amount), 0)
    INTO 
        v_pickup_count,
        v_pickup_total
    FROM orders
    WHERE 
        DATE(created_at AT TIME ZONE 'America/Caracas') = report_date
        AND status IN ('paid', 'delivered', 'completed', 'preparing')
        AND delivery_type = 'pickup';

    -- 3. Desglose Delivery
    SELECT 
        COALESCE(COUNT(*), 0),
        COALESCE(SUM(total_amount), 0)
    INTO 
        v_delivery_count,
        v_delivery_total
    FROM orders
    WHERE 
        DATE(created_at AT TIME ZONE 'America/Caracas') = report_date
        AND status IN ('paid', 'delivered', 'completed', 'preparing')
        AND delivery_type = 'delivery';

    -- Construir JSON Final
    SELECT json_build_object(
        'date', report_date,
        'total_sales', v_total_sales,
        'total_orders', v_total_orders,
        'summary', json_build_object(
            'pickup_count', v_pickup_count,
            'pickup_total', v_pickup_total,
            'delivery_count', v_delivery_count,
            'delivery_total', v_delivery_total
        )
    ) INTO result;

    RETURN result;
END;
$$;

-- Permisos
GRANT EXECUTE ON FUNCTION generate_daily_closing(DATE) TO authenticated;
GRANT EXECUTE ON FUNCTION generate_daily_closing(DATE) TO service_role;
