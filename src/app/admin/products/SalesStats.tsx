'use client'

import { TrendingUp, ShoppingBag, Users } from 'lucide-react'

export default function SalesStats({ stats }: { stats: any }) {
    if (!stats) return null

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-lg">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-green-500/10 rounded-xl">
                        <TrendingUp className="w-8 h-8 text-green-500" />
                    </div>
                    <div>
                        <p className="text-slate-400 text-sm font-medium">Ventas de Hoy (Cierre)</p>
                        <h3 className="text-2xl font-bold text-white">${stats.ventas_totales?.toFixed(2) || '0.00'}</h3>
                    </div>
                </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-lg">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-500/10 rounded-xl">
                        <ShoppingBag className="w-8 h-8 text-blue-500" />
                    </div>
                    <div>
                        <p className="text-slate-400 text-sm font-medium">Entregas de Hoy</p>
                        <h3 className="text-2xl font-bold text-white">{stats.pedidos_entregados || 0}</h3>
                    </div>
                </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-lg">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-purple-500/10 rounded-xl">
                        <Users className="w-8 h-8 text-purple-500" />
                    </div>
                    <div>
                        <p className="text-slate-400 text-sm font-medium">Clientes Registrados</p>
                        <h3 className="text-2xl font-bold text-white">{stats.clientes_registrados || 0}</h3>
                    </div>
                </div>
            </div>
        </div>
    )
}
