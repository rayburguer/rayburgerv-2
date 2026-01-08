import { useState, useEffect } from 'react';
import { X, Plus, Minus, ChefHat } from 'lucide-react';
import type { Product } from '../types';
import { useCartStore } from '../store/useCartStore';
import { useSettingsStore } from '../store/useSettingsStore';
import { formatVES } from '../utils/currency';
import { supabase } from '../api/supabase';

interface ProductModalProps {
    product: Product;
    isOpen: boolean;
    onClose: () => void;
}

const COMMON_REMOVALS = [
    'Sin Cebolla',
    'Sin Tomate',
    'Sin Lechuga',
    'Sin Salsas',
    'Sin Pepinillos'
];

export function ProductModal({ product, isOpen, onClose }: ProductModalProps) {
    const addItem = useCartStore((state) => state.addItem);
    const exchangeRate = useSettingsStore((state) => state.exchangeRate);

    const [quantity, setQuantity] = useState(1);
    const [selectedVariant, setSelectedVariant] = useState<string | undefined>();
    const [selectedExtras, setSelectedExtras] = useState<Record<string, number>>({});
    const [selectedRemovals, setSelectedRemovals] = useState<string[]>([]);
    const [availableExtras, setAvailableExtras] = useState<Product[]>([]);
    const [loadingExtras, setLoadingExtras] = useState(false);

    // Initialize with first variant if exists & Fetch Extras
    useEffect(() => {
        if (isOpen) {
            // Reset states
            setQuantity(1);
            setSelectedExtras({});
            setSelectedRemovals([]);

            if (product.customizations?.variants?.length) {
                setSelectedVariant(product.customizations.variants[0].name);
            } else {
                setSelectedVariant(undefined);
            }

            // Fetch dynamic extras from DB
            const fetchExtras = async () => {
                setLoadingExtras(true);
                const { data } = await supabase
                    .from('products')
                    .select('*')
                    .eq('category', 'extras')
                    .eq('is_available', true)
                    .order('price', { ascending: true });

                if (data) {
                    setAvailableExtras(data);
                }
                setLoadingExtras(false);
            };
            fetchExtras();
        }
    }, [isOpen, product]);

    if (!isOpen) return null;

    const handleExtraToggle = (name: string, price: number) => {
        setSelectedExtras((prev) => {
            const next = { ...prev };
            if (next[name]) {
                delete next[name];
            } else {
                next[name] = price;
            }
            return next;
        });
    };

    const handleRemovalToggle = (name: string) => {
        setSelectedRemovals(prev =>
            prev.includes(name)
                ? prev.filter(i => i !== name)
                : [...prev, name]
        );
    };

    const calculateTotal = () => {
        let price = Number(product.price) || 0;

        // Add variant price adjustment if selected
        if (selectedVariant && product.customizations?.variants) {
            const variant = product.customizations.variants.find(v => v.name === selectedVariant);
            if (variant) {
                price += Number(variant.price) || 0;
            }
        }

        // Add extras
        const extrasTotal = Object.values(selectedExtras).reduce((acc, curr) => acc + (Number(curr) || 0), 0);

        return (price + extrasTotal) * quantity;
    };

    const handleAddToCart = () => {
        addItem(product, quantity, selectedExtras, selectedVariant, selectedRemovals);
        onClose();
        // Removed prompt alert to be less intrusive or maybe keep it? The user didn't complain.
        // Prompt said "Confírmame cuando el modal... esté funcionando... para hacer la primera prueba".
        // I will keep a subtle alert or just close.
    };

    const currentTotal = calculateTotal();

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in duration-200">
            <div className="relative w-full max-w-md overflow-hidden rounded-t-2xl sm:rounded-2xl bg-obsidian border border-white/10 shadow-2xl animate-in slide-in-from-bottom duration-300 max-h-[90vh] flex flex-col">

                {/* Header Image */}
                <div className="relative h-48 w-full shrink-0">
                    <img
                        src={product.image_url}
                        alt={product.name}
                        className="h-full w-full object-cover"
                    />
                    <button
                        onClick={onClose}
                        className="absolute right-4 top-4 rounded-full bg-black/50 p-2 text-white backdrop-blur-md transition-colors hover:bg-black/70"
                    >
                        <X size={20} />
                    </button>
                    <div className="absolute inset-0 bg-linear-to-t from-obsidian to-transparent"></div>
                    <div className="absolute bottom-4 left-4 right-4">
                        <h2 className="text-2xl font-black text-white uppercase leading-none">{product.name}</h2>
                        <p className="mt-1 text-sm text-gray-300 line-clamp-2">{product.description}</p>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-6">
                    {/* Variants Section */}
                    {product.customizations?.variants && product.customizations.variants.length > 0 && (
                        <div>
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Tamaño</h3>
                            <div className="space-y-2">
                                {product.customizations.variants.map((variant) => (
                                    <label
                                        key={variant.name}
                                        className={`flex items-center justify-between rounded-lg border p-3 cursor-pointer transition-all ${selectedVariant === variant.name
                                            ? 'border-flame bg-flame/10'
                                            : 'border-white/10 hover:border-white/30'
                                            }`}
                                        onClick={() => setSelectedVariant(variant.name)}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`h-4 w-4 rounded-full border flex items-center justify-center ${selectedVariant === variant.name ? 'border-flame' : 'border-gray-500'
                                                }`}>
                                                {selectedVariant === variant.name && <div className="h-2 w-2 rounded-full bg-flame" />}
                                            </div>
                                            <span className="font-medium text-white">{variant.name}</span>
                                        </div>
                                        <span className="text-sm font-bold text-flame">
                                            {variant.price > 0 ? `+$${variant.price}` : 'Gratis'}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Extras Section (Dynamic) */}
                    <div>
                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">
                            Extras
                            {loadingExtras && <span className="text-xs lowercase ml-2 opacity-50">(cargando...)</span>}
                        </h3>
                        {availableExtras.length === 0 && !loadingExtras ? (
                            <p className="text-xs text-gray-500 italic">No hay extras disponibles por el momento.</p>
                        ) : (
                            <div className="space-y-2">
                                {availableExtras.map((extra) => (
                                    <label
                                        key={extra.id}
                                        className={`flex items-center justify-between rounded-lg border p-3 cursor-pointer transition-all ${selectedExtras[extra.name]
                                            ? 'border-flame bg-flame/10'
                                            : 'border-white/10 hover:border-white/30'
                                            }`}
                                        onClick={() => handleExtraToggle(extra.name, extra.price)}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`h-4 w-4 rounded border flex items-center justify-center ${selectedExtras[extra.name] ? 'border-flame bg-flame' : 'border-gray-500'
                                                }`}>
                                                {selectedExtras[extra.name] && <div className="h-2 w-2 bg-white" />}
                                            </div>
                                            <span className="font-medium text-white">{extra.name}</span>
                                        </div>
                                        <span className="text-sm font-bold text-flame">
                                            +${extra.price.toFixed(2)}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Removals Section (Customization) */}
                    <div>
                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                            <ChefHat size={16} /> Personalizar
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {COMMON_REMOVALS.map((rem) => (
                                <button
                                    key={rem}
                                    onClick={() => handleRemovalToggle(rem)}
                                    className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${selectedRemovals.includes(rem)
                                            ? 'bg-red-500/20 border-red-500 text-red-400'
                                            : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/30'
                                        }`}
                                >
                                    {rem}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Quantity Control */}
                    <div className="flex items-center justify-between bg-white/5 rounded-lg p-3">
                        <span className="font-medium text-white">Cantidad</span>
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                                className="p-1 rounded-full bg-white/10 hover:bg-white/20 text-white"
                                disabled={quantity <= 1}
                            >
                                <Minus size={18} />
                            </button>
                            <span className="text-xl font-bold w-6 text-center">{quantity}</span>
                            <button
                                onClick={() => setQuantity(q => q + 1)}
                                className="p-1 rounded-full bg-white/10 hover:bg-white/20 text-white"
                            >
                                <Plus size={18} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="p-4 border-t border-white/10 bg-obsidian shrink-0">
                    <div className="flex justify-between items-end mb-4">
                        <div className="text-sm text-gray-400">Total</div>
                        <div className="text-right">
                            <div className="text-2xl font-black text-flame">${currentTotal.toFixed(2)}</div>
                            <div className="text-sm text-gray-500">{formatVES(currentTotal, exchangeRate)}</div>
                        </div>
                    </div>
                    <button
                        onClick={handleAddToCart}
                        className="w-full rounded-xl bg-flame py-3.5 text-center font-bold text-white shadow-lg transition-transform active:scale-95 hover:bg-red-600"
                    >
                        Agregar al Pedido
                    </button>
                </div>

            </div>
        </div>
    );
}
