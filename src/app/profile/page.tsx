import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { UserCircle, Wallet, LogOut, Phone, Crown, History, Trophy, Gift, ShoppingBag, LayoutDashboard, ChevronRight, Star, Users, Settings } from 'lucide-react'
import Link from 'next/link'
import OrderHistoryList from '@/components/OrderHistoryList'
import Navbar from '@/components/Navbar'

export default async function ProfilePage() {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        return redirect('/login')
    }

    // ... (rest of the detailed data fetching logic remains unchanged)

    // 1. Fetch Inteligente (Strict Mode)

    // A. Progreso y Nivel (VISTA: v_user_progress)
    const { data: progress } = await supabase
        .from('v_user_progress')
        .select('*')
        .eq('user_id', user.id)
        .single()

    // ...

    // B. Historial (TABLA: wallet_transactions)
    // CORRECCIÓN: Usamos 'user_id' para filtrar, no 'profile_id'
    const { data: transactions } = await supabase
        .from('wallet_transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5)

    // C. Saldo Oficial (TABLA: profiles)
    // El usuario especificó: "Saldo Favor: El valor oficial para el Banner es profiles.wallet_balance"
    // D. Mis Pedidos (TABLA: orders)
    // Buscamos si ya tiene feedback usando select count o join
    const { data: ordersRaw } = await supabase
        .from('orders')
        .select(`
            id, 
            created_at, 
            total_amount, 
            status,
            order_feedback(id)
        `)
        .eq('user_id', user.id) // Fix: use user_id
        .order('created_at', { ascending: false })
        .limit(5)

    // Transformamos para el componente Client
    const orders = ordersRaw?.map((o: any) => ({
        id: o.id,
        created_at: o.created_at,
        total_amount: o.total_amount,
        status: o.status,
        feedback_given: o.order_feedback && o.order_feedback.length > 0
    })) || []

    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

    // Mapping seguro de datos
    const contactPhone = profile?.phone || user.email || ''
    const fullName = progress?.full_name || 'Usuario RayBurger'
    const walletBalance = profile?.wallet_balance || 0
    const points = profile?.points || 0
    // El nivel y progreso viene EXCLUSIVAMENTE de la vista
    const userLevel = progress?.user_level || 'Bronce'

    // CORRECCIÓN CRÍTICA: Usamos los campos calculados por el Backend
    // "El Frontend solo debe reflejar lo que dicen las Vistas"
    const progressPercent = progress?.porcentaje_progreso || 0
    const missingForNext = progress?.falta_para_siguiente_nivel || 0
    const pointsForFreeBurger = progress?.puntos_para_burger_gratis || 0

    // Colores de Nivel
    const levelColor = userLevel === 'Oro' ? 'text-yellow-400' : userLevel === 'Plata' ? 'text-slate-300' : 'text-amber-700'
    const levelBg = userLevel === 'Oro' ? 'bg-yellow-400/10 border-yellow-400/20' : userLevel === 'Plata' ? 'bg-slate-300/10 border-slate-300/20' : 'bg-amber-700/10 border-amber-700/20'

    // Server Action para Logout
    async function signOut() {
        'use server'
        const supabase = await createClient()
        await supabase.auth.signOut()
        redirect('/login')
    }

    // Link WhatsApp
    const waText = `¡Pide en Ray Burger usando mi número ${contactPhone} como código de referido y ambos ganaremos premios! https://rayburger.app`
    const shareLink = `https://wa.me/?text=${encodeURIComponent(waText)}`

    return (

        <div className="min-h-screen bg-slate-950 pb-24 font-sans selection:bg-amber-500/30">
            <div className="hidden md:block">
                <Navbar />
            </div>

            {/* HERO SECTION: Fintech Premium Card */}
            <div className="relative pt-8 px-4 pb-20 overflow-hidden">
                {/* Background Glows */}
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-amber-500/20 blur-[120px] rounded-full pointer-events-none" />
                <div className="absolute top-[20%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[100px] rounded-full pointer-events-none" />

                <div className="relative z-10 max-w-md mx-auto space-y-6">

                    {/* Header Minimal */}
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center shadow-lg">
                                <UserCircle className="w-6 h-6 text-slate-400" />
                            </div>
                            <div>
                                <h1 className="text-sm font-bold text-white leading-tight">{fullName}</h1>
                                <span className="text-[10px] text-slate-500 font-mono tracking-wider uppercase">ID: {user?.id.slice(0, 4).toUpperCase()}</span>
                            </div>
                        </div>
                        <div className={`px-3 py-1.5 rounded-full text-[10px] font-black tracking-widest border flex items-center gap-1.5 shadow-[0_0_15px_-5px_currentColor] ${levelBg} ${levelColor}`}>
                            <Crown className="w-3 h-3" />
                            {userLevel.toUpperCase()}
                        </div>
                    </div>

                    {/* MAIN CARD: Points & Balance */}
                    <div className="w-full relative group perspective-1000">
                        <div className="bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 rounded-[2.5rem] p-8 border border-slate-700/50 shadow-2xl relative overflow-hidden ring-1 ring-white/5">

                            {/* Card Texture */}
                            <div className="absolute inset-0 opacity-30 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay"></div>

                            <div className="relative z-10 flex flex-col items-center text-center">
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mb-2 text-shadow-sm">Mis Puntos</span>

                                {/* PUNTOS GIGANTES CON BRILLO */}
                                <div className="relative">
                                    <div className="absolute inset-0 bg-amber-400 blur-2xl opacity-20 rounded-full"></div>
                                    <h2 className="text-6xl font-black text-transparent bg-clip-text bg-linear-to-r from-amber-200 via-amber-400 to-yellow-600 tracking-tighter drop-shadow-2xl scale-100 transform transition-transform group-hover:scale-105 duration-500">
                                        {points}
                                    </h2>
                                </div>

                                <p className="text-slate-500 text-xs font-medium mt-2">≈ ${(points / 1000).toFixed(2)} USD en valor canjeable</p>

                                {/* Billetera Secundaria */}
                                <div className="mt-6 flex items-center gap-2 bg-slate-950/50 px-4 py-2 rounded-xl border border-white/5 backdrop-blur-md">
                                    <Wallet className="w-4 h-4 text-emerald-400" />
                                    <span className="text-slate-300 text-sm font-medium">Saldo Wallet:</span>
                                    <span className="text-white text-sm font-bold font-mono">${Number(walletBalance).toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* GAMIFICATION BAR: Enhanced */}
                    <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-5 shadow-lg backdrop-blur-sm">
                        <div className="flex justify-between items-center mb-3">
                            <span className="text-xs font-bold text-slate-300 tracking-wide">Progreso a {userLevel === 'Oro' ? 'DIAMANTE' : userLevel === 'Plata' ? 'ORO' : 'PLATA'}</span>
                            <span className="text-amber-500 text-xs font-black font-mono bg-amber-500/10 px-2 py-0.5 rounded">{progressPercent}%</span>
                        </div>
                        <div className="h-4 w-full bg-slate-950 rounded-full overflow-hidden shadow-inner relative">
                            {/* Background Stripes */}
                            <div className="absolute inset-0 opacity-10 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.1)_25%,rgba(255,255,255,0.1)_50%,transparent_50%,transparent_75%,rgba(255,255,255,0.1)_75%,rgba(255,255,255,0.1)_100%)] bg-size-[20px_20px]"></div>
                            <div
                                className="h-full bg-linear-to-r from-amber-600 via-orange-500 to-yellow-400 shadow-[0_0_20px_rgba(245,158,11,0.5)] transition-all duration-1000 ease-out relative"
                                style={{ width: `${progressPercent}%` }}
                            >
                                <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                            </div>
                        </div>
                        <p className="text-center mt-3 text-xs text-slate-400 font-medium flex items-center justify-center gap-1.5">
                            <Trophy className="w-3 h-3 text-amber-500" />
                            {missingForNext > 0
                                ? <span>¡Estás a <strong className="text-white">${missingForNext}</strong> del siguiente nivel!</span>
                                : <span className="text-amber-400 font-bold">¡Nivel Máximo Alcanzado!</span>
                            }
                        </p>
                    </div>

                    {/* 2x2 ACTION GRID */}
                    <div className="grid grid-cols-2 gap-3">
                        {/* Botón 1: Canjear */}
                        <Link href="/menu" className="group bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/50 p-4 rounded-2xl flex flex-col items-center justify-center gap-2 transition-all shadow-lg hover:shadow-amber-500/10 active:scale-95">
                            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <Gift className="w-5 h-5" />
                            </div>
                            <span className="text-xs font-bold text-slate-200 group-hover:text-white">Canjear Burger</span>
                        </Link>

                        {/* Botón 2: Invitar */}
                        <a href={shareLink} target="_blank" className="group bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-green-500/50 p-4 rounded-2xl flex flex-col items-center justify-center gap-2 transition-all shadow-lg hover:shadow-green-500/10 active:scale-95">
                            <div className="w-10 h-10 rounded-xl bg-green-500/10 text-green-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <Users className="w-5 h-5" />
                            </div>
                            <span className="text-xs font-bold text-slate-200 group-hover:text-white">Invitar Amigos</span>
                        </a>

                        {/* Botón 3: Admin (Condicional) o Historial */}
                        {(profile?.role === 'admin' || profile?.role === 'superadmin') ? (
                            <Link href="/admin" className="group bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-purple-500/50 p-4 rounded-2xl flex flex-col items-center justify-center gap-2 transition-all shadow-lg hover:shadow-purple-500/10 active:scale-95 col-span-2">
                                <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <LayoutDashboard className="w-5 h-5" />
                                </div>
                                <span className="text-xs font-bold text-slate-200 group-hover:text-white">Panel de Control (Admin)</span>
                            </Link>
                        ) : (
                            <button className="group bg-slate-900 hover:bg-slate-800 border border-slate-800 p-4 rounded-2xl flex flex-col items-center justify-center gap-2 transition-all active:scale-95 opacity-50 cursor-not-allowed">
                                <div className="w-10 h-10 rounded-xl bg-slate-800 text-slate-500 flex items-center justify-center">
                                    <Settings className="w-5 h-5" />
                                </div>
                                <span className="text-xs font-bold text-slate-500">Ajustes</span>
                            </button>
                        )}
                    </div>
                </div>

                {/* WINNINGS: Active Rewards */}
                <div className="max-w-md mx-auto mt-8 px-2">
                    <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-4 flex items-center gap-2 px-2">
                        <Gift className="w-4 h-4 text-amber-500" /> Mis Premios (Raspaditos)
                    </h3>

                    {/* Fetch Logic for Rewards (Inline for simplicity in Server Component) */}
                    {/* Note: Ideally this should be up top, but we inject here for rapid fix */}
                    {(async () => {
                        const { data: rewards } = await supabase
                            .from('user_rewards')
                            .select('*')
                            .eq('user_id', user.id)
                            .order('created_at', { ascending: false })

                        if (!rewards || rewards.length === 0) {
                            return (
                                <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 text-center text-slate-500 text-xs">
                                    No tienes premios activos. ¡Pide y gana!
                                </div>
                            )
                        }

                        return (
                            <div className="space-y-3">
                                {rewards.map((reward: any) => (
                                    <div key={reward.id} className="bg-linear-to-r from-amber-900/20 to-slate-900 border border-amber-500/30 rounded-xl p-4 flex items-center gap-4 relative overflow-hidden group">
                                        <div className="absolute inset-0 bg-amber-500/5 group-hover:bg-amber-500/10 transition-colors" />

                                        <div className="w-12 h-12 bg-amber-500/20 rounded-full flex items-center justify-center border border-amber-500/50 z-10">
                                            {reward.prize_icon === 'burger' && <span className="text-2xl">🍔</span>}
                                            {reward.prize_icon === 'hotdog' && <span className="text-2xl">🌭</span>}
                                            {reward.prize_icon === 'soda' && <span className="text-2xl">🥤</span>}
                                            {reward.prize_icon === 'moto' && <span className="text-2xl">🛵</span>}
                                            {reward.prize_icon === 'coins' && <span className="text-2xl">💰</span>}
                                            {reward.prize_icon === 'users' && <span className="text-2xl">👥</span>}
                                            {reward.prize_icon === 'sad' && <span className="text-2xl">😢</span>}
                                        </div>

                                        <div className="flex-1 z-10">
                                            <h4 className="text-amber-200 font-bold text-sm">{reward.prize_title}</h4>
                                            <p className="text-amber-500/60 text-xs font-mono mt-1">{reward.prize_code}</p>
                                            <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border mt-2 inline-block ${reward.status === 'active' ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-slate-800 text-slate-500 border-slate-700'
                                                }`}>
                                                {reward.status === 'active' ? 'DISPONIBLE' : reward.status}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )
                    })()}
                </div>

                {/* TICKET STYLE HISTORY */}
                <div className="max-w-md mx-auto mt-8">
                    <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-4 flex items-center gap-2 px-2">
                        <History className="w-4 h-4" /> Historial Reciente
                    </h3>

                    <div className="space-y-4">
                        {orders?.map((order: any) => (
                            <div key={order.id} className="relative group">
                                {/* Ticket Notch Left */}
                                <div className="absolute top-1/2 left-0 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-slate-950 rounded-full z-10"></div>
                                {/* Ticket Notch Right */}
                                <div className="absolute top-1/2 right-0 translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-slate-950 rounded-full z-10"></div>

                                <div className="bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg p-5 flex items-center justify-between shadow-md transition-colors">
                                    <div className="flex flex-col gap-1 pl-2">
                                        <span className="text-white font-bold text-sm">Pedido #{order.id.slice(0, 6)}</span>
                                        <span className="text-slate-500 text-xs">{new Date(order.created_at).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex flex-col items-end pr-2">
                                        <span className="text-lg font-black text-white">${Number(order.total_amount).toFixed(2)}</span>
                                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${order.status === 'completed' ? 'text-emerald-400 border-emerald-500/20 bg-emerald-500/10' :
                                            order.status === 'cancelled' ? 'text-red-400 border-red-500/20 bg-red-500/10' :
                                                'text-amber-400 border-amber-500/20 bg-amber-500/10'
                                            }`}>
                                            {order.status}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Logout */}
                <div className="max-w-md mx-auto mt-12 px-6">
                    <form action={signOut}>
                        <button
                            type="submit"
                            className="w-full flex items-center justify-center gap-2 text-slate-500 hover:text-red-400 text-sm font-medium transition-colors p-4 rounded-xl hover:bg-red-500/5 group"
                        >
                            <LogOut className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                            Cerrar Sesión Segura
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}
function PlusIcon() {
    return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
}

function MinusIcon() {
    return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" /></svg>
}
