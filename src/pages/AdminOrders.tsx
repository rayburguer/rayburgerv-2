import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, DollarSign, ArrowLeft, AlertCircle } from 'lucide-react';
import { supabase } from '../api/supabase';
import type { Order } from '../types';

export function AdminOrders() {
    const navigate = useNavigate();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('orders')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching orders:', error);
        } else {
            setOrders(data || []);
        }
        setLoading(false);
    };

    const sendPaymentInfo = (order: Order) => {
        const message = `🍔 *RAYBURGER - Datos de Pago*

📋 *Orden:* #${order.id.slice(0, 8)}
👤 *Cliente:* ${order.customer_name}
💰 *Total:* $${order.total_amount?.toFixed(2) || '0.00'}

💳 *PAGO MÓVIL*
Banco: Banesco
Teléfono: 0412-1234567
Cédula: V-12345678
Titular: RayBurger C.A.

Por favor, envía tu comprobante de pago.`;

        const whatsappUrl = `https://wa.me/${order.customer_phone.replace('+', '')}?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
    };

    const approveOrder = async (order: Order) => {
        const confirmed = window.confirm(
            `¿Confirmar pedido de ${order.customer_name}?\n\nEsto marcará el pedido como completado y aplicará el cashback correspondiente.`
        );

        if (!confirmed) return;

        try {
            // 1. Update order status
            const { error: orderError } = await supabase
                .from('orders')
                .update({ status: 'completed', paid: true })
                .eq('id', order.id);

            if (orderError) throw orderError;

            // 2. Process loyalty (dynamic cashback + referral) if user exists
            if (order.user_id) {
                const { processLoyalty } = await import('../utils/loyalty');
                const result = await processLoyalty(order.user_id, order.total_amount || 0);

                if (result.error) {
                    console.error('❌ Loyalty error:', result.error);
                    alert(`✅ Pedido aprobado\n\n⚠️ Error al procesar puntos: ${result.error}`);
                } else {
                    const levelName = result.newLevel === 1 ? 'Bronce' : result.newLevel === 2 ? 'Plata' : 'Oro';
                    let message = `✅ Pedido Aprobado Exitosamente\n\n`;
                    message += `💰 Cashback Cliente: $${result.customerCashback.toFixed(2)}\n`;
                    if (result.referrerBonus > 0) {
                        message += `🎁 Bono Referido: $${result.referrerBonus.toFixed(2)}\n`;
                    }
                    message += `⭐ Nivel: ${levelName}`;
                    alert(message);
                }
            } else {
                alert('✅ Pedido aprobado exitosamente\n\n(Cliente invitado - sin puntos)');
            }

            // Refresh orders
            fetchOrders();

        } catch (err: any) {
            console.error('Approval error:', err);
            alert('❌ Error al aprobar pedido: ' + err.message);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-obsidian flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-flame/30 border-t-flame rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-gray-400">Cargando pedidos...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-obsidian text-white p-4 pb-20">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6 sticky top-0 bg-obsidian/90 backdrop-blur-md py-4 z-10 border-b border-white/5">
                <button onClick={() => navigate('/admin')} className="p-2 -ml-2 text-gray-400 hover:text-white">
                    <ArrowLeft size={24} />
                </button>
                <h1 className="text-xl font-bold">Gestión de Pedidos</h1>
            </div>

            <div className="max-w-6xl mx-auto">
                <div className="mb-6">
                    <h2 className="text-2xl font-black text-white mb-2">Comanda Activa</h2>
                    <p className="text-gray-400">Total: {orders.length} pedidos</p>
                </div>

                {orders.length === 0 ? (
                    <div className="text-center py-12">
                        <AlertCircle size={48} className="mx-auto text-gray-600 mb-4" />
                        <p className="text-gray-400">No hay pedidos registrados</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {orders.map((order) => (
                            <div
                                key={order.id}
                                className={`bg-white/5 border rounded-xl p-4 transition-all ${order.status === 'completed'
                                    ? 'border-green-500/20 opacity-60'
                                    : 'border-white/10 hover:border-flame/50'
                                    }`}
                            >
                                {/* Header */}
                                <div className="flex items-start justify-between mb-3">
                                    <div>
                                        <h3 className="font-bold text-white text-lg">{order.customer_name}</h3>
                                        <p className="text-xs text-gray-500 font-mono">#{order.id.slice(0, 8)}</p>
                                    </div>
                                    <span className={`px-2 py-1 rounded text-xs font-bold ${order.status === 'completed'
                                        ? 'bg-green-500/20 text-green-400'
                                        : order.status === 'pending'
                                            ? 'bg-yellow-500/20 text-yellow-400'
                                            : 'bg-blue-500/20 text-blue-400'
                                        }`}>
                                        {order.status}
                                    </span>
                                </div>

                                {/* Items */}
                                <div className="mb-3 space-y-1">
                                    <p className="text-xs font-bold text-gray-400 uppercase">Productos:</p>
                                    <ul className="text-sm text-gray-300 space-y-1">
                                        {order.items?.map((item, idx) => (
                                            <li key={idx} className="flex items-start gap-2">
                                                <span className="text-flame">•</span>
                                                <span>{item.quantity}x {item.name}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Total */}
                                <div className="mb-3 pb-3 border-b border-white/10">
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-400 text-sm">Total:</span>
                                        <span className="text-flame font-bold text-xl">
                                            ${order.total_amount?.toFixed(2) || '0.00'}
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1 capitalize">
                                        {order.delivery_method} {order.delivery_address && `• ${order.delivery_address}`}
                                    </p>
                                </div>

                                {/* Actions */}
                                {order.status !== 'completed' && (
                                    <div className="space-y-2">
                                        <button
                                            onClick={() => sendPaymentInfo(order)}
                                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-all flex items-center justify-center gap-2 text-sm"
                                        >
                                            <DollarSign size={16} />
                                            Enviar Datos Bancarios
                                        </button>
                                        <button
                                            onClick={() => approveOrder(order)}
                                            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition-all flex items-center justify-center gap-2 text-sm"
                                        >
                                            <CheckCircle size={16} />
                                            Aprobar Pedido
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
