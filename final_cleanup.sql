-- ==============================================================================
-- LIMPIEZA FINAL DE SEGURIDAD (ELIMINAR RUIDO + ASEGURAR RESTANTES)
-- Objetivo: Eliminar las vistas zombie que causan alertas y asegurar las útiles.
-- ==============================================================================

-- 1. ASEGURAR VISTA DE PROGRESO DE USUARIO (v_user_progress)
-- Detectada en backend_specs_final.sql
DROP VIEW IF EXISTS public.v_user_progress;
CREATE VIEW public.v_user_progress WITH (security_barrier) AS
SELECT 
    id as user_id,
    full_name,
    points,
    user_level,
    CASE 
        WHEN points < 5000 THEN 'Bronce'
        WHEN points < 20000 THEN 'Plata'
        ELSE 'Oro'
    END as nivel_calculado,
    CASE 
        WHEN points < 5000 THEN 5000 - points
        WHEN points < 20000 THEN 20000 - points
        ELSE 0
    END as falta_para_siguiente_nivel,
    CASE 
        WHEN points < 5000 THEN ROUND((points::numeric / 5000) * 100, 1)
        WHEN points < 20000 THEN ROUND(((points - 5000)::numeric / 15000) * 100, 1)
        ELSE 100
    END as porcentaje_progreso,
    (10000 - (points % 10000)) as puntos_para_burger_gratis
FROM public.profiles
WHERE 
  -- SEGURIDAD: Un usuario solo puede ver SU propio progreso, o un admin ver el de todos.
  (auth.uid() = id OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

GRANT SELECT ON public.v_user_progress TO authenticated;


-- 2. ELIMINAR VISTAS "ZOMBIE" (LEGACY / NO USADAS)
-- Estas vistas aparecen en el reporte pero no están en el código actual.
-- Al borrarlas, eliminamos el riesgo de seguridad y el mensaje de error.

DROP VIEW IF EXISTS public.v_top_productos; -- Requiere order_items que no está estandarizado aun.
DROP VIEW IF EXISTS public.v_business_health; -- Redundante con get_admin_stats
DROP VIEW IF EXISTS public.v_admin_dashboard_v3; -- Versión vieja
DROP VIEW IF EXISTS public.v_reporte_ventas_diar; -- Redundante con v_stats_ventas
DROP VIEW IF EXISTS public.v_best_sellers; -- Redundante

-- 3. RE-ASEGURAR MENU COMPLETO (Por si acaso)
CREATE OR REPLACE VIEW public.v_menu_completo AS
SELECT 
    p.id, p.name, p.description, p.image_url, p.category, p.price_usd,
    ROUND(p.price_usd * (SELECT value::numeric FROM public.app_config WHERE key = 'tasa_dolar'), 2) as precio_bs,
    (SELECT value FROM public.app_config WHERE key = 'tasa_dolar') as tasa_referencia
FROM public.products p
WHERE p.is_active = true;

GRANT SELECT ON public.v_menu_completo TO anon, authenticated;


SELECT 'Limpieza Final Completada: Vistas Zombie Eliminadas y UserProgress Asegurada' as result;
