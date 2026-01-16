'use client'

import { useState } from 'react'
import { ShoppingBag, Star, CheckCircle2, ChevronRight, Clock } from 'lucide-react'
import FeedbackModal from '@/components/FeedbackModal'

interface Order {
    id: string
    created_at: string
    total_amount: number
    status: string
    feedback_given: boolean // Booleano calculado en el padre
}

export default function OrderHistoryList({ orders }: { orders: Order[] }) {
    const [selectedOrder, setSelectedOrder] = useState<string | null>(null)

    if (!orders || orders.length === 0) {
        return (
            <div className="text-center p-8 border border-dashed border-slate-800 rounded-xl bg-slate-900/30">
                <ShoppingBag className="w-8 h-8 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-500 text-sm">Aún no has realizado pedidos.</p>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            {orders.map((order) => {
                const isCompleted = order.status === 'completed'
                const canRate = isCompleted && !order.feedback_given

                return (
                    <div key={order.id} className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center justify-between group hover:border-slate-700 transition-colors">
                        <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${isCompleted ? 'bg-green-500/10 text-green-500' : 'bg-slate-800 text-slate-500'
                                }`}>
                                {isCompleted ? <CheckCircle2 className="w-6 h-6" /> : <Clock className="w-6 h-6" />}
                            </div>
                            <div>
                                <h4 className="text-white font-bold text-sm">Pedido #{order.id.slice(0, 6)}</h4>
                                <p className="text-slate-500 text-xs font-mono">
                                    {new Date(order.created_at).toLocaleDateString()} • ${Number(order.total_amount).toFixed(2)}
                                </p>
                            </div>
                        </div>

                        {canRate ? (
                            <button
                                onClick={() => setSelectedOrder(order.id)}
                                className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-900 text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-lg shadow-amber-500/20 animate-pulse hover:animate-none transition-all"
                            >
                                <Star className="w-3.5 h-3.5 fill-slate-900" />
                                Calificar
                            </button>
                        ) : (
                            <div className="px-3 py-1.5 rounded-lg border border-slate-800 text-slate-500 text-xs font-bold">
                                {order.status.toUpperCase()}
                            </div>
                        )}
                    </div>
                )
            })}

            {/* Modal de Calificación */}
            {selectedOrder && (
                <FeedbackModal
                    orderId={selectedOrder}
                    isOpen={!!selectedOrder}
                    onClose={() => setSelectedOrder(null)}
                />
            )}
        </div>
    )
}
