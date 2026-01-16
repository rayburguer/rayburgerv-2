'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateOrderStatus(orderId: string, newStatus: string) {
    const supabase = await createClient()

    // 1. Auth Check
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return { success: false, error: 'Unauthorized' }
    }

    // 2. Update Order
    const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId)

    if (error) {
        console.error('Error updating order:', error)
        return { success: false, error: error.message } // Retornamos el error real
    }

    // 3. Revalidate Paths
    revalidatePath(`/admin/orders/${orderId}`)

    return { success: true }
}

export async function getDashboardStats() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const { data, error } = await supabase.rpc('get_admin_stats')

    if (error) {
        console.error('Error fetching admin stats:', error)
        return null
    }


    return data
}

export async function getWeeklySales() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    const { data, error } = await supabase.rpc('get_weekly_sales')

    if (error) {
        console.error('Error fetching weekly sales:', error)
        return []
    }

    return data
}

export async function getAdminOrders() {
    const supabase = await createClient()

    // Auth Check
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    // 1. Intento: RPC Blindado (Nombres Reales)
    const { data: rpcData, error: rpcError } = await supabase.rpc('get_admin_orders')

    if (!rpcError && rpcData && rpcData.length > 0) {
        return rpcData
    }

    if (rpcError) {
        console.warn('RPC get_admin_orders failed, falling back to VIEW:', rpcError)
    }

    // 2. Fallback: Vista Estándar (Puede salir Anónimo, pero sale)
    const { data: viewData, error: viewError } = await supabase
        .from('v_admin_pending_orders')
        .select('*')
        .order('created_at', { ascending: false })

    if (viewError) {
        console.error('Error fetching admin orders (View Fallback):', viewError)
        return []
    }

    return viewData || []
}
