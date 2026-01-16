'use client'

import { useState, useMemo } from 'react'
import { ChevronDown, ChevronRight, UtensilsCrossed } from 'lucide-react'
import ProductCard from '@/components/ProductCard'
import { Product } from '@/store/cart'

interface MenuAccordionProps {
    products: any[] // Usamos any o la interfaz correcta si coincide
}

export default function MenuAccordion({ products }: MenuAccordionProps) {
    // Debugging logs
    if (products?.length === 0) {
        console.log('MenuAccordion: No products received')
    } else {
        console.log(`MenuAccordion: Received ${products?.length} products`)
    }

    // Agrupar por categoría
    // Orden deseado: Hamburguesas primero, luego el resto
    const grouped = useMemo(() => {
        if (!products) return {}

        const groups: Record<string, Product[]> = {}
        products.forEach(p => {
            // Normalizar categoría: Trim y Capitalize opcional si se desea
            const rawCat = p.category || 'Otros'
            const cat = rawCat.trim()

            if (!groups[cat]) groups[cat] = []
            groups[cat].push(p)
        })
        return groups
    }, [products])

    // Estado de acordeón
    const [openSections, setOpenSections] = useState<Record<string, boolean>>({
        'Hamburguesas': true, // Default open
        'Burgers': true // Por si el nombre en DB es en inglés
    })

    const toggleSection = (category: string) => {
        setOpenSections(prev => ({
            ...prev,
            [category]: !prev[category]
        }))
    }

    // Obtener categorías ordenadas (Hamburguesas/Burgers primero)
    const sortedCategories = Object.keys(grouped).sort((a, b) => {
        if (a === 'Hamburguesas' || a === 'Burgers') return -1
        if (b === 'Hamburguesas' || b === 'Burgers') return 1
        return a.localeCompare(b)
    })

    if (!products || products.length === 0) {
        return (
            <div className="text-center py-10 text-slate-500">
                <UtensilsCrossed className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p>No hay productos disponibles.</p>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            {sortedCategories.map((category) => {
                const isOpen = openSections[category]
                const items = grouped[category]

                return (
                    <div key={category} className="border border-slate-800 rounded-2xl bg-slate-900/30 overflow-hidden">

                        {/* Header Accordion */}
                        <button
                            onClick={() => toggleSection(category)}
                            className={`w-full flex items-center justify-between p-4 transition-colors ${isOpen ? 'bg-slate-900 text-amber-500' : 'hover:bg-slate-800/50 text-white'
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <span className={`p-2 rounded-lg ${isOpen ? 'bg-amber-500/10' : 'bg-slate-800'}`}>
                                    {isOpen ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                                </span>
                                <h3 className="text-lg font-bold text-left">{category}</h3>
                                <span className="text-xs font-mono text-slate-500 bg-slate-950 px-2 py-1 rounded-full">
                                    {items.length}
                                </span>
                            </div>
                        </button>

                        {/* Content Grid */}
                        {isOpen && (
                            <div className="p-4 border-t border-slate-800 bg-slate-950/20 animate-in slide-in-from-top-2 duration-200">
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                                    {items.map((product) => (
                                        <ProductCard key={product.id} product={product} />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )
            })}
        </div>
    )
}
