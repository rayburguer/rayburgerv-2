-- ==============================================================================
-- FIX SYNCRONIZACIÓN DE PERFIL DE USUARIO (V4)
-- Objetivo: Asegurar que cuando un usuario se registra, su 'full_name' y 'phone'
-- pasan correctamente de auth.users a public.profiles.
-- ==============================================================================

-- 1. Eliminar Trigger/Función anterior si existe (para evitar duplicados o conflictos)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- 2. Crear Función de Manejo de Nuevo Usuario (Robusta)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public -- IMPORTANTE: Seguridad
AS $$
DECLARE
    input_full_name text;
    input_phone text;
BEGIN
    -- Intentar obtener datos de metadata
    input_full_name := COALESCE(NEW.raw_user_meta_data->>'full_name', 'Usuario Rayburger');
    input_phone := COALESCE(NEW.raw_user_meta_data->>'phone', NEW.email); -- Fallback a email si no hay teléfono

    INSERT INTO public.profiles (id, full_name, phone, role, wallet_balance, points, user_level)
    VALUES (
        NEW.id,
        input_full_name,
        input_phone,
        'customer', -- Rol por defecto
        0.50,       -- Welcome Bonus directo (backup si falla el otro trigger)
        0,
        'Bronce'
    )
    ON CONFLICT (id) DO UPDATE
    SET
        full_name = EXCLUDED.full_name,
        phone = EXCLUDED.phone;

    RETURN NEW;
END;
$$;

-- 3. Crear el Trigger en auth.users
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- ==============================================================================
-- FIX (OPCIONAL) PARA REGISTROS ANTERIORES CON NOMBRE DEFAULT
-- Si quieres corregir usuarios que ya están mal, podrías ejecutar esto manualmente:
-- 
-- UPDATE profiles p
-- SET full_name = (u.raw_user_meta_data->>'full_name')
-- FROM auth.users u
-- WHERE p.id = u.id 
-- AND p.full_name = 'Usuario Rayburger' 
-- AND u.raw_user_meta_data->>'full_name' IS NOT NULL;
-- ==============================================================================

SELECT 'Trigger de Sincronización de Usuarios reparado exitosamente.' as result;
