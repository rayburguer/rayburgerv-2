import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import CartOverlay from '@/components/CartOverlay'
import MenuAccordion from '@/components/MenuAccordion'
import PromoCarousel from '@/components/PromoCarousel'
import PurchasePowerCard from '@/components/PurchasePowerCard'
import CategoryNav from '@/components/menu/CategoryNav'
import ProductFeed from '@/components/menu/ProductFeed'

export default async function MenuPage() {
    const supabase = await createClient()

    // Verificar Sesión
    const { data: { user } } = await supabase.auth.getUser()

    // if (!user) return redirect('/login')

    // 1. Obtener Productos desde Vista Inteligente (v_menu_completo)
    // Esto ya trae price_usd y precio_bs calculado
    let products = []
    let error = null
    try {
        console.log('[MenuPage] Fetching products from v_menu_completo...')
        const res = await supabase
            .from('v_menu_completo')
            .select('*')
            .order('category', { ascending: false })

        if (res.error) {
            console.error('[MenuPage] Fetch Error:', res.error)
            error = res.error
        } else {
            products = res.data
            console.log('[MenuPage] Fetched products count:', products?.length)
        }
    } catch (e) {
        console.error('[MenuPage] Unexpected Error:', e)
    }

    // 2. Obtener Saldo (Solo si hay usuario)
    let balance = 0
    if (user) {
        const { data: profile } = await supabase
            .from('profiles')
            .select('wallet_balance')
            .eq('id', user.id)
            .single()
        balance = profile?.wallet_balance || 0
    }

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 pb-20">
            <Navbar />

            {/* Carrusel Publicitario (Full Width / Cinematic) */}
            <PromoCarousel />

            <main className="max-w-5xl mx-auto px-4">

                {/* Banner Saldo (Compact Premium) */}
                <PurchasePowerCard
                    balance={balance}
                    userName={user?.user_metadata?.full_name?.split(' ')[0] || 'RayMember'}
                />

                {/* Grid Productos */}
                <div id="stats-bar" className="flex items-center justify-between mb-2 px-4">
                    <span className="text-xs text-slate-500 font-mono">
                        Menú RayBurger v4.0
                    </span>
                    <span className="text-xs text-emerald-500 font-mono bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                        Tasa: {products?.[0]?.tasa_referencia || 'N/A'} Bs/$
                    </span>
                </div>

                {/* Sticky Navigation */}
                <CategoryNav categories={Array.from(new Set(products?.map(p => p.category) || []))} />

                {/* Feed de Productos */}
                <ProductFeed products={products || []} />
            </main>

            {/* Cart Integration */}
            <CartOverlay />
        </div>
    )
}
