-- ==============================================================================
-- FIX DE VISIBILIDAD ADMIN (RLS)
-- Objetivo: Permitir que el Admin vea los nombres de los usuarios en el Dashboard.
-- ==============================================================================

-- 1. Función Helpers Segura (Security Definer)
-- Esta función chequea si el usuario actual es admin, saltándose las restricciones RLS para evitar recursión.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER 
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- 2. Eliminar Política Antigua (Restrictiva)
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users and Admins can view specific profiles" ON profiles; -- Por si acaso

-- 3. Crear Nueva Política "Jerárquica"
-- Permite acceso si eres el dueño del perfil O si eres Admin.
CREATE POLICY "Users and Admins can view specific profiles"
ON profiles FOR SELECT
USING (
    auth.uid() = id 
    OR 
    is_admin() = true
);

-- Nota: Esto no afecta la escritura (UPDATE/DELETE), solo la lectura (SELECT).
-- El Admin ahora podrá hacer `SELECT * FROM profiles` y ver todos los nombres.
