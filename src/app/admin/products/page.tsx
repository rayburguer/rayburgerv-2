import { createClient } from '@/utils/supabase/server'
import { getAdminStats, getTopProducts, getPeakHours } from '@/app/actions/admin-products'
import SalesStats from './SalesStats'
import TopProductsWidget from './TopProductsWidget'
import PeakHoursWidget from './PeakHoursWidget'
import DollarRateEditor from './DollarRateEditor'
import CategoryManager from './CategoryManager'
import ProductManagerPRO from './ProductManagerPRO'
import ExtrasManager from './ExtrasManager'
import { Settings } from 'lucide-react'

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
        <div className="space-y-6 max-w-[1600px] mx-auto pb-20">
            <div>
                <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                    <Settings className="w-8 h-8 text-amber-500" />
                    Tablero de Control Total
                </h2>
                <p className="text-slate-400 mt-2">Gestiona tu negocio: economía, inventario y métricas.</p>
            </div>

            {/* TOP: Sales Dashboard */}
            <section>
                <SalesStats stats={stats} />
            </section>

            {/* INTELLIGENCE LAYER */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <TopProductsWidget data={topProducts || []} />
                <PeakHoursWidget data={peakHours || []} />
            </section>

            {/* MID: Dollar Rate */}
            <section className="mb-8">
                <DollarRateEditor initialRate={currentRate} />
            </section>

            {/* BOTTOM: 3-Column Layout for Management */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[800px]">

                {/* Left: Inventory (Widest) */}
                <div className="lg:col-span-8 h-full">
                    <ProductManagerPRO
                        products={products || []}
                        categories={categories || []}
                    />
                </div>

                {/* Right: Config & Categories (Stacked) */}
                <div className="lg:col-span-4 flex flex-col gap-6 h-full">
                    <div className="flex-1 min-h-0">
                        <CategoryManager categories={categories || []} />
                    </div>
                    <div className="flex-1 min-h-0">
                        <ExtrasManager modifiers={modifiers || []} />
                    </div>
                </div>
            </div>
        </div>
    )
}
