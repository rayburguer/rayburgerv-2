-- FIX ADOPTION LOOP (Growth Hack Fix)
-- Este script hace que al reclamar el premio, el invitado ADOPTE también el pedido.
-- Esto evita que el sistema le siga pidiendo registrarse una y otra vez.

CREATE OR REPLACE FUNCTION public.claim_scratch_reward(p_order_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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

    -- C. IDEMPOTENCIA (+ ADOPCIÓN)
    IF EXISTS (SELECT 1 FROM user_rewards WHERE order_id = p_order_id) THEN
        
        -- SI AHORA ESTÁ LOGUEADO: ADOPTAR TODO (PREMIO Y PEDIDO)
        IF auth.uid() IS NOT NULL THEN
            -- 1. Adoptar Premio
            UPDATE user_rewards 
            SET user_id = auth.uid() 
            WHERE order_id = p_order_id AND user_id IS NULL;
            
            -- 2. Adoptar Pedido (¡EL FIX CLAVE!)
            UPDATE orders
            SET user_id = auth.uid()
            WHERE id = p_order_id AND user_id IS NULL;
        END IF;

        -- Retornar premio existente
        SELECT json_build_object(
            'success', true, 
            'title', prize_title, 
            'code', prize_code, 
            'icon', prize_icon,
            'is_replay', true 
        ) INTO v_existing_reward
        FROM user_rewards WHERE order_id = p_order_id;
        
        RETURN v_existing_reward;
    END IF;

    -- D. RULETA (Si es nuevo juego)
    -- ... (Lógica de probabilidad simplificada para el fix, pero mantenemos la completa si el user corre todo el archivo. 
    -- Como esto es un Replace, debemos incluir la lógica completa. 
    -- Copio la lógica original abajo).

    v_rand := random();

    IF v_rand < 0.01 THEN v_title := '¡JACKPOT! Hamburguesa Clásica GRATIS'; v_code := 'JACKPOT-BURGER'; v_icon := 'burger';
    ELSIF v_rand < 0.05 THEN v_title := 'Perro Caliente GRATIS'; v_code := 'WIN-HOTDOG'; v_icon := 'hotdog';
    ELSIF v_rand < 0.10 THEN v_title := 'Doble Cashback en Siguiente Pedido'; v_code := 'DBL-CASHBACK'; v_icon := 'coins';
    ELSIF v_rand < 0.20 THEN v_title := 'Trae un Amigo: Bebida x La Casa'; v_code := 'FRIEND-DRINK'; v_icon := 'users';
    ELSIF v_rand < 0.40 THEN v_title := 'Delivery Gratis'; v_code := 'DELIVERY-FREE'; v_icon := 'moto';
    ELSIF v_rand < 0.65 THEN v_title := 'Bebida Gratis'; v_code := 'SODA-FREE'; v_icon := 'soda';
    ELSE v_title := '¡Ups! Vuelve a intentarlo'; v_code := 'TRY-AGAIN'; v_icon := 'sad'; v_status := 'lost';
    END IF;

    INSERT INTO user_rewards (user_id, order_id, prize_title, prize_code, prize_icon, status)
    VALUES (auth.uid(), p_order_id, v_title, v_code, v_icon, v_status);

    RETURN json_build_object('success', true, 'title', v_title, 'code', v_code, 'icon', v_icon, 'is_replay', false);

EXCEPTION WHEN OTHERS THEN
    RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$$;
