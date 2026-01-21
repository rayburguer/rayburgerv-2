-- ==============================================================================
-- SCRIPT DE SEGURIDAD (RLS) - SOLUCION CORREGIDA
-- Descripción: Versión corregida que usa solo roles válidos ('admin').
-- Eliminado 'superadmin' que causaba error 22P02.
-- ==============================================================================

-- 1. TABLA CATEGORIES
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Categorías son públicas para leer" 
ON categories FOR SELECT USING (true);

CREATE POLICY "Solo Admins pueden modificar categorías" 
ON categories FOR ALL 
USING (
  -- Se asume que el rol válido es solo 'admin'. 
  -- Ajusta si tú usas 'manager' u otro, pero 'superadmin' no existe en tu enum.
  auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin')
);

-- 2. TABLA PRODUCTS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Productos son públicos para leer" 
ON products FOR SELECT USING (true);

CREATE POLICY "Solo Admins pueden modificar productos" 
ON products FOR ALL 
USING (
  auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin')
);

-- 3. TABLA PRODUCT_MODIFIERS
ALTER TABLE product_modifiers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Modificadores son públicos para leer" 
ON product_modifiers FOR SELECT USING (true);

CREATE POLICY "Solo Admins pueden modificar modificadores" 
ON product_modifiers FOR ALL 
USING (
  auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin')
);

-- 4. TABLA PAYMENT_REPORTS
ALTER TABLE payment_reports ENABLE ROW LEVEL SECURITY;

-- Usuarios autenticados pueden subir sus reportes
CREATE POLICY "Usuarios pueden reportar pagos" 
ON payment_reports FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

-- Admins pueden ver todo
CREATE POLICY "Admins ven todos los reportes" 
ON payment_reports FOR SELECT 
USING (
  auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin')
);

-- 5. TABLA ORDER_FEEDBACK
ALTER TABLE order_feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuarios pueden enviar feedback" 
ON order_feedback FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins ven feedback" 
ON order_feedback FOR SELECT 
USING (
  auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin')
);

-- 6. TABLA ERROR_LOGS
ALTER TABLE error_logs ENABLE ROW LEVEL SECURITY;

-- Solo admins ven logs
CREATE POLICY "Solo Admins ven logs" 
ON error_logs FOR SELECT 
USING (
  auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin')
);

-- Permitir insertar logs al sistema (service_role o autenticado si es necesario)
CREATE POLICY "Sistema puede registrar errores" 
ON error_logs FOR INSERT 
TO authenticated, service_role 
WITH CHECK (true);
