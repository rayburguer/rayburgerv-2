'use client'

import { useState } from 'react'
import { updateProductPrice, toggleProductStatus } from '@/app/actions/admin-config'
import { deleteProduct } from '@/app/actions/admin-products'
import { Search, Save, Power, PowerOff, Edit2, Loader2, Trash2, Plus } from 'lucide-react'
import ProductFormModal from './ProductFormModal'
import BurgerSpinner from '@/components/BurgerSpinner'

function ProductRow({ product, onDelete, onEdit }: { product: any, onDelete: (id: string, name: string) => void, onEdit: (product: any) => void }) {
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
        const newState = !isActive
        setIsActive(newState)
        const res = await toggleProductStatus(product.id, newState)
        if (!res.success) {
            setIsActive(!newState)
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
                            {loading ? <BurgerSpinner size="sm" /> : <Save className="w-4 h-4" />}
                        </button>
                    )}
                </div>
            </td>

            <td className="p-4 flex items-center justify-end gap-2">
                <button
                    onClick={() => onEdit(product)}
                    className="p-2 rounded-lg bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 transition-colors"
                    title="Editar Detalles"
                >
                    <Edit2 className="w-5 h-5" />
                </button>

                <button
                    onClick={handleToggle}
                    className={`p-2 rounded-lg transition-all ${isActive
                        ? 'bg-green-500/10 text-green-500 hover:bg-green-500/20'
                        : 'bg-red-500/10 text-red-500 hover:bg-red-500/20'
                        }`}
                    title={isActive ? 'Desactivar' : 'Activar'}
                >
                    {isActive ? <Power className="w-5 h-5" /> : <PowerOff className="w-5 h-5" />}
                </button>

                <button
                    onClick={() => onDelete(product.id, product.name)}
                    className="p-2 rounded-lg bg-slate-800 text-slate-500 hover:bg-red-900/20 hover:text-red-500 transition-colors"
                    title="Eliminar (Soft Delete)"
                >
                    <Trash2 className="w-5 h-5" />
                </button>
            </td>
        </tr>
    )
}

export default function ProductManagerPRO({ products, categories }: { products: any[], categories: any[] }) {
    const [search, setSearch] = useState('')
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingProduct, setEditingProduct] = useState<any>(null)

    const filtered = products.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.category?.toLowerCase().includes(search.toLowerCase())
    )

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`¿Estás seguro de ELIMINAR "${name}"? Esta acción lo archivará.`)) return
        const res = await deleteProduct(id)
        if (!res.success) alert(res.error)
    }

    const handleEdit = (product: any) => {
        setEditingProduct(product)
        setIsModalOpen(true)
    }

    const handleCloseModal = () => {
        setIsModalOpen(false)
        setEditingProduct(null)
    }

    return (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg h-full flex flex-col">
            <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-950/30">
                <h3 className="font-bold text-white flex items-center gap-2">
                    <Edit2 className="w-5 h-5 text-amber-500" />
                    Inventario PRO
                </h3>

                <div className="flex gap-2">
                    <div className="relative">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input
                            type="text"
                            placeholder="Buscar..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-4 py-2 text-sm text-white focus:border-amber-500 focus:outline-none w-48"
                        />
                    </div>

                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-amber-500 hover:bg-amber-600 text-slate-900 px-3 py-2 rounded-lg flex items-center gap-2 font-bold text-sm transition-colors"
                    >
                        <Plus className="w-4 h-4" /> Nuevo
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-x-auto overflow-y-auto">
                <table className="w-full text-left border-collapse">
                    <thead className="sticky top-0 bg-slate-950 z-10 shadow-sm">
                        <tr className="text-slate-400 text-xs uppercase tracking-wider">
                            <th className="p-4 font-medium">Producto</th>
                            <th className="p-4 font-medium w-40">Precio</th>
                            <th className="p-4 font-medium text-right w-32">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                        {filtered.map(product => (
                            <ProductRow
                                key={product.id}
                                product={product}
                                onDelete={handleDelete}
                                onEdit={handleEdit}
                            />
                        ))}
                    </tbody>
                </table>
            </div>

            <ProductFormModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                categories={categories}
                productToEdit={editingProduct}
            />
        </div>
    )
}
