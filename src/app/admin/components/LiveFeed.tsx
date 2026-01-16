'use client'

import { Clock, CheckCircle2, XCircle, FileText } from 'lucide-react'
import Link from 'next/link'

interface Order {
    order_id: string
    customer_name: string
    total_amount: number | string // RPC might return string for numeric
    status: string
    created_at: string
}

export default function LiveFeed({ orders }: { orders: any[] }) {
    const safeOrders = Array.isArray(orders) ? orders.slice(0, 5) : []

    const getStatusConfig = (status: string) => {
        switch (status) {
            case 'completed':
            case 'delivered': return { color: 'bg-green-500', icon: CheckCircle2 }
            case 'cancelled': return { color: 'bg-red-500', icon: XCircle }
            default: return { color: 'bg-amber-500', icon: Clock }
        }
    }

    return (
        <div className="bg-slate-900 border-[3px] border-white shadow-[5px_5px_0px_#000] rounded-2xl p-0 flex flex-col h-full overflow-hidden">
            <div className="p-6 border-b-2 border-white/10 bg-slate-900/50 flex items-center justify-between">
                <div>
                    <h3 className="text-xl font-black text-white italic uppercase tracking-wider">Live Feed</h3>
                    <p className="text-xs text-slate-400 font-bold">Últimos pedidos</p>
                </div>
                <div className="animate-pulse w-3 h-3 rounded-full bg-green-500 shadow-[0_0_10px_#22c55e]"></div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                {safeOrders.length === 0 ? (
                    <div className="text-center text-slate-500 py-10">
                        <p className="text-sm font-bold">Sin actividad reciente</p>
                    </div>
                ) : (
                    safeOrders.map((order) => {
                        const status = getStatusConfig(order.status)
                        const StatusIcon = status.icon

                        return (
                            <Link
                                href={`/admin/orders/${order.order_id}`}
                                key={order.order_id}
                                className="block group"
                            >
                                <div className="bg-slate-800/50 border-2 border-slate-950 hover:border-white p-3 rounded-xl transition-all hover:-translate-x-1 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-full ${status.color} border-2 border-black flex items-center justify-center text-black`}>
                                            <StatusIcon className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-white font-bold text-sm group-hover:text-amber-500 transition-colors">
                                                {order.customer_name || 'Cliente'}
                                            </p>
                                            <p className="text-[10px] text-slate-400 font-mono">
                                                #{order.order_id.toString().slice(0, 8)} • {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="text-right">
                                        <span className="block text-white font-black text-lg">
                                            ${Number(order.total_amount || order.total_order || 0).toFixed(2)}
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        )
                    })
                )}
            </div>

            <div className="p-4 border-t-2 border-white/10 bg-slate-950/30">
                <Link href="/admin/orders" className="block w-full text-center text-xs font-bold text-slate-500 hover:text-white uppercase tracking-widest transition-colors">
                    Ver todo el historial
                </Link>
            </div>
        </div>
    )
}
