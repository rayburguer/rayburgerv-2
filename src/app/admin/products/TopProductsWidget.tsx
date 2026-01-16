'use client'

import { Trophy, Utensils } from 'lucide-react'

export default function TopProductsWidget({ data }: { data: any[] }) {
    if (!data || data.length === 0) return null

    return (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg h-full">
            <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
                <Trophy className="w-5 h-5 text-yellow-500" />
                Lo Más Vendido (7 Días)
            </h3>

            <div className="space-y-4">
                {data.map((item, index) => (
                    <div key={index} className="flex items-center gap-4 group">
                        <div className="relative">
                            <span className={`absolute -top-2 -left-2 w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold border-2 border-slate-900
                                ${index === 0 ? 'bg-yellow-500 text-slate-900' :
                                    index === 1 ? 'bg-slate-400 text-slate-900' :
                                        index === 2 ? 'bg-amber-700 text-slate-100' : 'bg-slate-800 text-slate-500'}`}
                            >
                                #{index + 1}
                            </span>
                            <img
                                src={item.image_url || 'https://placehold.co/50'}
                                alt={item.name}
                                className="w-12 h-12 rounded-lg object-cover bg-slate-800 group-hover:scale-105 transition-transform"
                            />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-slate-200 font-medium truncate">{item.name}</p>
                            <p className="text-xs text-slate-500">{item.total_vendido} unidades entregadas</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
