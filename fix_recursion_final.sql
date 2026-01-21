-- ==============================================================================
-- FIX DEFINITIVO DE RECURSIVIDAD (El "Plato Roto")
-- ==============================================================================
-- DIAGNÓSTICO:
-- La política anterior creó un "Bucle Infinito":
-- Para leer la tabla, preguntaba si eres admin.
-- Para saber si eres admin, leía la tabla.
-- Resultado: Bloqueo total (tus puntos se fueron a 0).
--
-- SOLUCIÓN:
-- Usamos una "Función Maestra" (SECURITY DEFINER) que tiene permiso de ver todo 
-- sin pasar por las reglas, rompiendo el bucle de forma segura.

-- 1. Eliminar la política tóxica
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

-- 2. Crear la Función Maestra (Rompe-Bucles)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER -- IMPORTANTE: Ejecuta con súper-poderes
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'
  );
$$;

-- 3. Crear la Política Segura (Usando la función)
CREATE POLICY "Admins can view all profiles" 
ON public.profiles FOR SELECT 
USING (
  public.is_admin()
);

-- 4. Verificación
SELECT 'RECURSIVIDAD ELIMINADA. Tu perfil debería volver a la normalidad.' as result;
