'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { Plus } from 'lucide-react'
import { useCartStore } from '@/store/cart'
import ProductModal from '../ProductModal'
import VisualBadge from '@/components/VisualBadge'

interface Product {
    id: string
    name: string
    description: string
    price_usd: number
    image_url: string
    category: string
    created_at?: string
    [key: string]: any
}

interface ProductFeedProps {
    products: Product[]
}

export default function ProductFeed({ products }: ProductFeedProps) {
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
    const addToCart = useCartStore((state) => state.addItem)

    // Group products by category
    const groupedProducts = products.reduce((acc, product) => {
        if (!acc[product.category]) {
            acc[product.category] = []
        }
        acc[product.category].push(product)
        return acc
    }, {} as Record<string, Product[]>)

    const categories = Object.keys(groupedProducts)

    // Logic for Badges (Restored from ProductCard)
    const getBadge = (p: Product) => {
        const lower = p.name.toLowerCase()
        if (lower.includes('victoria') || lower.includes('il capo')) return 'POPULAR'
        if (lower.includes('bacon')) return 'HOT'
        if (lower.includes('doble') || lower.includes('double')) return '10X'
        if (p.created_at && new Date(p.created_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)) return 'NEW'
        return null
    }

    const triggerHaptic = () => {
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
            navigator.vibrate(50)
        }
    }

    const handleQuickAdd = (e: React.MouseEvent, product: Product) => {
        e.stopPropagation()
        triggerHaptic()
        setSelectedProduct(product)
    }

    const handleModalAddToCart = (finalPrice: number, selectedModifiers: any[]) => {
        if (!selectedProduct) return

        triggerHaptic()
        // Map modifiers to strings for the cart store
        // The cart store expects { modifiers: string[], finalPrice: number }
        // We assume selectedModifiers usually are strings or objects that have names
        // Ideally selectedModifiers should be string[] based on ProductModal implementation
        const modifiersList = selectedModifiers.map(m => String(m))

        addToCart(selectedProduct, {
            customization: {
                modifiers: modifiersList,
                finalPrice: finalPrice
            }
        })
        setSelectedProduct(null)
    }

    return (
        <div className="pb-24">
            {categories.map((category) => (
                <div key={category} id={`category-${category}`} className="mb-12 scroll-mt-36">
                    <h2 className="text-xl font-black text-white mb-6 px-4 flex items-center gap-2 uppercase tracking-tight">
                        <span className="text-amber-500">#</span> {category}
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-6 px-4">
                        {groupedProducts[category].map((product) => {
                            const badge = getBadge(product)
                            return (
                                <div
                                    key={product.id}
                                    onClick={() => setSelectedProduct(product)}
                                    className="group bg-slate-900 rounded-3xl p-4 cursor-pointer hover:bg-slate-800 transition-colors border border-transparent hover:border-slate-700/50 relative"
                                >
                                    {/* Restored Badge */}
                                    {badge && <VisualBadge type={badge as any} />}

                                    {/* Card Image Container */}
                                    <div className="relative aspect-square w-full rounded-2xl overflow-hidden mb-4 bg-slate-950 shadow-xl">
                                        <Image
                                            src={product.image_url || '/placeholder.png'}
                                            alt={product.name}
                                            fill
                                            className="object-cover transition-transform duration-500 group-hover:scale-110"
                                        />

                                        {/* Restored Category Tag */}
                                        <div className="absolute top-2 right-2 bg-slate-950/90 text-amber-500 px-2 py-1 rounded-lg text-[10px] font-black uppercase border border-slate-800 tracking-wider z-10 backdrop-blur-sm">
                                            {product.category}
                                        </div>

                                        {/* Floating Add Button in Bottom Right Configured */}
                                        <button
                                            onClick={(e) => handleQuickAdd(e, product)}
                                            className="absolute bottom-3 right-3 w-10 h-10 bg-white text-slate-900 rounded-full flex items-center justify-center font-bold shadow-lg active:scale-90 hover:bg-amber-400 transition-all z-20"
                                        >
                                            <Plus className="w-6 h-6 stroke-3" />
                                        </button>
                                    </div>

                                    {/* Content */}
                                    <div className="space-y-1">
                                        <div className="flex justify-between items-start">
                                            <h3 className="text-lg font-bold text-white leading-tight pr-2 group-hover:text-amber-500 transition-colors">
                                                {product.name}
                                            </h3>
                                            <span className="text-amber-400 font-black text-lg">
                                                ${Number(product.price_usd).toFixed(2)}
                                            </span>
                                        </div>
                                        <p className="text-slate-500 text-sm line-clamp-2 leading-relaxed">
                                            {product.description}
                                        </p>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            ))}

            {/* Modal for Details/Customization */}
            {selectedProduct && (
                <ProductModal
                    product={selectedProduct}
                    isOpen={!!selectedProduct}
                    onClose={() => setSelectedProduct(null)}
                    onAddToCart={handleModalAddToCart}
                />
            )}
        </div>
    )
}
