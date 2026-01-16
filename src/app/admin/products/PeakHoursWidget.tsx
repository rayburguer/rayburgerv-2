'use client'

import { Clock, Zap } from 'lucide-react'

export default function PeakHoursWidget({ data }: { data: any[] }) {
    if (!data || data.length === 0) return null

    // Helper para formato 12h
    const formatHour = (h: number) => {
        const ampm = h >= 12 ? 'PM' : 'AM'
        const hour12 = h % 12 || 12
        return `${hour12} ${ampm}`
    }

    // Encontrar el maximo para la barra de progreso relativa
    const maxOrders = Math.max(...data.map(d => d.cantidad_pedidos))

    return (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg h-full">
            <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
                <Clock className="w-5 h-5 text-purple-500" />
                Horas Pico (7 Días)
            </h3>

            <div className="space-y-3">
                {data.slice(0, 5).map((item, index) => (
                    <div key={index} className="flex items-center gap-3">
                        <div className="w-16 text-right">
                            <span className="text-sm font-bold text-slate-300">{formatHour(item.hora_del_dia)}</span>
                        </div>

                        <div className="flex-1 h-3 bg-slate-800 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-purple-600 rounded-full"
                                style={{ width: `${(item.cantidad_pedidos / maxOrders) * 100}%` }}
                            />
                        </div>

                        <div className="w-8 text-xs text-slate-500 font-mono">
                            {item.cantidad_pedidos}
                        </div>
                    </div>
                ))}
            </div>

            {data.length > 5 && (
                <p className="text-center text-xs text-slate-600 mt-4">Mostrando top 5 horas activas</p>
            )}
        </div>
    )
}
