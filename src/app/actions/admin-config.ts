'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateDollarRate(newRate: string) {
    const supabase = await createClient()

    // Validar
    const rate = parseFloat(newRate)
    if (isNaN(rate) || rate <= 0) {
        return { success: false, error: 'Tasa inválida' }
    }

    try {
        // 1. Legacy Update (Mantener compatibilidad con UI actual que busca id='main')
        const { error: mainError } = await supabase
            .from('app_config')
            .update({
                dollar_rate: rate.toFixed(2),
                value: rate.toFixed(2)
            })
            .eq('id', 'main')

        // 2. View Update (CRÍTICO: Para v_menu_completo)
        // Esta es la row que leen las Vistas SQL y el Carrito
        const { error: viewError } = await supabase
            .from('app_config')
            .upsert({
                key: 'tasa_dolar',
                value: rate.toFixed(2),
                description: 'Tasa de cambio del día (Bs)'
            }, { onConflict: 'key' })

        if (viewError) throw viewError

        revalidatePath('/menu')
        revalidatePath('/admin/products')
        revalidatePath('/cart')
        return { success: true }
    } catch (error: any) {
        console.error('Error updating dollar rate:', error)
        return { success: false, error: error.message }
    }
}

export async function updateProductPrice(productId: string, newPrice: number) {
    const supabase = await createClient()

    try {
        const { error } = await supabase
            .from('products')
            .update({ price_usd: newPrice })
            .eq('id', productId)

        if (error) throw error

        revalidatePath('/menu')
        revalidatePath('/admin/products')
        return { success: true }
    } catch (error: any) {
        return { success: false, error: error.message }
    }
}

export async function toggleProductStatus(productId: string, isActive: boolean) {
    const supabase = await createClient()

    try {
        const { error } = await supabase
            .from('products')
            .update({ is_active: isActive })
            .eq('id', productId)

        if (error) throw error

        revalidatePath('/menu')
        revalidatePath('/admin/products')
        return { success: true }
    } catch (error: any) {
        return { success: false, error: error.message }
    }
}
