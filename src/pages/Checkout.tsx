import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Truck, Store } from 'lucide-react';
import { useCartStore } from '../store/useCartStore';
import { useSettingsStore } from '../store/useSettingsStore';
import { useAuthStore } from '../store/useAuthStore';
import { formatVES } from '../utils/currency';
import { generateWhatsAppMessage } from '../utils/whatsapp';
import { supabase } from '../api/supabase';
import { PhoneInput } from '../components/PhoneInput';

export function Checkout() {
    const navigate = useNavigate();
    const { cartItems, getTotal } = useCartStore();
    const exchangeRate = useSettingsStore((state) => state.exchangeRate);

    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        deliveryMethod: 'pickup', // pickup | delivery
        address: ''
    });

    const totalUSD = getTotal();
    const totalVES = totalUSD * exchangeRate;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (cartItems.length === 0) return;
        setLoading(true);

        try {
            // 1. Save Order to Supabase
            const { data: order, error } = await supabase
                .from('orders')
                .insert({
                    user_id: useAuthStore.getState().user?.id, // Link to user if logged in
                    customer_name: formData.name,
                    customer_phone: formData.phone,
                    delivery_method: formData.deliveryMethod,
                    delivery_address: formData.deliveryMethod === 'delivery' ? formData.address : null,
                    total_amount: totalUSD,
                    status: 'pending',
                    items: cartItems.map(item => ({
                        product_id: item.id,
                        name: item.name,
                        quantity: item.quantity,
                        unit_price: item.price,
                        variant: item.selectedVariant,
                        extras: item.selectedExtras
                    }))
                })
                .select()
                .single();

            if (error) throw error;

            // 2. Generate WhatsApp Message
            const message = generateWhatsAppMessage(
                cartItems,
                totalUSD,
                totalVES,
                formData.name,
                formData.deliveryMethod === 'pickup' ? 'Pick-up (Retiro en tienda)' : 'Delivery',
                formData.address
            );

            // 3. Simulate success (Do NOT open WhatsApp yet)
            // clearCart() will be called in OrderSuccess
            navigate('/order-success', { state: { order, message } });

        } catch (err) {
            console.error('Error processing order:', err);
            alert('Hubo un error al procesar tu pedido. Por favor intenta de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    if (cartItems.length === 0) {
        return (
            <div className="min-h-screen bg-obsidian flex items-center justify-center p-4">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-white mb-4">No hay pedido que procesar</h2>
                    <button onClick={() => navigate('/')} className="text-flame underline">Volver al Menú</button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-obsidian text-white p-4 pb-20">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6 sticky top-0 bg-obsidian/90 backdrop-blur-md py-4 z-10 border-b border-white/5">
                <button onClick={() => navigate('/')} className="p-2 -ml-2 text-gray-400 hover:text-white">
                    <ArrowLeft size={24} />
                </button>
                <h1 className="text-xl font-bold">Finalizar Pedido</h1>
            </div>

            <div className="max-w-md mx-auto space-y-6">
                {/* Order Summary */}
                <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                    <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Resumen</h2>
                    <div className="space-y-3">
                        {cartItems.map((item) => (
                            <div key={item.cartItemId} className="flex justify-between text-sm">
                                <span className="text-gray-300">
                                    {item.quantity}x {item.name}
                                    {item.selectedVariant && <span className="text-xs text-gray-500"> ({item.selectedVariant})</span>}
                                </span>
                                <span className="font-mono text-white">
                                    ${((Number(item.price) +
                                        (item.selectedVariant && item.customizations?.variants?.find(v => v.name === item.selectedVariant)?.price || 0) +
                                        Object.values(item.selectedExtras || {}).reduce((a, b) => a + b, 0)) * item.quantity).toFixed(2)}
                                </span>
                            </div>
                        ))}
                        <div className="pt-3 border-t border-white/10 flex justify-between items-end">
                            <span className="font-bold text-white">Total a Pagar</span>
                            <div className="text-right">
                                <div className="text-xl font-black text-flame">${totalUSD.toFixed(2)}</div>
                                <div className="text-xs text-gray-400">{formatVES(totalUSD, exchangeRate)}</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Checkout Form */}
                <form onSubmit={handleSubmit} className="space-y-6">

                    {/* Delivery Method */}
                    <div className="grid grid-cols-2 gap-3">
                        <label className={`flex flex-col items-center justify-center p-4 rounded-xl border cursor-pointer transition-all ${formData.deliveryMethod === 'pickup'
                            ? 'border-flame bg-flame/10 text-white'
                            : 'border-white/10 bg-white/5 text-gray-400'
                            }`}>
                            <input
                                type="radio"
                                name="deliveryMethod"
                                value="pickup"
                                checked={formData.deliveryMethod === 'pickup'}
                                onChange={(e) => setFormData({ ...formData, deliveryMethod: e.target.value })}
                                className="hidden"
                            />
                            <Store size={24} className="mb-2" />
                            <span className="font-bold text-sm">Pick-up</span>
                        </label>

                        <label className={`flex flex-col items-center justify-center p-4 rounded-xl border cursor-pointer transition-all ${formData.deliveryMethod === 'delivery'
                            ? 'border-flame bg-flame/10 text-white'
                            : 'border-white/10 bg-white/5 text-gray-400'
                            }`}>
                            <input
                                type="radio"
                                name="deliveryMethod"
                                value="delivery"
                                checked={formData.deliveryMethod === 'delivery'}
                                onChange={(e) => setFormData({ ...formData, deliveryMethod: e.target.value })}
                                className="hidden"
                            />
                            <Truck size={24} className="mb-2" />
                            <span className="font-bold text-sm">Delivery</span>
                        </label>
                    </div>

                    {/* Personal Info */}
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Tu Nombre</label>
                            <input
                                type="text"
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-flame transition-colors"
                                placeholder="Ej: Juan Pérez"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Teléfono WhatsApp</label>
                            <PhoneInput
                                value={formData.phone}
                                onChange={(value) => setFormData({ ...formData, phone: value })}
                                required
                            />
                        </div>

                        {formData.deliveryMethod === 'delivery' && (
                            <div className="animate-in fade-in slide-in-from-top-2">
                                <label className="block text-sm font-medium text-gray-400 mb-1">Dirección de Entrega</label>
                                <textarea
                                    required
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-flame transition-colors h-24 resize-none"
                                    placeholder="Ej: Av. Principal, Edificio Azul, Apto 4B..."
                                />
                                <div className="mt-2 flex items-center gap-2 text-xs text-flame">
                                    <MapPin size={14} />
                                    <span>Se enviará tu ubicación al repartidor</span>
                                </div>
                            </div>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-flame hover:bg-red-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-flame/20 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {loading ? 'Procesando...' : 'Enviar Pedido por WhatsApp'}
                    </button>
                </form>
            </div>
        </div>
    );
}
