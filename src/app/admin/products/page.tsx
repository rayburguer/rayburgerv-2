import { createClient } from '@/utils/supabase/server'
import { getAdminStats, getTopProducts, getPeakHours } from '@/app/actions/admin-products'
import AdminProductsClient from './AdminProductsClient'

export const dynamic = 'force-dynamic' // Ensure real-time data

export default async function AdminProductsPage() {
    const supabase = await createClient()

    // 1. Fetch Stats
    const statsRes = await getAdminStats()
    const stats = statsRes.success ? statsRes.data : null

    // 1.1 Fetch Intelligence
    const topProdRes = await getTopProducts()
    const topProducts = topProdRes.success ? topProdRes.data : []

    const peakRes = await getPeakHours()
    const peakHours = peakRes.success ? peakRes.data : []

    // 2. Fetch Dollar Rate
    const { data: configData } = await supabase
        .from('app_config')
        .select('dollar_rate')
        .eq('id', 'main')
        .single()
    const currentRate = configData?.dollar_rate || '0.00'

    // 3. Fetch Categories
    const { data: categories } = await supabase
        .from('categories')
        .select('*')
        .order('name')

    // 4. Fetch Products (Using VIEW v_menu_completo is good for prices, but for editing we need raw table data usually?)
    // Actually, v_menu_completo is good for display, but checking schema...
    // Users want "CONTROL TOTAL", managing is_active and soft delete.
    // We should fetch from 'products' table directly to see is_active=false items too (if not archived)
    // But Filter out archived.
    const { data: products } = await supabase
        .from('products')
        .select('*')
        .eq('is_archived', false) // Filter Soft Deleted
        .order('category_id', { ascending: true }) // Order by category
        .order('name', { ascending: true })

    // 5. Fetch Modifiers
    const { data: modifiers } = await supabase
        .from('product_modifiers')
        .select('*')
        .order('type', { ascending: true })

    return (
        <AdminProductsClient
            stats={stats}
            topProducts={topProducts || []}
            peakHours={peakHours || []}
            currentRate={currentRate}
            categories={categories || []}
            products={products || []}
            modifiers={modifiers || []}
        />
    )
}
