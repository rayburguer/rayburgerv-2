-- ==============================================================================
-- MÓDULO: CRM & MARKETING (RPC)
-- Objetivo: Segmentar usuarios para campañas de WhatsApp.
-- ==============================================================================

DROP FUNCTION IF EXISTS get_segmented_users(TEXT);

CREATE OR REPLACE FUNCTION get_segmented_users(target_level TEXT DEFAULT 'todos')
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result json;
BEGIN
    -- target_level options: 'oro', 'plata', 'bronce', 'todos'
    
    SELECT json_agg(t) INTO result FROM (
        SELECT 
            p.id,
            COALESCE(p.full_name, 'Cliente') as name,
            p.phone,
            v.user_level,
            v.puntos_actuales,
            p.last_sign_in_at
        FROM profiles p
        LEFT JOIN v_user_progress v ON p.id = v.user_id
        WHERE 
            p.phone IS NOT NULL 
            AND LENGTH(p.phone) >= 10 -- Solo teléfonos válidos
            AND (
                target_level = 'todos' 
                OR LOWER(v.user_level) = LOWER(target_level)
            )
        ORDER BY v.puntos_actuales DESC
    ) t;

    RETURN COALESCE(result, '[]'::json);
END;
$$;

-- Permisos
GRANT EXECUTE ON FUNCTION get_segmented_users(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_segmented_users(TEXT) TO service_role;
