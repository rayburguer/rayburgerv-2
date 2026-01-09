import { X, Trash2, ShoppingBag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '../store/useCartStore';
import { useSettingsStore } from '../store/useSettingsStore';
import { formatVES } from '../utils/currency';

interface CartSidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

export function CartSidebar({ isOpen, onClose }: CartSidebarProps) {
    const navigate = useNavigate();
    const { cartItems, removeItem, getTotal } = useCartStore();
    const exchangeRate = useSettingsStore((state) => state.exchangeRate);
    const total = getTotal();

    return (
        <>
            {/* Backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity"
                    onClick={onClose}
                />
            )}

            {/* Sidebar */}
            <div className={`fixed inset-y-0 right-0 z-50 w-full max-w-sm bg-obsidian border-l border-white/10 shadow-2xl transform transition-transform duration-300 ease-out ${isOpen ? 'translate-x-0' : 'translate-x-full'
                }`}>
                <div className="flex h-full flex-col">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-white/10">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <ShoppingBag className="text-flame" />
                            Tu Pedido
                        </h2>
                        <button
                            onClick={onClose}
                            className="p-2 text-gray-400 hover:text-white transition-colors"
                        >
                            <X size={24} />
                        </button>
                    </div>

                    {/* Cart Items */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {cartItems.length === 0 ? (
                            <div className="flex h-full flex-col items-center justify-center text-center p-8">
                                <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-4">
                                    <ShoppingBag size={40} className="text-gray-600" />
                                </div>
                                <h3 className="text-lg font-bold text-white mb-2">Tu carrito está vacío</h3>
                                <p className="text-gray-400">
                                    ¡Pide una RayBurger y sé feliz! 🍔
                                </p>
                                <button
                                    onClick={onClose}
                                    className="mt-6 px-6 py-2 rounded-full border border-flame text-flame font-bold hover:bg-flame hover:text-white transition-all"
                                >
                                    Ver Menú
                                </button>
                            </div>
                        ) : (
                            cartItems.map((item) => (
                                <div key={item.cartItemId} className="flex gap-3 bg-white/5 rounded-xl p-3 border border-white/5 hover:border-white/10 transition-colors">
                                    {/* Image */}
                                    <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-gray-800">
                                        {item.image_url ? (
                                            <img src={item.image_url} alt={item.name} className="h-full w-full object-cover" />
                                        ) : (
                                            <div className="h-full w-full flex items-center justify-center text-gray-600 text-xs">Sin img</div>
                                        )}
                                    </div>

                                    {/* Details */}
                                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                                        <div>
                                            <div className="flex justify-between items-start">
                                                <h3 className="font-bold text-white text-sm truncate pr-2">{item.name}</h3>
                                                <button
                                                    onClick={() => removeItem(item.cartItemId)}
                                                    className="text-gray-500 hover:text-red-500 transition-colors p-1 -mt-1 -mr-1"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>

                                            <div className="space-y-0.5 mt-1">
                                                {/* Variant */}
                                                {item.selectedVariant && (
                                                    <p className="text-xs font-bold text-white">
                                                        {item.selectedVariant}
                                                    </p>
                                                )}

                                                {/* Extras */}
                                                {item.selectedExtras && Object.entries(item.selectedExtras).length > 0 && (
                                                    <div className="text-xs text-green-400">
                                                        {Object.entries(item.selectedExtras).map(([name, price]) => (
                                                            <div key={name}>+ {name} (${price.toFixed(2)})</div>
                                                        ))}
                                                    </div>
                                                )}

                                                {/* Removals */}
                                                {item.selectedRemovals && item.selectedRemovals.length > 0 && (
                                                    <div className="text-xs text-red-400">
                                                        {item.selectedRemovals.map(removal => (
                                                            <div key={removal}>- {removal}</div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between mt-2">
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs text-gray-400 bg-white/10 px-2 py-0.5 rounded">x{item.quantity}</span>
                                            </div>
                                            <div className="text-right">
                                                <div className="font-bold text-white text-sm">${(
                                                    (Number(item.price) +
                                                        (item.selectedVariant && item.customizations?.variants?.find(v => v.name === item.selectedVariant)?.price || 0) +
                                                        Object.values(item.selectedExtras || {}).reduce((a, b) => a + b, 0)) * item.quantity
                                                ).toFixed(2)}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Footer */}
                    {cartItems.length > 0 && (
                        <div className="p-4 bg-obsidian border-t border-white/10 space-y-3">
                            <div className="space-y-2">
                                <div className="flex justify-between text-gray-400 text-sm">
                                    <span>Subtotal</span>
                                    <span>${total.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between items-end">
                                    <span className="text-white font-bold text-lg">Total</span>
                                    <div className="text-right">
                                        <div className="text-2xl font-black text-flame leading-none">${total.toFixed(2)}</div>
                                        <div className="text-sm text-gray-500">{formatVES(total, exchangeRate)}</div>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={() => {
                                    onClose();
                                    navigate('/checkout');
                                }}
                                className="w-full bg-flame hover:bg-red-600 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-flame/20 transition-all active:scale-95 flex items-center justify-center gap-2"
                            >
                                Procesar Pedido
                            </button>

                            <button
                                onClick={() => {
                                    const message = cartItems.map(item => {
                                        let text = `*${item.quantity}x ${item.name}*`;
                                        if (item.selectedVariant) text += ` (${item.selectedVariant})`;
                                        if (item.selectedExtras && Object.keys(item.selectedExtras).length > 0) {
                                            text += `\n   + Extras: ${Object.keys(item.selectedExtras).join(', ')}`;
                                        }
                                        if (item.selectedRemovals && item.selectedRemovals.length > 0) {
                                            text += `\n   - Sin: ${item.selectedRemovals.join(', ')}`;
                                        }
                                        return text;
                                    }).join('\n\n');

                                    const fullMessage = `Hola RayBurger, quiero pedir:\n\n${message}\n\n*Total: $${total.toFixed(2)}*\n\n---\n\n*Enviado desde mi Billetera RayBurger 🍔📱*\n*DATOS DE PAGO:*\nBanco: Mercantil / Venezuela\nPago Móvil: 0412-834-4594\nC.I: 13.412.781`;
                                    window.open(`https://wa.me/584128344594?text=${encodeURIComponent(fullMessage)}`, '_blank');
                                }}
                                className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold py-3.5 rounded-xl shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2"
                            >
                                <span>Pedir por WhatsApp</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
