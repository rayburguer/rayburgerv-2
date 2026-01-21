-- ==============================================================================
-- FIX RETROACTIVO DE NOMBRES DE USUARIO
-- Objetivo: Corregir los usuarios que ya se registraron pero quedaron con 
-- "Usuario Rayburger". Recuperamos su nombre real desde la metadata de Auth.
-- ==============================================================================

DO $$
DECLARE
    rows_updated integer;
BEGIN
    -- Ejecutamos la actualización cruzando la tabla Profiles con Auth.Users
    UPDATE public.profiles p
    SET 
        -- Si hay nombre en metadata, úsalo. Si no, deja el que está.
        full_name = COALESCE(u.raw_user_meta_data->>'full_name', p.full_name),
        -- Lo mismo para el teléfono por si acaso
        phone = COALESCE(u.raw_user_meta_data->>'phone', p.phone)
    FROM auth.users u
    WHERE p.id = u.id
    -- Condición: Solo corregir los que tienen el nombre genérico o están vacíos
    AND (p.full_name ILIKE '%Usuario Rayburger%' OR p.full_name IS NULL OR p.full_name = '')
    -- Y asegurar que tengamos data real para corregir
    AND (u.raw_user_meta_data->>'full_name') IS NOT NULL;

    GET DIAGNOSTICS rows_updated = ROW_COUNT;
    RAISE NOTICE 'Se corrigieron % perfiles de usuarios existentes.', rows_updated;
END $$;

-- Verificación final
SELECT id, full_name, phone, role FROM public.profiles ORDER BY created_at DESC LIMIT 10;
