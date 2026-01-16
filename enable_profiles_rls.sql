-- 1. Habilitar RLS en la tabla profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 2. Política para que el usuario pueda VER su propio perfil
-- Esto permite que el Navbar y la página de perfil lean el 'wallet_balance'
CREATE POLICY "Users can view own profile"
ON profiles FOR SELECT
USING ( auth.uid() = id );

-- 3. Política para que el usuario pueda ACTUALIZAR su propio perfil
-- Útil si en el futuro permites editar nombre o teléfono
CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
USING ( auth.uid() = id );

-- (Opcional) Política para INSERT ya suele manejarse por triggers al crear usuario, 
-- pero si tuvieras registro manual directo en esta tabla:
-- CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
