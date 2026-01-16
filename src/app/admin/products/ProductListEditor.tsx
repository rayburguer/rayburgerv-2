'use client'

import { useState } from 'react'
import { updateProductPrice, toggleProductStatus } from '@/app/actions/admin-config'
import { Search, Save, Power, PowerOff, Edit2, Loader2 } from 'lucide-react'

// Sub-componente para cada fila para aislar estado
function ProductRow({ product }: { product: any }) {
    const [price, setPrice] = useState(product.price_usd?.toString() || '0')
    const [isActive, setIsActive] = useState(product.is_active)
    const [loading, setLoading] = useState(false)
    const [isDirty, setIsDirty] = useState(false)

    const handlePriceSave = async () => {
        setLoading(true)
        const res = await updateProductPrice(product.id, parseFloat(price))
        if (!res.success) alert(res.error)
        else setIsDirty(false)
        setLoading(false)
    }

    const handleToggle = async () => {
        // Optimistic update
        const newState = !isActive
        setIsActive(newState)

        // Background call
        const res = await toggleProductStatus(product.id, newState)
        if (!res.success) {
            setIsActive(!newState) // Rollback
            alert(res.error)
        }
    }

    return (
        <tr className={`group transition-colors border-b border-slate-800 hover:bg-slate-800/30 ${!isActive ? 'opacity-50 grayscale' : ''}`}>
            <td className="p-4">
                <div className="flex items-center gap-4">
                    <img
                        src={product.image_url || 'https://placehold.co/50'}
                        alt={product.name}
                        className="w-12 h-12 rounded-lg object-cover bg-slate-800"
                    />
                    <div>
                        <p className="text-white font-bold">{product.name}</p>
                        <p className="text-xs text-slate-500">{product.category}</p>
                    </div>
                </div>
            </td>

            <td className="p-4">
                <div className="flex items-center gap-2">
                    <span className="text-slate-500 font-bold">$</span>
                    <input
                        type="number"
                        step="0.01"
                        value={price}
                        onChange={(e) => {
                            setPrice(e.target.value)
                            setIsDirty(true)
                        }}
                        className="bg-slate-950 border border-slate-700 rounded px-2 py-1 w-20 text-right text-white font-mono focus:border-amber-500 focus:outline-none"
                    />
                    {isDirty && (
                        <button
                            onClick={handlePriceSave}
                            disabled={loading}
                            className="bg-green-600 hover:bg-green-500 text-white p-1.5 rounded shadow-lg animate-in zoom-in"
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        </button>
                    )}
                </div>
            </td>

            <td className="p-4 text-center">
                <button
                    onClick={handleToggle}
                    className={`p-2 rounded-lg transition-all ${isActive
                            ? 'bg-green-500/10 text-green-500 hover:bg-green-500/20'
                            : 'bg-red-500/10 text-red-500 hover:bg-red-500/20'
                        }`}
                    title={isActive ? 'Desactivar Producto' : 'Activar Producto'}
                >
                    {isActive ? <Power className="w-5 h-5" /> : <PowerOff className="w-5 h-5" />}
                </button>
            </td>
        </tr>
    )
}

export default function ProductListEditor({ products }: { products: any[] }) {
    const [search, setSearch] = useState('')

    const filtered = products.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.category.toLowerCase().includes(search.toLowerCase())
    )

    return (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
            <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-950/30">
                <h3 className="font-bold text-white flex items-center gap-2">
                    <Edit2 className="w-5 h-5 text-amber-500" />
                    Editor de Productos
                </h3>

                <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                        type="text"
                        placeholder="Buscar producto..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-4 py-2 text-sm text-white focus:border-amber-500 focus:outline-none w-64"
                    />
                </div>
            </div>

            <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
                <table className="w-full text-left border-collapse">
                    <thead className="sticky top-0 bg-slate-950 z-10 shadow-sm">
                        <tr className="text-slate-400 text-xs uppercase tracking-wider">
                            <th className="p-4 font-medium">Producto</th>
                            <th className="p-4 font-medium w-48">Precio USD</th>
                            <th className="p-4 font-medium text-center w-24">Estado</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                        {filtered.map(product => (
                            <ProductRow key={product.id} product={product} />
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="p-2 text-center text-xs text-slate-600 border-t border-slate-800">
                {filtered.length} productos listados
            </div>
        </div>
    )
}
