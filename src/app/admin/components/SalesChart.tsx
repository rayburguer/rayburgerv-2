'use client'

import { BarChart3 } from 'lucide-react'

interface SalesData {
    day: string
    total: number
}

export default function SalesChart({ data }: { data: SalesData[] }) {
    if (!data || data.length === 0) {
        return (
            <div className="bg-slate-900 border-[3px] border-white shadow-[5px_5px_0px_#000] rounded-2xl p-6 h-full flex flex-col items-center justify-center text-slate-500">
                <BarChart3 className="w-12 h-12 mb-2 opacity-50" />
                <p className="font-bold text-sm uppercase">Sin datos suficientes</p>
            </div>
        )
    }

    const maxVal = Math.max(...data.map(d => Number(d.total))) || 100

    return (
        <div className="bg-slate-900 border-[3px] border-white shadow-[5px_5px_0px_#000] rounded-2xl p-6 flex flex-col relative overflow-hidden">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-xl font-black text-white italic uppercase tracking-wider">Tendencia Semanal</h3>
                    <p className="text-xs text-slate-400 font-bold">Últimos 7 días</p>
                </div>
                <div className="bg-amber-500 text-slate-900 p-2 rounded-lg border-2 border-slate-900 shadow-sm">
                    <BarChart3 className="w-5 h-5" />
                </div>
            </div>

            <div className="flex items-end justify-between gap-2 h-40 mt-auto">
                {data.map((item, i) => {
                    const height = (Number(item.total) / maxVal) * 100
                    const isToday = i === data.length - 1

                    return (
                        <div key={i} className="flex flex-col items-center gap-2 group w-full">
                            <div className="relative w-full flex items-end justify-center h-full">
                                {/* Bar */}
                                <div
                                    style={{ height: `${height}%` }}
                                    className={`
                                        w-full max-w-[40px] rounded-t-lg border-x-2 border-t-2 border-black transition-all duration-500
                                        ${isToday ? 'bg-amber-500' : 'bg-green-400'}
                                        group-hover:opacity-80
                                    `}
                                >
                                    {/* Tooltip on hover */}
                                    <div className="opacity-0 group-hover:opacity-100 absolute -top-10 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] font-bold px-2 py-1 rounded whitespace-nowrap pointer-events-none transition-opacity">
                                        ${Number(item.total).toFixed(2)}
                                    </div>
                                </div>
                            </div>
                            {/* Label */}
                            <span className={`text-[10px] font-black uppercase ${isToday ? 'text-amber-500' : 'text-slate-500'}`}>
                                {item.day}
                            </span>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
