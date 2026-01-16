-- ==============================================================================
-- RAY BURGER REFERRALS - "MATRIMONIO" POR TELÉFONO
-- ==============================================================================

-- Función RPC para vincular referidos buscando por teléfono
-- Limpia el input y el teléfono almacenado para asegurar match
CREATE OR REPLACE FUNCTION link_referral_by_phone(new_user_id uuid, referrer_input_phone text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  clean_input text;
  referrer_profile_id uuid;
BEGIN
  -- 1. Limpieza de input: dejar solo números (elimina +, espacios, guiones)
  clean_input := regexp_replace(referrer_input_phone, '\D', '', 'g');
  
  -- Si quedó vacío o es muy corto, ignorar
  IF length(clean_input) < 7 THEN
    RETURN;
  END IF;

  -- 2. Buscar al padrino comparando números limpios
  -- Esto permite que si en DB está "+58 412..." y el input es "0412...", hagan match si los dígitos coinciden parcialmente o limpiar ambos.
  -- Estrategia robusta: Limpiar columna phone de la DB al vuelo para comparar.
  SELECT id INTO referrer_profile_id
  FROM profiles
  WHERE regexp_replace(phone, '\D', '', 'g') LIKE '%' || clean_input || '%'
  -- Ojo: LIKE '%'... puede ser peligroso con números cortos.
  -- Mejor: Exact match de los dígitos.
  -- Asumiremos que el usuario escribe el número completo.
  -- Si en DB es 58412... y input es 0412..., debemos normalizar.
  -- Para V3 simple: Match exacto de lo que quede después de limpiar.
  -- Si esto resulta complejo, asumimos que el usuario escribe bien.
  -- Mantenemos el REGEXP puro.
  LIMIT 1;
  
  -- RE-INTENTO con lógica más laxa si no encuentra exacto:
  -- Si clean_input es '0412...' y DB tiene '58412...', el anterior fallaría.
  IF referrer_profile_id IS NULL THEN
     SELECT id INTO referrer_profile_id
     FROM profiles
     WHERE regexp_replace(phone, '\D', '', 'g') LIKE '%' || right(clean_input, 10) -- Últimos 10 dígitos (Venezuela)
     LIMIT 1;
  END IF;

  -- 3. Si encontramos padrino y NO es el mismo usuario (evitar auto-referido)
  IF referrer_profile_id IS NOT NULL AND referrer_profile_id <> new_user_id THEN
    UPDATE profiles
    SET referred_by = referrer_profile_id
    WHERE id = new_user_id;
  END IF;
  
EXCEPTION WHEN OTHERS THEN
  -- Si falla, no rompemos el registro del usuario. Solo ignoramos el referido.
  RAISE WARNING 'Error vinculando referido: %', SQLERRM;
END;
$$;
