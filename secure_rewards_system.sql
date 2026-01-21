-- ==============================================================================
-- SISTEMA DE RECOMPENSAS SEGURO (Server-Side Logic)
-- "The RayBurger Scratch Protocol" v1.0
-- ==============================================================================

-- 1. TABLA DE DATOS BLINDADA
-- Eliminamos versiones anteriores si existen para evitar conflictos
DROP TABLE IF EXISTS public.user_rewards CASCADE;

CREATE TABLE public.user_rewards (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES public.profiles(id), -- Nullable for guests
    order_id uuid REFERENCES public.orders(id) NOT NULL,
    prize_title text NOT NULL,
    prize_code text NOT NULL,
    prize_icon text NOT NULL, 
    status text DEFAULT 'active' CHECK (status IN ('active', 'redeemed', 'expired', 'lost')),
    is_claimed boolean DEFAULT false,
    created_at timestamptz DEFAULT now(),
    
    CONSTRAINT uq_reward_order UNIQUE (order_id)
);

-- 2. SEGURIDAD (Row Level Security)
ALTER TABLE public.user_rewards ENABLE ROW LEVEL SECURITY;

-- Solo el dueño puede ver sus premios
CREATE POLICY "Dueño ve sus premios" 
ON public.user_rewards FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);

-- NADIE puede insertar directamente desde el cliente. Solo la RPC.
-- Bloqueamos INSERT/UPDATE/DELETE públicos.

-- 3. MOTOR DE PROBABILIDADES (La lógica del Casino)
-- Función Segura que se llama desde el frontend
CREATE OR REPLACE FUNCTION public.claim_scratch_reward(p_order_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER -- Ejecuta con permisos de admin (necesario para insertar en tabla protegida)
SET search_path = public
AS $$
DECLARE
    v_user_id uuid;
    v_order_owner uuid;
    v_guest_name text;
    v_existing_reward json;
    v_rand float;
    
    -- Variables del Premio
    v_title text;
    v_code text;
    v_icon text;
    v_status text := 'active';
BEGIN
    -- A. Verificación de Identidad (Hybrid: Auth User OR Guest Order)
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
    -- CASE 2: Invitado (Guest)
    ELSE
        -- Si es guest, permitimos jugar sin auth.uid()
        -- La seguridad aquí recae en que el UUID del pedido es difícil de adivinar.
        -- Y el unique constraint impide jugar doble.
        v_user_id := NULL; -- Explicit null for logic
    END IF;

    -- C. Verificación de Idempotencia (¿Ya jugaste este ticket?)
    -- Si ya existe un premio para este pedido...
    IF EXISTS (SELECT 1 FROM user_rewards WHERE order_id = p_order_id) THEN
        
        -- C.1 LÓGICA DE ADOPCIÓN (Growth Hack)
        -- Si el premio existe pero es huérfano (user_id IS NULL) Y ahora tenemos un usuario autenticado:
        -- ¡Asignamos el premio al usuario Y EL PEDIDO TAMBIÉN!
        IF v_user_id IS NOT NULL THEN
            UPDATE user_rewards 
            SET user_id = v_user_id 
            WHERE order_id = p_order_id AND user_id IS NULL;
            
            -- FIX CRÍTICO: Adoptar también el pedido para evitar Loop de "Regístrate"
            UPDATE orders
            SET user_id = v_user_id
            WHERE id = p_order_id AND user_id IS NULL;
        END IF;

        -- Devolvemos el premio (ahora actualizado)
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

    -- D. LA RULETA (Generar Probabilidad)
    v_rand := random(); -- 0.0 a 1.0

    -- Tabla de Probabilidades Acumulada:
    -- 0.00 - 0.01 (1%)  : JACKPOT (Burger)
    -- 0.01 - 0.05 (4%)  : HOTDOG
    -- 0.05 - 0.10 (5%)  : DBL CASHBACK
    -- 0.10 - 0.20 (10%) : FRIEND DRINK
    -- 0.20 - 0.40 (20%) : DELIVERY FREE
    -- 0.40 - 0.65 (25%) : SODA FREE
    -- 0.65 - 1.00 (35%) : TRY AGAIN

    IF v_rand < 0.01 THEN
        v_title := '¡JACKPOT! Hamburguesa Clásica GRATIS';
        v_code := 'JACKPOT-BURGER';
        v_icon := 'burger';
    ELSIF v_rand < 0.05 THEN
        v_title := 'Perro Caliente GRATIS';
        v_code := 'WIN-HOTDOG';
        v_icon := 'hotdog';
    ELSIF v_rand < 0.10 THEN
        v_title := 'Doble Cashback en Siguiente Pedido';
        v_code := 'DBL-CASHBACK';
        v_icon := 'coins';
    ELSIF v_rand < 0.20 THEN
        v_title := 'Trae un Amigo: Bebida x La Casa';
        v_code := 'FRIEND-DRINK';
        v_icon := 'users';
    ELSIF v_rand < 0.40 THEN
        v_title := 'Delivery Gratis';
        v_code := 'DELIVERY-FREE';
        v_icon := 'moto';
    ELSIF v_rand < 0.65 THEN
        v_title := 'Bebida Gratis';
        v_code := 'SODA-FREE';
        v_icon := 'soda';
    ELSE
        -- 35% de probabilidad de perder
        v_title := '¡Ups! Vuelve a intentarlo';
        v_code := 'TRY-AGAIN';
        v_icon := 'sad';
        v_status := 'lost'; -- Marcamos como perdido
    END IF;

    -- E. Persistencia (Guardar resultado)
    INSERT INTO user_rewards (user_id, order_id, prize_title, prize_code, prize_icon, status)
    VALUES (v_user_id, p_order_id, v_title, v_code, v_icon, v_status);

    -- F. Retorno Triunfal
    RETURN json_build_object(
        'success', true,
        'title', v_title,
        'code', v_code,
        'icon', v_icon,
        'is_replay', false
    );

EXCEPTION WHEN OTHERS THEN
    -- Manejo de errores seguro
    RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$$;

-- Permisos finales
GRANT SELECT ON public.user_rewards TO authenticated;
-- NO dar permisos de INSERT/UPDATE a authenticated. Solo via RPC.
