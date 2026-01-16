'use client'

import { useState } from 'react'
import { createModifier, deleteModifier } from '@/app/actions/admin-products'
import { Plus, Trash2, Layers, Loader2 } from 'lucide-react'

export default function ExtrasManager({ modifiers }: { modifiers: any[] }) {
    const [loading, setLoading] = useState(false)
    const [newMod, setNewMod] = useState({ name: '', type: 'extra', price_usd: '' })

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newMod.name) return

        setLoading(true)
        const res = await createModifier({
            name: newMod.name,
            type: newMod.type,
            price_usd: parseFloat(newMod.price_usd || '0')
        })

        if (!res.success) alert('Error: ' + res.error)
        else setNewMod({ name: '', type: 'extra', price_usd: '' })
        setLoading(false)
    }

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`¿Borrar extra "${name}"?`)) return
        const res = await deleteModifier(id)
        if (!res.success) alert('Error: ' + res.error)
    }

    return (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg h-full flex flex-col">
            <div className="p-4 border-b border-slate-800 bg-slate-950/30">
                <h3 className="font-bold text-white flex items-center gap-2">
                    <Layers className="w-5 h-5 text-amber-500" />
                    Extras & Modificadores
                </h3>
            </div>

            {/* Add Form */}
            <div className="p-4 border-b border-slate-800 bg-slate-900/50">
                <form onSubmit={handleAdd} className="flex flex-col gap-2">
                    <input
                        placeholder="Nombre (ej: Doble Carne)"
                        className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-amber-500 outline-none"
                        value={newMod.name}
                        onChange={e => setNewMod({ ...newMod, name: e.target.value })}
                    />
                    <div className="flex gap-2">
                        <select
                            className="bg-slate-950 border border-slate-700 rounded-lg px-2 py-2 text-sm text-white focus:border-amber-500 outline-none"
                            value={newMod.type}
                            onChange={e => setNewMod({ ...newMod, type: e.target.value })}
                        >
                            <option value="base">Base (Sin Costo)</option>
                            <option value="extra">Extra (+$$)</option>
                            <option value="special">Especial (Lógica)</option>
                        </select>
                        <input
                            type="number"
                            step="0.01"
                            placeholder="Precio $"
                            className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-amber-500 outline-none"
                            value={newMod.price_usd}
                            onChange={e => setNewMod({ ...newMod, price_usd: e.target.value })}
                            disabled={newMod.type === 'base'}
                        />
                        <button
                            type="submit"
                            disabled={loading || !newMod.name}
                            className="bg-amber-500 hover:bg-amber-600 text-slate-900 p-2 rounded-lg transition-colors font-bold"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
                        </button>
                    </div>
                </form>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-2">
                <ul className="space-y-1">
                    {modifiers.map(mod => (
                        <li key={mod.id} className="flex justify-between items-center p-2 rounded-lg hover:bg-slate-800 transition-colors group">
                            <div>
                                <p className="text-sm font-medium text-slate-200">{mod.name}</p>
                                <div className="flex gap-2 text-[10px] uppercase font-bold">
                                    <span className={`text-slate-500 ${mod.type === 'extra' ? 'text-green-500' : ''}`}>{mod.type}</span>
                                    {mod.price_usd > 0 && <span className="text-amber-500">${mod.price_usd}</span>}
                                </div>
                            </div>
                            <button
                                onClick={() => handleDelete(mod.id, mod.name)}
                                className="text-slate-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all p-1"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </li>
                    ))}
                    {modifiers.length === 0 && (
                        <li className="text-center text-slate-500 text-xs py-4">Sin extras definidos</li>
                    )}
                </ul>
            </div>
        </div>
    )
}
