'use client'

import { useState } from 'react'
import { createCategory, deleteCategory } from '@/app/actions/admin-products'
import { Plus, Trash2, Tag, Loader2 } from 'lucide-react'

export default function CategoryManager({ categories }: { categories: any[] }) {
    const [name, setName] = useState('')
    const [loading, setLoading] = useState(false)

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!name) return

        const slug = name.toLowerCase().replace(/\s+/g, '-')
        setLoading(true)
        const res = await createCategory(name, slug)
        if (!res.success) alert('Error: ' + res.error)
        else setName('')
        setLoading(false)
    }

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`¿Borrar categoría "${name}"? Esto podría afectar productos asociados.`)) return

        // Optimistic UI could be handled here, but revalidatePath does the job
        const res = await deleteCategory(id)
        if (!res.success) alert('Error: ' + res.error)
    }

    return (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg flex flex-col h-full">
            <div className="p-4 border-b border-slate-800 bg-slate-950/30">
                <h3 className="font-bold text-white flex items-center gap-2">
                    <Tag className="w-5 h-5 text-amber-500" />
                    Categorías
                </h3>
            </div>

            <div className="p-4 border-b border-slate-800">
                <form onSubmit={handleAdd} className="flex gap-2">
                    <input
                        type="text"
                        placeholder="Nueva Categoría..."
                        value={name}
                        onChange={e => setName(e.target.value)}
                        className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-amber-500 focus:outline-none"
                    />
                    <button
                        disabled={loading || !name}
                        type="submit"
                        className="bg-amber-500 hover:bg-amber-600 text-slate-900 p-2 rounded-lg disabled:opacity-50 transition-colors"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
                    </button>
                </form>
            </div>

            <div className="flex-1 overflow-y-auto p-2">
                <ul className="space-y-1">
                    {categories.map(cat => (
                        <li key={cat.id} className="group flex justify-between items-center p-2 rounded-lg hover:bg-slate-800 transition-colors">
                            <span className="text-sm text-slate-300 font-medium">{cat.name}</span>
                            <button
                                onClick={() => handleDelete(cat.id, cat.name)}
                                className="text-slate-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all p-1"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </li>
                    ))}
                    {categories.length === 0 && (
                        <li className="text-center text-slate-500 text-xs py-4">Sin categorías</li>
                    )}
                </ul>
            </div>
        </div>
    )
}
