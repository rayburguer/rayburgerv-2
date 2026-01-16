import { createClient } from '@/utils/supabase/server'
import { Eye, Clock, CheckCircle2, MessageCircle, FileText, Smartphone, Star } from 'lucide-react'
import Link from 'next/link'
import AdminStatsGrid from './AdminStatsGrid'
import AdminHeaderActions from './AdminHeaderActions'
import SalesChart from './components/SalesChart'
import LiveFeed from './components/LiveFeed'
import { getDashboardStats, getAdminOrders, getWeeklySales } from '@/app/actions/admin'

export default async function AdminDashboardPage() {
    const supabase = await createClient()

    // 1. Fetch KPIs
    const kpiData = await getDashboardStats()

    // 2. Fetch Orders (Ahora vía RPC Blindado para ver nombres)
    const orders = await getAdminOrders()

    // 3. Fetch Weekly Sales
    const weeklySales = await getWeeklySales()

    // Business Health Stats
    const { data: healthData } = await supabase
        .from('v_business_health')
        .select('*')
        .single()

    // Fallback segura si no hay data
    const health = healthData || {
        total_reviews: 0,
        avg_sabor: 0,
        avg_atencion: 0,
        avg_tiempo: 0,
        avg_empaque: 0,
        overall_score: 0
    }

    // El RPC 'getAdminOrders' maneja sus propios errores internamente y devuelve []

    // Función de formateo WhatsApp
    const getWhatsAppLink = (phone: string | null) => {
        if (!phone) return '#'
        let clean = phone.replace(/\D/g, '')
        if (clean.startsWith('0')) clean = '58' + clean.slice(1)
        else if (!clean.startsWith('58')) clean = '58' + clean
        return `https://wa.me/${clean}`
    }

    return (
        <div className="space-y-8 pb-10">
            {/* KPI GRID (Nuevo V4) */}
            <AdminStatsGrid stats={kpiData} />

            {/* CHARTS ROW */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-auto lg:h-[420px]">
                <div className="lg:col-span-2 h-[300px] lg:h-full">
                    <SalesChart data={weeklySales} />
                </div>
                <div className="h-[400px] lg:h-full">
                    <LiveFeed orders={orders} />
                </div>
            </div>

            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mt-8 gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-white">Tablero de Pedidos</h2>
                    <p className="text-slate-400 text-sm">Monitor de Órdenes Pendientes & Pagos V3</p>
                </div>
                <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                    <AdminHeaderActions />
                    <span className="bg-amber-500/10 text-amber-500 border border-amber-500/20 px-4 py-2 rounded-xl text-sm font-mono font-bold flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        Pendientes: {orders?.filter((o: any) => o.status !== 'completed' && o.status !== 'cancelled').length || 0}
                    </span>
                </div>
            </div>

            {/* Business Health Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col items-center justify-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-2 opacity-5">
                        <Star className="w-12 h-12 text-white" />
                    </div>
                    <span className="text-3xl font-bold text-white mb-1">{Number(health.overall_score).toFixed(1)}</span>
                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest text-center">Score Global</span>
                    <span className="text-[10px] text-slate-600 mt-1">{health.total_reviews} Reseñas</span>
                </div>

                <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col items-center justify-center">
                    <span className={`text-xl font-bold ${Number(health.avg_sabor) >= 9 ? 'text-green-500' : 'text-slate-200'}`}>{Number(health.avg_sabor).toFixed(1)}</span>
                    <span className="text-[10px] text-slate-500 uppercase font-bold mt-1">Sabor</span>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col items-center justify-center">
                    <span className={`text-xl font-bold ${Number(health.avg_atencion) >= 9 ? 'text-green-500' : 'text-slate-200'}`}>{Number(health.avg_atencion).toFixed(1)}</span>
                    <span className="text-[10px] text-slate-500 uppercase font-bold mt-1">Atención</span>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col items-center justify-center">
                    <span className={`text-xl font-bold ${Number(health.avg_tiempo) >= 9 ? 'text-green-500' : 'text-slate-200'}`}>{Number(health.avg_tiempo).toFixed(1)}</span>
                    <span className="text-[10px] text-slate-500 uppercase font-bold mt-1">Tiempo</span>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col items-center justify-center">
                    <span className={`text-xl font-bold ${Number(health.avg_empaque) >= 9 ? 'text-green-500' : 'text-slate-200'}`}>{Number(health.avg_empaque).toFixed(1)}</span>
                    <span className="text-[10px] text-slate-500 uppercase font-bold mt-1">Empaque</span>
                </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-950/50 border-b border-slate-800 text-slate-400 text-xs uppercase tracking-wider">
                                <th className="p-4 font-medium">ID / Fecha</th>
                                <th className="p-4 font-medium">Cliente</th>
                                <th className="p-4 font-medium text-right">Total Real</th>
                                <th className="p-4 font-medium text-center">Reporte Pago</th>
                                <th className="p-4 font-medium text-center">Estado</th>
                                <th className="p-4 font-medium text-center"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                            {orders?.map((order: any) => {
                                const waLink = getWhatsAppLink(order.customer_phone)
                                const hasDebt = (order.amount_paid_real || 0) > 0
                                const usedWallet = (order.total_order || 0) > (order.amount_paid_real || 0)

                                return (
                                    <tr key={order.order_id} className="hover:bg-slate-800/50 transition-colors group">
                                        <td className="p-4">
                                            <div className="flex flex-col">
                                                <span className="font-mono text-slate-300 font-bold text-sm">#{order.order_id?.substring(0, 8)}</span>
                                                <span className="text-slate-500 text-xs">{new Date(order.created_at).toLocaleString('es-VE', { hour: '2-digit', minute: '2-digit' })}</span>
                                            </div>
                                        </td>

                                        <td className="p-4">
                                            <div className="flex flex-col">
                                                <span className="text-white font-medium text-sm">{order.customer_name || 'Anónimo'}</span>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="text-slate-500 text-xs font-mono">
                                                        {order.customer_phone || 'Sin tel'}
                                                    </span>
                                                    {order.customer_phone && (
                                                        <a href={waLink} target="_blank" rel="noopener noreferrer" className="p-1 text-green-500 hover:text-green-400 transition-colors opacity-50 group-hover:opacity-100">
                                                            <MessageCircle className="w-3.5 h-3.5" />
                                                        </a>
                                                    )}
                                                </div>
                                            </div>
                                        </td>

                                        <td className="p-4 text-right">
                                            <div className="flex flex-col items-end">
                                                <span className="font-bold text-white text-lg">${Number(order.amount_paid_real || 0).toFixed(2)}</span>
                                                {usedWallet && (
                                                    <span className="text-[10px] text-amber-500 font-bold uppercase tracking-wide bg-amber-500/10 px-1.5 py-0.5 rounded">
                                                        Saldo Usado
                                                    </span>
                                                )}
                                            </div>
                                        </td>

                                        <td className="p-4">
                                            <div className="flex justify-center">
                                                {order.payment_proof_url ? (
                                                    <a
                                                        href={order.payment_proof_url} // Placeholder logic: Si es un nombre de archivo, necesitaría getPublicUrl. Asumimos URL completa o 'capture_subido.jpg' placeholder
                                                        target="_blank"
                                                        className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded-lg hover:bg-purple-500/20 transition-colors text-xs font-bold"
                                                    >
                                                        <FileText className="w-3.5 h-3.5" />
                                                        Ver Capture
                                                    </a>
                                                ) : order.payment_ref ? (
                                                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 text-slate-300 border border-slate-700 rounded-lg text-xs font-mono">
                                                        <Smartphone className="w-3.5 h-3.5 text-slate-500" />
                                                        Ref: {order.payment_ref}
                                                    </div>
                                                ) : (
                                                    <span className="text-slate-600 text-[10px] uppercase font-bold">Sin Reporte</span>
                                                )}
                                            </div>
                                        </td>

                                        <td className="p-4 text-center">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wide ${order.status === 'completed' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' :
                                                order.status === 'paid' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                                                    'bg-amber-500/10 text-amber-500 border-amber-500/20'
                                                }`}>
                                                {order.status}
                                            </span>
                                        </td>

                                        <td className="p-4 text-center">
                                            <Link
                                                href={`/admin/orders/${order.order_id}`}
                                                className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-amber-500 text-slate-950 hover:bg-amber-400 hover:scale-110 transition-all shadow-lg shadow-amber-900/20"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </Link>
                                        </td>
                                    </tr>
                                )
                            })}

                            {(!orders || orders.length === 0) && (
                                <tr>
                                    <td colSpan={6} className="p-12 text-center text-slate-500 flex flex-col items-center justify-center gap-2">
                                        <CheckCircle2 className="w-8 h-8 opacity-20" />
                                        <p>No hay pedidos pendientes por procesar.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
