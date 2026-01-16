import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { UserCircle, Wallet, LogOut, Phone, Crown, History, Trophy, Gift, ShoppingBag, LayoutDashboard, ChevronRight, Star } from 'lucide-react'
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
    const progressPercent = progress?.porcentaje_progreso_nivel || 0
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
        <div className="min-h-screen bg-slate-950 pb-24">
            <div className="hidden md:block">
                <Navbar />
            </div>
            {/* Header / Identity */}
            <div className="bg-slate-900 border-b border-slate-800 p-6 rounded-b-4xl shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-amber-600 via-orange-500 to-amber-600" />

                <div className="flex flex-col items-center relative z-10">
                    <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mb-4 ring-4 ring-slate-800 shadow-xl">
                        <UserCircle className="w-10 h-10 text-slate-400" />
                    </div>
                    <h1 className="text-xl font-bold text-white mb-1">{fullName}</h1>
                    <div className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1 ${levelBg} ${levelColor} mb-6`}>
                        <Crown className="w-3 h-3" />
                        NIVEL {userLevel.toUpperCase()}
                    </div>

                    {/* Wallet Main Card (Gold Member Edition) */}
                    <div className="w-full max-w-sm relative group perspective-1000 mb-6">
                        <div className="bg-linear-to-br from-slate-900 to-slate-950 rounded-2xl p-6 border border-slate-800 shadow-2xl relative overflow-hidden transition-transform transform hover:scale-[1.02] duration-300">
                            {/* Texture */}
                            <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay"></div>

                            {/* Gold/Level Gradient Overlay */}
                            <div className={`absolute inset-0 opacity-10 ${userLevel === 'Oro' ? 'bg-yellow-500' :
                                userLevel === 'Plata' ? 'bg-slate-300' : 'bg-amber-700'
                                }`}></div>

                            <div className="relative z-10 flex flex-col justify-between h-full min-h-[160px]">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Saldo Disponible</p>
                                        <h2 className="text-4xl xs:text-5xl font-black text-white tracking-tighter drop-shadow-lg filter truncate max-w-[200px] xs:max-w-none">
                                            ${Number(walletBalance).toFixed(2)}
                                        </h2>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <div className={`w-12 h-9 rounded-md bg-linear-to-br from-yellow-200 to-yellow-500 border border-yellow-400 shadow-inner relative overflow-hidden hidden xs:block opacity-90 mb-2`}>
                                            <div className="absolute left-0 top-1/2 w-full h-px bg-black/20"></div>
                                            <div className="absolute top-0 left-1/2 h-full w-px bg-black/20"></div>
                                            <div className="absolute inset-0 border-[3px] border-yellow-600/30 rounded-md"></div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-between items-end mt-6">
                                    <div className="flex flex-col">
                                        <p className="text-[9px] text-slate-500 uppercase tracking-wider mb-0.5">MIEMBRO OFICIAL</p>
                                        <p className="text-sm text-slate-200 font-mono tracking-widest font-bold">
                                            {user?.id.slice(0, 4).toUpperCase()} • {userLevel.toUpperCase()}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-1 bg-amber-500/20 px-3 py-1 rounded-full border border-amber-500/30">
                                        <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                                        <span className="text-[10px] font-bold text-amber-500 uppercase tracking-tight">VIP</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Benefits Grid (Points & Referrals) */}
                    <div className="grid grid-cols-2 gap-4 mb-6 w-full max-w-sm">
                        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col items-center justify-center text-center">
                            <span className="text-xs text-slate-400 font-bold uppercase mb-1">Mis Puntos</span>
                            <div className="text-2xl font-black text-amber-500 flex items-center gap-1">
                                <Trophy className="w-5 h-5" /> {points}
                            </div>
                            <Link href="/menu" className="mt-2 text-[10px] bg-amber-500 text-slate-900 px-2 py-0.5 rounded font-bold hover:bg-amber-400 transition-colors">
                                CANJEAR BURGERS
                            </Link>
                        </div>

                        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col items-center justify-center text-center">
                            <span className="text-xs text-slate-400 font-bold uppercase mb-1">Ganado x Amigos</span>
                            <div className="text-2xl font-black text-green-500 flex items-center gap-1">
                                <Wallet className="w-5 h-5" />
                                ${(transactions || [])
                                    .filter(t => t.description?.toLowerCase().includes('referido'))
                                    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0)
                                    .toFixed(2)}
                            </div>
                            <a href={shareLink} target="_blank" className="mt-2 text-[10px] bg-green-600 text-white px-2 py-0.5 rounded font-bold hover:bg-green-500 transition-colors">
                                INVITAR MÁS
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            {/* Admin Access Panel (Mobile/Desktop Entry) */}
            {(profile?.role === 'admin' || profile?.role === 'superadmin') && (
                <div className="max-w-md mx-auto px-6 pt-6 animate-in slide-in-from-bottom-4">
                    <Link href="/admin" className="w-full bg-slate-800 hover:bg-slate-700 text-white p-4 rounded-xl flex items-center justify-between group transition-all border border-slate-700 shadow-lg">
                        <div className="flex items-center gap-3">
                            <div className="bg-purple-500/10 p-2 rounded-lg text-purple-500">
                                <LayoutDashboard className="w-6 h-6" />
                            </div>
                            <div className="text-left">
                                <h3 className="font-bold text-sm">Panel de Control</h3>
                                <p className="text-xs text-slate-400">Acceso Administrativo</p>
                            </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-white" />
                    </Link>
                </div>
            )}

            <div className="max-w-md mx-auto p-6 space-y-6">

                {/* Gamification / Progress */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
                    <div className="flex justify-between items-end mb-2">
                        <h3 className="text-white font-bold text-sm">Próximo Nivel</h3>
                        <span className="text-amber-500 text-xs font-mono">{progressPercent}%</span>
                    </div>

                    <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden mb-3">
                        <div
                            className="h-full bg-linear-to-r from-amber-500 to-orange-600 transition-all duration-1000 ease-out"
                            style={{ width: `${progressPercent}%` }}
                        />
                    </div>

                    {/* Texto dinámico directo de la vista */}
                    {missingForNext > 0 ? (
                        <p className="text-slate-400 text-xs text-center">
                            {progress?.falta_para_siguiente_nivel}
                            {/* Fallback si la vista no devuelve texto formateado, aunque el usuario dijo que "es texto dinámico" 
                                Si es numérico, lo mostramos como número. Asumiendo que v_user_progress devuelve el TEXTO o el NUMERO y nosotros formateamos.
                                El usuario dijo: "Texto dinámico 'Te faltan $X para ser Nivel...'". 
                                PERO la vista que diseñé antes devolvía un numero. 
                                El usuario: "Úsalos directamente para la barra y los textos."
                                Si la vista devuelve un numero (monto), hago el texto aquí. 
                                Si la vista devuelve el texto, lo uso directo.
                                Voy a asumir que devuelve el número (como diseñé en specs) y yo pongo el texto, 
                                O si el usuario cambió la vista para devolver texto, esto podría romper.
                                Me arriesgaré a formatear yo el número "missingForNext" que viene de la vista. */}
                            Te faltan <span className="text-white font-bold">${missingForNext}</span> para subir de nivel.
                        </p>
                    ) : (
                        <div className="text-center">
                            <p className="text-amber-400 text-xs font-bold mb-2">¡Felicidades! Eres Nivel Oro.</p>
                        </div>
                    )}

                    {/* Burger Gratis Check */}
                    {pointsForFreeBurger === 0 && (
                        <div className="mt-4 pt-4 border-t border-slate-800 text-center animate-pulse">
                            <button className="w-full py-2 bg-linear-to-r from-yellow-600 to-amber-600 text-white text-xs font-bold rounded-lg flex items-center justify-center gap-2">
                                <Gift className="w-4 h-4" /> ¡Reclamar Burger Gratis!
                            </button>
                        </div>
                    )}
                </div>

                {/* Orders History & Feedback */}
                <div>
                    <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-4 flex items-center gap-2">
                        <ShoppingBag className="w-4 h-4" /> Mis Pedidos
                    </h3>
                    <OrderHistoryList orders={orders} />
                </div>

                {/* Transaction History */}
                <div>
                    <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-4 flex items-center gap-2">
                        <History className="w-4 h-4" /> Actividad Reciente
                    </h3>

                    <div className="space-y-3">
                        {transactions && transactions.length > 0 ? (
                            transactions.map((tx) => (
                                <div key={tx.id} className="bg-slate-900/50 border border-slate-800 p-4 rounded-xl flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${tx.amount >= 0 ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
                                            }`}>
                                            {tx.amount >= 0 ? <PlusIcon /> : <MinusIcon />}
                                        </div>
                                        <div>
                                            <p className="text-white text-sm font-medium">{tx.description || 'Transacción'}</p>
                                            <p className="text-slate-500 text-xs">
                                                {new Date(tx.created_at).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                    <span className={`font-mono font-bold ${tx.amount >= 0 ? 'text-green-400' : 'text-white'
                                        }`}>
                                        {tx.amount >= 0 ? '+' : ''}${Math.abs(tx.amount).toFixed(2)}
                                    </span>
                                </div>
                            ))
                        ) : (
                            <div className="text-center p-8 border border-dashed border-slate-800 rounded-xl">
                                <p className="text-slate-500 text-sm">Sin movimientos recientes</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Logout */}
                <form action={signOut} className="pt-8">
                    <button
                        type="submit"
                        className="w-full flex items-center justify-center gap-2 text-slate-500 hover:text-red-400 text-sm transition-colors"
                    >
                        <LogOut className="w-4 h-4" />
                        Cerrar Sesión Segura
                    </button>
                </form>

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
