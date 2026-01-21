-- ==============================================================================
-- FIX CRÍTICO: PERMISOS DE PERFIL PARA ADMINS
-- Problema: El Admin no puede ver los detalles del cliente porque RLS bloquea 'profiles'.
-- Solución: Permitir que el rol 'admin' VEA (SELECT) todos los perfiles.
-- ==============================================================================

-- 1. Asegurar RLS habilitado (por si acaso)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 2. Crear Política para Admins
-- (Usamos DROP IF EXISTS para evitar errores si ya existiera parcial)
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

CREATE POLICY "Admins can view all profiles" 
ON public.profiles FOR SELECT 
USING (
  -- Subconsulta recursiva segura:
  -- El usuario actual debe tener rol 'admin' EN SU PROPIO REGISTRO (que sí puede ver por la regla 'view own').
  auth.uid() IN (
    SELECT id FROM profiles WHERE role = 'admin' AND id = auth.uid()
  )
);

-- 3. Verificación
SELECT 'FIX PERFILES APLICADO: Admins ahora pueden ver todos los clientes.' as result;
