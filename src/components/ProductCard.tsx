import { useState } from 'react'
import { Plus } from 'lucide-react'
import { useCartStore, type Product } from '@/store/cart'
import ProductModal from './ProductModal'
import VisualBadge from '@/components/VisualBadge'

export default function ProductCard({ product }: { product: Product }) {
    const addItem = useCartStore((state) => state.addItem)
    const [isModalOpen, setIsModalOpen] = useState(false)

    const handleAddToCart = () => {
        setIsModalOpen(true)
    }

    // Lógica Simulada de Badges (Visual Only)
    const getBadge = (p: Product) => {
        const lower = p.name.toLowerCase()
        if (lower.includes('victoria') || lower.includes('il capo')) return 'POPULAR'
        if (lower.includes('bacon')) return 'HOT'
        if (lower.includes('doble') || lower.includes('double')) return '10X'
        // Si es muy reciente (simulado)
        if (p.created_at && new Date(p.created_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)) return 'NEW'
        return null
    }

    const badge = getBadge(product)

    return (
        <div className="bg-slate-900 border-2 border-slate-950 rounded-3xl relative pop-shadow group flex flex-col h-full transform transition-all hover:scale-[1.02] overflow-visible">
            {badge && <VisualBadge type={badge as any} />}

            {/* Imagen */}
            <div className="relative h-48 w-full overflow-hidden rounded-t-[1.3rem] border-b-2 border-slate-950">
                <img
                    src={product.image_url || 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd'}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute top-2 right-2 bg-slate-950/90 text-amber-500 px-2 py-1 rounded-lg text-[10px] font-black uppercase border border-slate-800 tracking-wider">
                    {product.category}
                </div>
            </div>

            {/* Info */}
            <div className="p-5 flex flex-col grow bg-slate-900 rounded-b-3xl">
                <div className="grow">
                    <h3 className="text-xl font-black text-white mb-1 group-hover:text-amber-500 transition-colors leading-tight">
                        {product.name}
                    </h3>
                    <p className="text-slate-400 text-xs font-medium line-clamp-2 mb-4 leading-relaxed">
                        {product.description}
                    </p>
                </div>

                {/* Precio y Botón Chunky */}
                <div className="flex items-end justify-between mt-2 pt-2">
                    <div className="flex flex-col">
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Precio</span>
                        <span className="text-2xl font-black text-white text-stroke-sm shadow-black drop-shadow-sm">
                            ${Number(product.price_usd).toFixed(2)}
                        </span>
                    </div>

                    <button
                        onClick={handleAddToCart}
                        className="w-12 h-12 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-900 flex items-center justify-center border-2 border-slate-950 pop-shadow-strong active:translate-y-1 active:shadow-none transition-all cursor-pointer"
                    >
                        <Plus className="w-6 h-6 stroke-[3px]" />
                    </button>
                </div>
            </div>

            <ProductModal
                product={product}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onAddToCart={(finalPrice, summary) => {
                    if (typeof navigator !== 'undefined' && navigator.vibrate) {
                        navigator.vibrate(50) // Haptic Feedback
                    }
                    addItem(product, {
                        customization: {
                            modifiers: summary,
                            finalPrice: finalPrice
                        }
                    })
                }}
            />
        </div>
    )
}
