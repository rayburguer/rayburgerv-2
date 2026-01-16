'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

interface CartItem {
    id: string
    quantity: number
    price_usd: number
    customization?: any // JSONB
}

interface OrderParams {
    cartItems: CartItem[]
    total: number
    paymentReference?: string
    useBalance?: boolean
    paymentProof?: string // URL o base64 (Placeholder)
    deliveryType?: 'pickup' | 'delivery'
    deliveryZone?: string // '1', '2', '3'
    guestName?: string
    guestContact?: string
}

export async function placeOrder({
    cartItems,
    total,
    paymentReference,
    useBalance,
    paymentProof,
    deliveryType = 'pickup',
    deliveryZone,
    guestName,
    guestContact
}: OrderParams) {
    console.log('🔹 [Server Action] placeOrder STARTED')
    console.log('Payload:', { items: cartItems.length, total, deliveryType, guestName })

    if (!cartItems || cartItems.length === 0) {
        return { success: false, error: 'El carrito está vacío' }
    }

    if (isNaN(total) || total < 0) {
        return { success: false, error: 'Total inválido' }
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // VALIDATION 1: User OR Guest
    if (!user) {
        if (!guestName || !guestContact) {
            return { success: false, error: 'Debes iniciar sesión o ingresar tus datos de invitado.' }
        }
    }

    // VALIDATION 2: Inventory Check (Active & Not Archived)
    // Extraemos IDs del carrito
    const productIds = cartItems.map(item => item.id)

    // Consultamos si existe alguno "malo"
    const { data: invalidProducts, error: checkError } = await supabase
        .from('products')
        .select('name')
        .in('id', productIds)
        .or('is_active.eq.false,is_archived.eq.true')

    if (checkError) {
        console.error('Inventory check failed:', checkError)
        return { success: false, error: 'Error verificando inventario.' }
    }

    if (invalidProducts && invalidProducts.length > 0) {
        console.warn('Attempt to buy invalid products:', invalidProducts)
        return { success: false, error: `Uno de los productos en tu carrito ya no está disponible: ${invalidProducts[0].name}` }
    }

    try {
        // --- LOGIC: DELIVERY COST CALCULATION ---
        let deliveryCost = 0
        if (deliveryType === 'delivery') {
            if (deliveryZone === '1') deliveryCost = 1
            else if (deliveryZone === '2') deliveryCost = 2
            else if (deliveryZone === '3') deliveryCost = 3
            else {
                return { success: false, error: 'Zona de delivery inválida' }
            }
        }

        // MONETARY ROUNDING (Strict 2 Decimals)
        // Función helper local
        const round = (num: number) => Math.round(num * 100) / 100

        let finalAmountToPay = round(total)
        let amountPaidFromWallet = 0

        // BALANCE LOGIC (Only for Auth Users)
        if (user && useBalance) {
            const { data: profile } = await supabase
                .from('profiles')
                .select('wallet_balance')
                .eq('id', user.id)
                .single()

            const currentBalance = Number(profile?.wallet_balance || 0)
            // Calculamos cuánto usar: lo que tenga o lo que deba, lo menor.
            amountPaidFromWallet = round(Math.min(currentBalance, finalAmountToPay))

            if (amountPaidFromWallet > 0) {
                finalAmountToPay = round(finalAmountToPay - amountPaidFromWallet)
            }
        }

        // 2. Insert Order
        // Status: 'pending_confirmation' para que el admin valide
        const { data: order, error: orderError } = await supabase
            .from('orders')
            .insert({
                user_id: user ? user.id : null,
                guest_name: user ? null : guestName,
                guest_contact: user ? null : guestContact,
                total_amount: round(total), // Monto original sanitizado
                status: 'pending_confirmation',
                delivery_type: deliveryType,
                delivery_cost: deliveryCost,
                delivery_zone: deliveryZone || null
            })
            .select('id')
            .single()

        if (orderError) {
            console.error('❌ Error creating order:', orderError)
            return { success: false, error: orderError.message }
        }

        console.log('✅ Order Header created:', order.id)

        // DEDUCT BALANCE (Only Auth Users)
        if (user && amountPaidFromWallet > 0) {
            const { error: walletError } = await supabase.rpc('deduct_wallet_balance', {
                p_user_id: user.id,
                p_amount: amountPaidFromWallet,
                p_order_id: order.id
            })

            if (walletError) console.error('Error deducting balance:', walletError)
        }

        // 3. Reporte de Pago (payment_reports)
        if (paymentReference || paymentProof) {
            const { error: paymentError } = await supabase.from('payment_reports').insert({
                order_id: order.id,
                user_id: user ? user.id : null,
                method: 'pago_movil',
                amount_usd: finalAmountToPay, // Lo que pagó en dinero real
                reference_number: paymentReference || 'SIN-REF',
                screenshot_url: paymentProof || null
            })

            if (paymentError) {
                console.error('❌ Error inserting payment report:', paymentError)
            }
        }

        // 4. Insert Items
        const orderItemsData = cartItems.map((item) => ({
            order_id: order.id,
            product_id: item.id,
            quantity: item.quantity,
            unit_price: round(item.price_usd), // Round unit price
            customization: item.customization || null
        }))

        const { error: itemsError } = await supabase
            .from('order_items')
            .insert(orderItemsData)

        if (itemsError) {
            console.error('❌ Error inserting items:', itemsError)
            return { success: false, error: itemsError.message }
        }

        revalidatePath('/menu')
        revalidatePath('/profile')

        // RETURN ORDER ID FOR REDIRECTION
        return { success: true, orderId: order.id }

    } catch (err: any) {
        console.error('❌ Unexpected Exception:', err)
        return { success: false, error: `System Error: ${err.message || 'Unknown'}` }
    }
}