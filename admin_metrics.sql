-- ==============================================================================
-- MÓDULO: ANALÍTICA Y DASHBOARD ADMIN (Sprint A - Parte 2)
-- Objetivo: Obtener KPIs del negocio en tiempo real (Caja, Pasivos, Usuarios)
-- ==============================================================================

-- 1. Función RPC para obtener estadísticas globales
CREATE OR REPLACE FUNCTION get_admin_stats()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER -- Se ejecuta con permisos de superusuario para leer todo
AS $$
DECLARE
    result json;
BEGIN
    SELECT json_build_object(
        -- KPI 1: Ventas de HOY (Dinero real en caja)
        -- Sumamos órdenes pagadas o entregadas creadas hoy
        'sales_today', (
            SELECT COALESCE(SUM(total_amount), 0)
            FROM orders
            WHERE DATE(created_at AT TIME ZONE 'America/Caracas') = DATE(NOW() AT TIME ZONE 'America/Caracas')
            AND status IN ('paid', 'delivered', 'preparing') 
        ),
        
        -- KPI 2: Pasivo de Puntos (Deuda Latente)
        -- Cuántos puntos tienen los usuarios en sus bolsillos (potencial canje)
        'points_liability', (
            SELECT COALESCE(SUM(points), 0)
            FROM profiles
        ),

        -- KPI 3: Total Usuarios (Crecimiento)
        -- Excluyendo a los admins
        'total_users', (
            SELECT COUNT(*) FROM profiles WHERE role != 'admin'
        ),

        -- KPI 4: Órdenes Activas (Cocina)
        -- Para saber qué se está cocinando ahora mismo
        'active_orders', (
            SELECT COUNT(*) FROM orders WHERE status IN ('paid', 'preparing')
        )
    ) INTO result;

    RETURN result;
END;
$$;

-- 2. Función RPC para gráfico semanal (Últimos 7 días)
CREATE OR REPLACE FUNCTION get_weekly_sales()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result json;
BEGIN
    SELECT json_agg(t) INTO result
    FROM (
        SELECT
            to_char(day_series, 'Dy') as day, -- Mon, Tue... (Depende de locale DB, pero fiable para demo)
            COALESCE(SUM(total_amount), 0) as total
        FROM generate_series(
            date_trunc('day', NOW() AT TIME ZONE 'America/Caracas') - interval '6 days',
            date_trunc('day', NOW() AT TIME ZONE 'America/Caracas'),
            '1 day'::interval
        ) as day_series
        LEFT JOIN orders o ON
            DATE(o.created_at AT TIME ZONE 'America/Caracas') = DATE(day_series)
            AND status IN ('paid', 'delivered', 'preparing')
        GROUP BY 1, day_series
        ORDER BY day_series
    ) t;

    RETURN result; -- Retorna array de objetos [{day: 'Mon', total: 120}, ...]
END;
$$;
