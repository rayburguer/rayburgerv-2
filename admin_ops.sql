-- ADMIN OPERATIONS (REDEMPTION)
-- RPC segura para que el administrador marque premios como entregados.

CREATE OR REPLACE FUNCTION public.verify_and_redeem_reward(p_order_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_reward_id uuid;
    v_status text;
    v_title text;
    v_user_role text;
BEGIN
    -- 1. Verificar Permisos (Solo Admins)
    SELECT role INTO v_user_role FROM profiles WHERE id = auth.uid();
    
    IF v_user_role IS DISTINCT FROM 'admin' THEN
        RETURN json_build_object('success', false, 'error', 'No autorizado. Solo administradores.');
    END IF;

    -- 2. Buscar el premio del pedido
    SELECT id, status, prize_title INTO v_reward_id, v_status, v_title
    FROM user_rewards 
    WHERE order_id = p_order_id;

    IF v_reward_id IS NULL THEN
        RETURN json_build_object('success', false, 'error', 'Este pedido no tiene premio asociado.');
    END IF;

    -- 3. Verificar estado
    IF v_status = 'redeemed' THEN
         RETURN json_build_object('success', false, 'error', 'El premio ya fue canjeado anteriormente.');
    END IF;

    IF v_status = 'lost' THEN
         RETURN json_build_object('success', false, 'error', 'El premio de este pedido es "Perdedor". Nada que canjear.');
    END IF;

    -- 4. CANJEAR
    UPDATE user_rewards 
    SET status = 'redeemed', redeemed_at = NOW()
    WHERE id = v_reward_id;

    RETURN json_build_object(
        'success', true, 
        'message', 'Premio marcado como ENTREGADO exitosamente.',
        'prize', v_title
    );
END;
$$;
