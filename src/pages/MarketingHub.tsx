import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../api/supabase';
import { ArrowLeft, Users, MessageCircle, AlertTriangle } from 'lucide-react';

interface InactiveCustomer {
    id: string;
    full_name: string;
    phone: string;
    last_order_date: string;
    days_inactive: number;
}

export function MarketingHub() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [inactiveCustomers, setInactiveCustomers] = useState<InactiveCustomer[]>([]);

    useEffect(() => {
        analyzeCustomerActivity();
    }, []);

    const analyzeCustomerActivity = async () => {
        setLoading(true);

        try {
            // Fetch all orders
            const { data: orders, error: ordersError } = await supabase
                .from('orders')
                .select('*')
                .order('created_at', { ascending: false });

            if (ordersError) throw ordersError;

            // Group orders by customer
            const customerLastOrder: Record<string, string> = {}; // userId/phone -> lastDate
            const customerInfo: Record<string, { name: string, phone: string, items: any[] }> = {};

            orders?.forEach(order => {
                const customerKey = order.customer_phone; // Primary identifier
                if (!customerLastOrder[customerKey] || new Date(order.created_at) > new Date(customerLastOrder[customerKey])) {
                    customerLastOrder[customerKey] = order.created_at;
                }

                if (!customerInfo[customerKey]) {
                    customerInfo[customerKey] = {
                        name: order.customer_name,
                        phone: order.customer_phone,
                        items: []
                    };
                }
            });

            // Identify inactive
            const today = new Date();
            const inactive: InactiveCustomer[] = [];

            Object.entries(customerLastOrder).forEach(([phone, lastDateStr]) => {
                const lastDate = new Date(lastDateStr);
                const diffTime = Math.abs(today.getTime() - lastDate.getTime());
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                if (diffDays > 15) {
                    inactive.push({
                        id: phone,
                        full_name: customerInfo[phone].name,
                        phone: phone,
                        last_order_date: lastDateStr,
                        days_inactive: diffDays
                    });
                }
            });

            setInactiveCustomers(inactive.sort((a, b) => b.days_inactive - a.days_inactive));

        } catch (error) {
            console.error('Error analyzing marketing data:', error);
        } finally {
            setLoading(false);
        }
    };

    const sendRecoveryMessage = (customer: InactiveCustomer) => {
        const message = `👋 ¡Hola ${customer.full_name}! Hace ${customer.days_inactive} días que no disfrutas una RayBurger. 🍔\n\nTenemos una oferta especial para que vuelvas: *DOBLE PUNTOS* en tu próximo pedido. ¡Te esperamos!`;
        window.open(`https://wa.me/${customer.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`, '_blank');
    };

    return (
        <div className="min-h-screen bg-obsidian text-white p-4 pb-20">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8 sticky top-0 bg-obsidian/90 backdrop-blur-md py-4 z-10 border-b border-white/5">
                <button onClick={() => navigate('/admin')} className="p-2 -ml-2 text-gray-400 hover:text-white">
                    <ArrowLeft size={24} />
                </button>
                <h1 className="text-xl font-bold flex items-center gap-2">
                    <span className="text-flame">Ferrari</span> Marketing Hub
                </h1>
            </div>

            <div className="max-w-4xl mx-auto">
                <section className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-2xl font-black text-white flex items-center gap-2">
                            <AlertTriangle className="text-yellow-400" />
                            Clientes Dormidos ({inactiveCustomers.length})
                        </h2>
                        <span className="text-xs text-gray-500 bg-white/5 py-1 px-3 rounded-full">
                            Inactivos hace +15 días
                        </span>
                    </div>

                    {loading ? (
                        <div className="text-center py-12">
                            <div className="w-12 h-12 border-4 border-flame/30 border-t-flame rounded-full animate-spin mx-auto mb-4" />
                            <p className="text-gray-400">Analizando base de datos...</p>
                        </div>
                    ) : inactiveCustomers.length === 0 ? (
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center">
                            <Users size={48} className="mx-auto text-green-500 mb-4" />
                            <h3 className="text-xl font-bold text-white mb-2">¡Todos están activos!</h3>
                            <p className="text-gray-400">No hay clientes con más de 20 días de inactividad.</p>
                        </div>
                    ) : (
                        <div className="grid gap-4">
                            {inactiveCustomers.map((customer) => (
                                <div key={customer.id} className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 hover:border-flame/30 transition-all">
                                    <div className="flex items-center gap-4 w-full md:w-auto">
                                        <div className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center font-bold text-lg text-gray-400">
                                            {customer.full_name?.[0]?.toUpperCase() || '?'}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-white">{customer.full_name}</h3>
                                            <div className="flex items-center gap-2 text-sm text-gray-400">
                                                <span>Último pedido: {new Date(customer.last_order_date).toLocaleDateString()}</span>
                                                <span className="bg-red-500/20 text-red-400 px-2 rounded-full text-xs font-bold">
                                                    {customer.days_inactive} días
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => sendRecoveryMessage(customer)}
                                        className="w-full md:w-auto bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold py-2 px-6 rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg shadow-green-900/20"
                                    >
                                        <MessageCircle size={20} />
                                        Reactivar
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                {/* Future Marketing Modules Placeholder */}
                <section className="opacity-50 pointer-events-none grayscale">
                    <h2 className="text-xl font-bold text-gray-400 mb-4">Próximamente: Motor de Promociones</h2>
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 border-dashed">
                        <p className="text-center text-gray-500">Configuración de Multiplicadores x2 y Cupones</p>
                    </div>
                </section>
            </div>
        </div>
    );
}
