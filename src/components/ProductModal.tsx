'use client'

import { useState, useEffect } from 'react'
import { X, Check, Plus, Minus } from 'lucide-react'
import { Product } from '@/store/cart'

interface ProductModalProps {
    product: Product
    isOpen: boolean
    onClose: () => void
    onAddToCart: (finalPrice: number, selectedModifiers: any[]) => void
}

interface Modifier {
    name: string
    type: 'base' | 'extra' | 'special'
    price_usd?: number
}

export default function ProductModal({ product, isOpen, onClose, onAddToCart }: ProductModalProps) {
    const [modifiers, setModifiers] = useState<Modifier[]>([])
    const [selectedActions, setSelectedActions] = useState<Set<string>>(new Set())

    // Inicializar estado cuando abre
    useEffect(() => {
        if (isOpen && product.all_modifiers) {
            // Parse robusto
            let mods: Modifier[] = []
            try {
                mods = typeof product.all_modifiers === 'string'
                    ? JSON.parse(product.all_modifiers)
                    : product.all_modifiers
            } catch (e) {
                console.error('Error parsing modifiers', e)
                mods = []
            }

            setModifiers(mods || [])

            // Pre-seleccionar 'base'
            const initialSet = new Set<string>()
            mods?.forEach(m => {
                if (m.type === 'base') initialSet.add(m.name)
            })
            setSelectedActions(initialSet)
        }
    }, [isOpen, product])

    if (!isOpen) return null

    // Lógica de Toggle
    const toggleModifier = (modName: string) => {
        const next = new Set(selectedActions)
        if (next.has(modName)) {
            next.delete(modName)
        } else {
            next.add(modName)
        }
        setSelectedActions(next)
    }

    // Cálculo de Precio
    const calculateTotal = () => {
        let base = product.price_usd
        let extraTotal = 0
        let multiplier = 1

        modifiers.forEach(mod => {
            if (selectedActions.has(mod.name)) {
                if (mod.type === 'extra') {
                    extraTotal += (mod.price_usd || 0)
                }
                if (mod.type === 'special') {
                    // Regla: Doble = Base * 1.5
                    // Asumimos que si hay varios special se suman multiplicadores? O solo aplica una vez?
                    // User especifico: "precio_total = precio_base * 1.5"
                    // Interpretación: Multiplica el BASE.
                    multiplier = 1.5
                }
            }
        })

        return (base * multiplier) + extraTotal
    }

    const finalPrice = calculateTotal()

    const handleAdd = () => {
        // Construir lista final de modificadores para mostrar en carrito
        // 1. Base Removidos ("Sin Cebolla")
        // 2. Extras Agregados ("Con Tocineta")
        // 3. Specials ("Doble Carne")

        const summary: string[] = []

        modifiers.forEach(mod => {
            const isSelected = selectedActions.has(mod.name)

            if (mod.type === 'base' && !isSelected) {
                summary.push(`Sin ${mod.name}`)
            }
            if (mod.type === 'extra' && isSelected) {
                summary.push(`Extra ${mod.name} (+$${mod.price_usd})`)
            }
            if (mod.type === 'special' && isSelected) {
                summary.push(`${mod.name}`)
            }
        })

        onAddToCart(finalPrice, summary)
        onClose()
    }

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center sm:p-4 animate-in fade-in duration-200" onClick={onClose}>
            <div
                className="bg-slate-900 border-t border-x sm:border border-slate-800 w-full sm:max-w-md rounded-t-4xl sm:rounded-3xl overflow-hidden shadow-2xl flex flex-col h-[85vh] sm:h-auto sm:max-h-[85vh] animate-in slide-in-from-bottom duration-300"
                onClick={e => e.stopPropagation()}
            >
                {/* Drag Handle (Visual Only) */}
                <div className="w-full h-6 bg-slate-900 absolute top-0 left-0 right-0 z-10 flex items-center justify-center sm:hidden" onClick={onClose}>
                    <div className="w-12 h-1.5 bg-slate-700 rounded-full" />
                </div>

                {/* Header Image */}
                <div className="h-48 sm:h-40 bg-slate-800 relative shrink-0 mt-2 sm:mt-0">
                    <img src={product.image_url} alt={product.name} className="w-full h-full object-cover opacity-80" />
                    <div className="absolute inset-0 bg-linear-to-t from-slate-900 via-transparent to-transparent" />
                    <button onClick={onClose} className="absolute top-4 right-4 bg-black/50 p-2 rounded-full text-white hover:bg-black/70 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                    <div className="absolute bottom-4 left-6">
                        <h3 className="text-2xl font-bold text-white shadow-black drop-shadow-md">{product.name}</h3>
                        <p className="text-amber-500 font-bold text-lg drop-shadow-sm">${product.price_usd.toFixed(2)}</p>
                    </div>
                </div>

                {/* Modifiers List */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">

                    {/* Base Ingredients */}
                    {modifiers.some(m => m.type === 'base') && (
                        <div>
                            <h4 className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-3">Ingredientes Base</h4>
                            <div className="grid grid-cols-2 gap-3">
                                {modifiers.filter(m => m.type === 'base').map(mod => {
                                    const isSelected = selectedActions.has(mod.name)
                                    return (
                                        <button
                                            key={mod.name}
                                            onClick={() => toggleModifier(mod.name)}
                                            className={`flex items-center gap-3 p-3 rounded-xl border transition-all text-sm font-medium ${isSelected
                                                ? 'bg-slate-800 border-slate-700 text-white'
                                                : 'bg-red-500/10 border-red-500/30 text-red-400 line-through opacity-70'
                                                }`}
                                        >
                                            <div className={`w-5 h-5 rounded flex items-center justify-center border ${isSelected ? 'bg-green-500 border-green-500 text-slate-900' : 'border-slate-600'}`}>
                                                {isSelected && <Check className="w-3.5 h-3.5" />}
                                            </div>
                                            {mod.name}
                                        </button>
                                    )
                                })}
                            </div>
                        </div>
                    )}

                    {/* Extras */}
                    {modifiers.some(m => m.type === 'extra') && (
                        <div>
                            <h4 className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-3">Extras</h4>
                            <div className="space-y-3">
                                {modifiers.filter(m => m.type === 'extra').map(mod => {
                                    const isSelected = selectedActions.has(mod.name)
                                    return (
                                        <button
                                            key={mod.name}
                                            onClick={() => toggleModifier(mod.name)}
                                            className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${isSelected
                                                ? 'bg-amber-500/10 border-amber-500 text-amber-500'
                                                : 'bg-slate-800/50 border-slate-800 text-slate-400 hover:bg-slate-800'
                                                }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`w-5 h-5 rounded flex items-center justify-center border ${isSelected ? 'bg-amber-500 border-amber-500 text-slate-900' : 'border-slate-600'}`}>
                                                    {isSelected && <Plus className="w-3.5 h-3.5" />}
                                                </div>
                                                <span className="text-sm font-medium text-white">{mod.name}</span>
                                            </div>
                                            <span className="text-xs font-bold">+${mod.price_usd?.toFixed(2)}</span>
                                        </button>
                                    )
                                })}
                            </div>
                        </div>
                    )}

                    {/* Specials */}
                    {modifiers.some(m => m.type === 'special') && (
                        <div>
                            <h4 className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-3">Especiales</h4>
                            <div className="space-y-3">
                                {modifiers.filter(m => m.type === 'special').map(mod => {
                                    const isSelected = selectedActions.has(mod.name)
                                    return (
                                        <button
                                            key={mod.name}
                                            onClick={() => toggleModifier(mod.name)}
                                            className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all ${isSelected
                                                ? 'bg-purple-500/20 border-purple-500 text-white shadow-[0_0_20px_rgba(168,85,247,0.3)]'
                                                : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500'
                                                }`}
                                        >
                                            <span className="font-bold text-lg">{mod.name}</span>
                                            <span className="text-xs font-bold bg-purple-500 text-white px-2 py-1 rounded">x1.5 Precio</span>
                                        </button>
                                    )
                                })}
                            </div>
                        </div>
                    )}

                </div>

                {/* Footer Action */}
                <div className="p-6 bg-slate-950 border-t border-slate-800">
                    <button
                        onClick={handleAdd}
                        className="w-full bg-linear-to-r from-amber-600 to-orange-600 hover:to-orange-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-orange-900/20 active:scale-[0.98] transition-all flex items-center justify-between px-6"
                    >
                        <span>Agregar al Carrito</span>
                        <span className="text-xl">${finalPrice.toFixed(2)}</span>
                    </button>
                </div>

            </div>
        </div>
    )
}
