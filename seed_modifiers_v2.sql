-- ==============================================================================
-- SEMILLA DE MODIFICADORES (V2) - RAY BURGER
-- Objetivo: Poblar la tabla 'product_modifiers' con los ingredientes estándar.
-- Clasificación:
--   - type='base'  : Ingredientes que vienen por defecto (Cebolla, Tomate...). El usuario los "quita".
--   - type='extra' : Adicionales con costo (Tocineta, Huevo...).
--   - type='special': Modificaciones complejas (Doble Carne).
-- ==============================================================================

-- 1. FIX DE ESQUEMA (El error 42703 indica que falta la columna 'type' y 'is_active')
-- Agregamos las columnas necesarias si no existen (Evolución de Schema)
ALTER TABLE public.product_modifiers ADD COLUMN IF NOT EXISTS type text DEFAULT 'extra';
ALTER TABLE public.product_modifiers ADD COLUMN IF NOT EXISTS category text DEFAULT 'General';
ALTER TABLE public.product_modifiers ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true;
ALTER TABLE public.product_modifiers ADD COLUMN IF NOT EXISTS price_usd numeric DEFAULT 0;

-- 2. Limpiar tabla para evitar duplicados
TRUNCATE TABLE public.product_modifiers;

-- 3. Insertar Modificadores
INSERT INTO public.product_modifiers (name, type, price_usd, is_active)
VALUES 
    -- BASE (Ingredientes removibles, Precio 0)
    ('Cebolla', 'base', 0, true),
    ('Tomate', 'base', 0, true),
    ('Lechuga', 'base', 0, true),
    ('Pepinillos', 'base', 0, true),
    ('Salsas', 'base', 0, true),
    ('Queso Amarillo', 'base', 0, true),

    -- EXTRAS (Costos adicionales)
    ('Tocineta', 'extra', 1.50, true),
    ('Huevo Frito', 'extra', 0.80, true),
    ('Queso Extra', 'extra', 1.00, true),
    ('Aros de Cebolla', 'extra', 2.00, true),
    ('Papas Fritas Pequeñas', 'extra', 2.50, true),
    ('Salsa de Ajo', 'extra', 0.50, true),

    -- SPECIALS (Multiplicadores o costos altos)
    ('Doble Carne', 'special', 0, true); -- La lógica en frontend multiplica x1.5 el precio base, precio aquí es referencial o 0.

-- 3. Confirmación
SELECT 'Modificadores insertados correctamente: ' || COUNT(*) FROM public.product_modifiers;
