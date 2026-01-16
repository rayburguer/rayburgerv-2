import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { Star } from 'lucide-react'
import CartOverlay from '@/components/CartOverlay'
import Navbar from '@/components/Navbar'
import MenuAccordion from '@/components/MenuAccordion'
import PromoCarousel from '@/components/PromoCarousel'

export default async function MenuPage() {
    const supabase = await createClient()

    // Verificar Sesión
    const { data: { user } } = await supabase.auth.getUser()

    // if (!user) return redirect('/login')

    // 1. Obtener Productos desde Vista Inteligente (v_menu_completo)
    // Esto ya trae price_usd y precio_bs calculado
    const { data: products } = await supabase
        .from('v_menu_completo')
        .select('*')
        .order('category', { ascending: false })

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

            <main className="max-w-5xl mx-auto p-4 pt-6">
                {/* Carrusel Publicitario (Food Porn) */}
                <PromoCarousel />

                {/* Banner Saldo (Hero) */}
                {/* Gold Member Card (Wallet Hero) */}
                <div className="relative mb-10 group perspective-1000">
                    {/* The Card */}
                    <div className="bg-linear-to-br from-yellow-500 via-amber-500 to-orange-600 rounded-2xl p-6 shadow-[0_10px_30px_-5px_rgba(245,158,11,0.4)] relative overflow-hidden transition-transform transform hover:scale-[1.02] duration-300">
                        {/* Card Texture (Noise) */}
                        <div className="absolute inset-0 opacity-10 bg-repeat bg-[length:100px_100px] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
                        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/20 blur-3xl rounded-full"></div>

                        <div className="relative z-10 flex flex-col justify-between h-full min-h-[140px]">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-[10px] font-bold text-yellow-100 uppercase tracking-widest mb-1">Tu Poder de Compra</p>
                                    <h2 className="text-4xl xs:text-5xl font-black text-white tracking-tighter drop-shadow-md truncate max-w-[200px] xs:max-w-none">
                                        ${Number(balance).toFixed(2)}
                                    </h2>
                                </div>
                                {/* Chip Sim */}
                                <div className="w-12 h-9 rounded-md bg-linear-to-br from-yellow-200 to-yellow-500 border border-yellow-400 shadow-inner relative overflow-hidden hidden xs:block opacity-90">
                                    <div className="absolute left-0 top-1/2 w-full h-px bg-black/20"></div>
                                    <div className="absolute top-0 left-1/2 h-full w-px bg-black/20"></div>
                                    <div className="absolute inset-0 border-[3px] border-yellow-600/30 rounded-md"></div>
                                </div>
                            </div>

                            <div className="flex justify-between items-end mt-4">
                                <div className="flex flex-col">
                                    <p className="text-[9px] text-yellow-100 uppercase tracking-wider mb-0.5 opacity-75">NÚMERO DE SOCIO</p>
                                    <p className="text-xs text-white font-mono tracking-widest font-bold text-shadow-sm">
                                        RAYB • {user?.id.slice(0, 4).toUpperCase() || '0000'} • VIP
                                    </p>
                                </div>
                                <div className="flex items-center gap-1 bg-black/20 px-3 py-1 rounded-full backdrop-blur-sm border border-white/10">
                                    <Star className="w-3 h-3 fill-yellow-300 text-yellow-300" />
                                    <span className="text-[10px] font-bold text-white uppercase tracking-tight">RAYMEMBER</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Slogan Tape (Aggressive Pop) */}
                    <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 rotate-[-2deg] bg-slate-900 border-[3px] border-white text-white px-8 py-2 z-20 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] w-auto max-w-[95%] text-center whitespace-nowrap">
                        <p className="text-sm font-black uppercase tracking-widest italic flex items-center gap-2">
                            🔥 Somos tu verdadero vicio
                        </p>
                    </div>
                </div>

                {/* Grid Productos */}
                <div id="menu-list" className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <span>🍔</span> Nuestro Menú
                    </h3>
                    <span className="text-xs text-slate-500 font-mono bg-slate-900 px-3 py-1 rounded-full border border-slate-800">
                        Tasa: {products?.[0]?.tasa_referencia || 'N/A'} Bs/$
                    </span>
                </div>

                <MenuAccordion products={products || []} />
            </main>

            {/* Cart Integration */}
            <CartOverlay />
        </div>
    )
}
