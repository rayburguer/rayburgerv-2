-- FIX RACE CONDITION & NEW PRIZE LOGIC V3 (CLEAN SYNTAX)
-- Delimiters changed to $BODY$ to avoid parsing errors.

CREATE OR REPLACE FUNCTION public.claim_scratch_reward(p_order_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $BODY$
DECLARE
    v_user_id uuid;
    v_order_owner uuid;
    v_guest_name text;
    v_existing_reward json;
    v_rand float;
    v_title text;
    v_code text;
    v_icon text;
    v_status text := 'active';
BEGIN
    -- A. Verificación de Identidad
    v_user_id := auth.uid();
    
    -- B. Verificación de Propiedad del Pedido
    SELECT user_id, guest_name INTO v_order_owner, v_guest_name FROM orders WHERE id = p_order_id;
    
    IF v_order_owner IS NULL AND v_guest_name IS NULL THEN
        RETURN json_build_object('success', false, 'error', 'Pedido no encontrado');
    END IF;

    -- CASE 1: Usuario Registrado
    IF v_order_owner IS NOT NULL THEN
        IF v_user_id IS NULL OR v_user_id != v_order_owner THEN
             RETURN json_build_object('success', false, 'error', 'Este pedido pertenece a un usuario registrado. Inicia sesión.');
        END IF;
    ELSE
        -- CASE 2: Invitado (Guest)
        v_user_id := NULL;
    END IF;

    -- C. IDEMPOTENCIA
    IF EXISTS (SELECT 1 FROM user_rewards WHERE order_id = p_order_id) THEN
        IF auth.uid() IS NOT NULL THEN
            UPDATE user_rewards SET user_id = auth.uid() WHERE order_id = p_order_id AND user_id IS NULL;
            UPDATE orders SET user_id = auth.uid() WHERE id = p_order_id AND user_id IS NULL;
        END IF;

        SELECT json_build_object('success', true, 'title', prize_title, 'code', prize_code, 'icon', prize_icon, 'is_replay', true) 
        INTO v_existing_reward FROM user_rewards WHERE order_id = p_order_id;
        RETURN v_existing_reward;
    END IF;

    -- D. RULETA MATEMÁTICA
    v_rand := random();

    IF v_rand < 0.01 THEN 
        v_title := '¡JACKPOT! Hamburguesa Clásica GRATIS'; 
        v_code := 'JACKPOT-' || upper(substring(md5(random()::text), 1, 4)); 
        v_icon := 'burger';
    ELSIF v_rand < 0.05 THEN 
        v_title := '10% DE DESCUENTO'; 
        v_code := 'RAY-10-' || upper(substring(md5(random()::text), 1, 6)); 
        v_icon := 'coins';
    ELSIF v_rand < 0.20 THEN 
        v_title := 'Extra Gratis (Queso/Bacon)'; 
        v_code := 'EXTRA-' || upper(substring(md5(random()::text), 1, 4)); 
        v_icon := 'hotdog';
    ELSIF v_rand < 0.40 THEN 
        v_title := 'Refresco Gratis'; 
        v_code := 'SODA-FREE'; 
        v_icon := 'soda';
    ELSIF v_rand < 0.70 THEN 
        v_title := '5% DE DESCUENTO'; 
        v_code := 'RAY-5-' || upper(substring(md5(random()::text), 1, 6)); 
        v_icon := 'coins';
    ELSE 
        v_title := '¡Ups! Vuelve a intentarlo'; 
        v_code := 'TRY-AGAIN'; 
        v_icon := 'sad'; 
        v_status := 'lost';
    END IF;

    -- E. INSERT BLINDADO
    BEGIN
        INSERT INTO user_rewards (user_id, order_id, prize_title, prize_code, prize_icon, status)
        VALUES (v_user_id, p_order_id, v_title, v_code, v_icon, v_status);
        
        RETURN json_build_object('success', true, 'title', v_title, 'code', v_code, 'icon', v_icon, 'is_replay', false);
        
    EXCEPTION WHEN unique_violation THEN
        IF auth.uid() IS NOT NULL THEN
            UPDATE user_rewards SET user_id = auth.uid() WHERE order_id = p_order_id AND user_id IS NULL;
            UPDATE orders SET user_id = auth.uid() WHERE id = p_order_id AND user_id IS NULL;
        END IF;

        SELECT json_build_object('success', true, 'title', prize_title, 'code', prize_code, 'icon', prize_icon, 'is_replay', true) 
        INTO v_existing_reward FROM user_rewards WHERE order_id = p_order_id;
        
        RETURN v_existing_reward;
    END;
END;
$BODY$;
