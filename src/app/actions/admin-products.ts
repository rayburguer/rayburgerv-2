'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

// --- STATS ---
export async function getAdminStats() {
    const supabase = await createClient()
    const { data, error } = await supabase.from('v_stats_ventas').select('*').single()
    if (error) return { success: false, error: error.message }
    return { success: true, data }
}

export async function getTopProducts() {
    const supabase = await createClient()
    const { data, error } = await supabase.from('v_top_productos').select('*').limit(5)
    if (error) return { success: false, error: error.message }
    return { success: true, data }
}

export async function getPeakHours() {
    const supabase = await createClient()
    const { data, error } = await supabase.from('v_ventas_por_hora').select('*')
    if (error) return { success: false, error: error.message }
    return { success: true, data }
}

// --- CATEGORIES ---
export async function createCategory(name: string, slug: string) {
    const supabase = await createClient()
    const { error } = await supabase.from('categories').insert({ name, slug })
    if (error) return { success: false, error: error.message }
    revalidatePath('/menu')
    revalidatePath('/admin/products')
    return { success: true }
}

export async function deleteCategory(id: string) {
    const supabase = await createClient()
    const { error } = await supabase.from('categories').delete().eq('id', id)
    if (error) return { success: false, error: error.message }
    revalidatePath('/menu')
    revalidatePath('/admin/products')
    return { success: true }
}

// --- PRODUCTS ---
export async function createProduct(productData: any) {
    const supabase = await createClient()
    const { error } = await supabase.from('products').insert(productData)
    if (error) return { success: false, error: error.message }
    revalidatePath('/menu')
    revalidatePath('/admin/products')
    return { success: true }
}

export async function deleteProduct(productId: string) {
    const supabase = await createClient()
    // Soft Delete: is_archived = true, is_active = false
    const { error } = await supabase
        .from('products')
        .update({ is_archived: true, is_active: false })
        .eq('id', productId)

    if (error) return { success: false, error: error.message }
    revalidatePath('/menu')
    revalidatePath('/admin/products')
    return { success: true }
}

export async function updateProduct(id: string, updates: any) {
    const supabase = await createClient()
    const { error } = await supabase
        .from('products')
        .update(updates)
        .eq('id', id)

    if (error) return { success: false, error: error.message }
    revalidatePath('/menu')
    revalidatePath('/admin/products')
    return { success: true }
}

// --- MODIFIERS ---
export async function createModifier(data: { name: string, type: string, price_usd: number }) {
    const supabase = await createClient()
    const { error } = await supabase.from('product_modifiers').insert(data)
    if (error) return { success: false, error: error.message }
    revalidatePath('/menu')
    revalidatePath('/admin/products')
    return { success: true }
}

export async function deleteModifier(id: string) {
    const supabase = await createClient()
    const { error } = await supabase.from('product_modifiers').delete().eq('id', id)
    if (error) return { success: false, error: error.message }
    revalidatePath('/menu')
    revalidatePath('/admin/products')
    return { success: true }
}
