'use client'

import { useState } from 'react'
import { updateDollarRate } from '@/app/actions/admin-config'
import { RefreshCw, Save } from 'lucide-react'

export default function DollarRateEditor({ initialRate }: { initialRate: string }) {
    const [rate, setRate] = useState(initialRate)
    const [loading, setLoading] = useState(false)

    const handleUpdate = async () => {
        setLoading(true)
        const res = await updateDollarRate(rate)
        if (res.success) {
            alert('Tasa actualizada correctamente')
        } else {
            alert('Error: ' + res.error)
        }
        setLoading(false)
    }

    return (
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex items-center justify-between gap-6 shadow-lg">
            <div>
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <RefreshCw className="w-5 h-5 text-amber-500" />
                    Tasa del Día (BCV/Paralelo)
                </h3>
                <p className="text-slate-400 text-sm mt-1">
                    Esta tasa se usa para calcular todos los precios en Bolívares del menú.
                </p>
            </div>

            <div className="flex items-center gap-3 bg-slate-950 p-2 rounded-xl border border-slate-800">
                <span className="text-slate-500 font-bold pl-2">Bs/USD</span>
                <input
                    type="number"
                    step="0.01"
                    value={rate}
                    onChange={(e) => setRate(e.target.value)}
                    className="bg-transparent text-white font-mono text-xl font-bold w-24 focus:outline-none text-right"
                />
                <button
                    onClick={handleUpdate}
                    disabled={loading || rate === initialRate}
                    className="ml-2 bg-amber-500 hover:bg-amber-600 text-slate-950 p-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Save className="w-5 h-5" />
                </button>
            </div>
        </div>
    )
}
