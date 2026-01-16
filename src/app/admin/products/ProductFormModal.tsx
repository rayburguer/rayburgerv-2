'use client'

import { useState, useEffect } from 'react'
import { createProduct, updateProduct } from '@/app/actions/admin-products'
import { X, Loader2, Image as ImageIcon } from 'lucide-react'

interface ProductFormModalProps {
    isOpen: boolean
    onClose: () => void
    categories: any[]
    productToEdit?: any | null
}

export default function ProductFormModal({ isOpen, onClose, categories, productToEdit }: ProductFormModalProps) {
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        category: '',
        category_id: '',
        price_usd: '',
        image_url: ''
    })

    useEffect(() => {
        if (isOpen) {
            if (productToEdit) {
                setFormData({
                    name: productToEdit.name || '',
                    description: productToEdit.description || '',
                    category: productToEdit.category || '',
                    category_id: productToEdit.category_id || '',
                    price_usd: productToEdit.price_usd?.toString() || '',
                    image_url: productToEdit.image_url || ''
                })
            } else {
                setFormData({ name: '', description: '', category: '', category_id: '', price_usd: '', image_url: '' })
            }
        }
    }, [isOpen, productToEdit])

    if (!isOpen) return null

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        const cat = categories.find(c => c.id === formData.category_id)

        const payload = {
            name: formData.name,
            description: formData.description,
            price_usd: parseFloat(formData.price_usd),
            image_url: formData.image_url,
            category_id: formData.category_id,
            category: cat ? cat.name : 'Uncategorized',
            is_active: true
        }

        let res
        if (productToEdit) {
            res = await updateProduct(productToEdit.id, payload)
        } else {
            res = await createProduct(payload)
        }

        if (res.success) {
            onClose()
        } else {
            alert('Error: ' + res.error)
        }
        setLoading(false)
    }

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-950">
                    <h3 className="text-white font-bold">{productToEdit ? 'Editar Producto' : 'Nuevo Producto'}</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-xs text-slate-400 mb-1">Nombre del Producto</label>
                        <input
                            required
                            className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white focus:border-amber-500 outline-none"
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-xs text-slate-400 mb-1">Descripción</label>
                        <textarea
                            required
                            rows={3}
                            className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white focus:border-amber-500 outline-none resize-none"
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs text-slate-400 mb-1">Precio USD</label>
                            <input
                                required
                                type="number"
                                step="0.01"
                                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white focus:border-amber-500 outline-none"
                                value={formData.price_usd}
                                onChange={e => setFormData({ ...formData, price_usd: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-xs text-slate-400 mb-1">Categoría</label>
                            <select
                                required
                                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white focus:border-amber-500 outline-none"
                                value={formData.category_id}
                                onChange={e => setFormData({ ...formData, category_id: e.target.value })}
                            >
                                <option value="">Seleccionar...</option>
                                {categories.map(c => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="text-xs text-slate-400 mb-1 flex items-center gap-2">
                            URL Imagen <ImageIcon className="w-3 h-3" />
                        </label>
                        <input
                            required
                            placeholder="https://..."
                            className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white focus:border-amber-500 outline-none text-sm"
                            value={formData.image_url}
                            onChange={e => setFormData({ ...formData, image_url: e.target.value })}
                        />
                    </div>

                    <div className="pt-4 flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-2 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700 font-medium"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 py-2 bg-amber-500 text-slate-900 rounded-lg hover:bg-amber-400 font-bold disabled:opacity-50 flex justify-center items-center gap-2"
                        >
                            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                            {productToEdit ? 'Guardar Cambios' : 'Crear Producto'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
