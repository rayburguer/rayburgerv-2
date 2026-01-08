
import { useState } from 'react';
import { Plus } from 'lucide-react';
import type { Product } from '../types';
import { useCartStore } from '../store/useCartStore';
import { useSettingsStore } from '../store/useSettingsStore';
import { formatVES } from '../utils/currency';
import { ProductModal } from './ProductModal';

interface ProductCardProps {
    product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
    const addItem = useCartStore((state) => state.addItem);
    const exchangeRate = useSettingsStore((state) => state.exchangeRate);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleClick = () => {
        // Si tiene personalizaciones, abrir modal. Si no, agregar directo.
        if (product.customizations) {
            setIsModalOpen(true);
        } else {
            addItem(product, 1);
            alert('Agregado al carrito');
        }
    };

    return (
        <>
            <div
                onClick={handleClick}
                className="group relative overflow-hidden rounded-2xl bg-obsidian border border-white/10 shadow-lg transition-all hover:border-flame/50 hover:shadow-flame/10 flex flex-col h-full cursor-pointer"
            >
                <div className="h-32 sm:h-40 w-full overflow-hidden bg-gray-900 relative">
                    {product.image_url ? (
                        <img
                            src={product.image_url}
                            alt={product.name}
                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                        />
                    ) : (
                        <div className="flex h-full w-full items-center justify-center text-gray-600">
                            <span className="text-xs">Sin img</span>
                        </div>
                    )}
                </div>

                <div className="p-3 flex flex-col grow justify-between">
                    <div>
                        <h3 className="text-sm font-bold text-white leading-tight mb-1 group-hover:text-flame transition-colors">
                            {product.name}
                        </h3>
                        <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">
                            {product.description || 'Sin descripción'}
                        </p>
                    </div>

                    <div className="mt-3 flex items-center justify-between">
                        <div className="flex flex-col">
                            <span className="text-lg font-black text-flame leading-none">
                                ${Number(product.price).toFixed(2)}
                            </span>
                            <span className="text-xs text-gray-500 font-medium">
                                {formatVES(product.price, exchangeRate)}
                            </span>
                        </div>

                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                handleClick();
                            }}
                            className="flex items-center justify-center gap-1 rounded-full bg-white/10 p-2 text-white transition-all active:scale-95 hover:bg-flame hover:text-white"
                            aria-label="Agregar al carrito"
                        >
                            <Plus size={18} />
                        </button>
                    </div>
                </div>
            </div>

            <ProductModal
                product={product}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
        </>
    );
}
