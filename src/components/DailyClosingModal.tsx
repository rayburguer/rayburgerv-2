'use client'

import { useState, useEffect } from 'react'
import { X, DollarSign, Package, Truck, ShoppingBag, Loader2, Calendar } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import BurgerSpinner from '@/components/BurgerSpinner'

interface DailyClosingModalProps {
    isOpen: boolean
    onClose: () => void
}

export default function DailyClosingModal({ isOpen, onClose }: DailyClosingModalProps) {
    const [loading, setLoading] = useState(true)
    const [data, setData] = useState<any>(null)
    const supabase = createClient()
    const today = new Date().toISOString().split('T')[0]

    useEffect(() => {
        if (isOpen) {
            fetchReport()
        }
    }, [isOpen])

    const fetchReport = async () => {
        setLoading(true)
        const { data, error } = await supabase.rpc('generate_daily_closing', {
            report_date: today
        })

        if (error) {
            console.error(error)
            alert('Error al generar cierre: ' + error.message)
        } else {
            setData(data)
        }
        setLoading(false)
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden relative animate-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-950/50">
                    <div>
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-amber-500" />
                            Cierre de Caja
                        </h2>
                        <p className="text-xs text-slate-400 font-mono mt-1">Fecha: {today}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-10 space-y-4">
                            <BurgerSpinner size="lg" />
                            <p className="text-slate-500 text-sm animate-pulse">Generando Reporte...</p>
                        </div>
                    ) : (data && (
                        <>
                            {/* Total Card */}
                            <div className="bg-linear-to-br from-green-900/20 to-emerald-900/10 border border-green-500/20 rounded-2xl p-6 text-center relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-10">
                                    <DollarSign className="w-24 h-24 text-green-500 rotate-12" />
                                </div>
                                <p className="text-sm text-green-400 font-bold uppercase tracking-widest mb-1">Ventas Totales (USD)</p>
                                <h3 className="text-5xl font-bold text-white tracking-tighter">
                                    ${Number(data.total_sales).toFixed(2)}
                                </h3>
                                <div className="mt-4 inline-flex items-center gap-2 bg-slate-950/30 px-3 py-1 rounded-full border border-white/5">
                                    <Package className="w-4 h-4 text-slate-400" />
                                    <span className="text-sm text-slate-200 font-mono">{data.total_orders} pedidos</span>
                                </div>
                            </div>

                            {/* Breakdown */}
                            <div className="grid grid-cols-2 gap-4">
                                {/* Delivery */}
                                <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                                    <div className="flex items-center gap-2 mb-2 text-slate-300">
                                        <Truck className="w-4 h-4 text-blue-400" />
                                        <span className="text-xs font-bold uppercase">Delivery</span>
                                    </div>
                                    <p className="text-2xl font-bold text-white">${Number(data.summary.delivery_total).toFixed(2)}</p>
                                    <p className="text-xs text-slate-500">{data.summary.delivery_count} órdenes</p>
                                </div>

                                {/* Pickup */}
                                <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                                    <div className="flex items-center gap-2 mb-2 text-slate-300">
                                        <ShoppingBag className="w-4 h-4 text-orange-400" />
                                        <span className="text-xs font-bold uppercase">Pickup</span>
                                    </div>
                                    <p className="text-2xl font-bold text-white">${Number(data.summary.pickup_total).toFixed(2)}</p>
                                    <p className="text-xs text-slate-500">{data.summary.pickup_count} órdenes</p>
                                </div>
                            </div>
                        </>
                    ))}
                </div>

                {/* Footer */}
                <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-lg transition-colors border border-slate-700"
                    >
                        Cerrar
                    </button>
                    {/* Future: Print Button? */}
                </div>
            </div>
        </div>
    )
}
