import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ClipboardList, Utensils, DollarSign, Trophy, Users, TrendingUp } from 'lucide-react';
import { supabase } from '../api/supabase';

interface Stats {
    totalSales: number;
    totalCashback: number;
    topReferrers: { name: string; count: number }[];
    validOrdersCount: number;
}

export function AdminDashboard() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [pendingCount, setPendingCount] = useState(0);
    const [stats, setStats] = useState<Stats>({
        totalSales: 0,
        totalCashback: 0,
        topReferrers: [],
        validOrdersCount: 0
    });

    useEffect(() => {
        fetchDashboardData();

        // Subscribe to changes in orders for real-time updates
        const subscription = supabase
            .channel('admin_dashboard')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
                fetchDashboardData();
            })
            .subscribe();

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    const fetchDashboardData = async () => {
        setLoading(true);

        // 1. Get Pending Orders Count & Total Sales
        const { data: ordersData, error: ordersError } = await supabase
            .from('orders')
            .select('*');

        if (ordersError) {
            console.error('Error fetching orders:', ordersError);
        } else {
            const pending = ordersData?.filter(o => o.status === 'pending').length || 0;
            const validOrders = ordersData?.filter(o => ['completed', 'delivered'].includes(o.status)) || [];
            const sales = validOrders.reduce((acc, curr) => acc + (curr.total_amount || 0), 0);

            setPendingCount(pending);
            setStats(prev => ({
                ...prev,
                totalSales: sales,
                validOrdersCount: validOrders.length
            }));
        }

        // 2. Get Total Cashback Issued
        // We can sum 'wallet_balance' from all users, BUT that is current balance.
        // "Balance de Cashback Emitido (Suma de los puntos otorgados)" might mean historical.
        // If we don't have a transaction log, current wallet balance + total_spent * rate might be proxy, but 'total_spent' is better metric for volume.
        // Actually, let's sum 'wallet_balance' from profiles as "Outstanding Cashback Liability" OR stick to what user likely wants:
        // "Suma de los puntos otorgados" -> difficult without transaction table.
        // Let's use `wallet_balance` sum as "Puntos Circulantes" or if we want "Total Issued", we might need to guess from `total_spent`?
        // Let's show TOTAL SPENT and CURRENT WALLET BALANCE of all users.

        const { data: profiles, error: profilesError } = await supabase
            .from('profiles')
            .select('*');

        if (!profilesError && profiles) {
            const currentLiability = profiles.reduce((acc, curr) => acc + (curr.wallet_balance || 0), 0);

            // 3. Simple Top Referrers logic
            // We need to count how many times a user's referral_code appears in OTHER users' records?
            // 'referred_by' holds the code. We need to map code -> user.

            const referrersMap: Record<string, number> = {};
            profiles.forEach(p => {
                if (p.referred_by) {
                    referrersMap[p.referred_by] = (referrersMap[p.referred_by] || 0) + 1;
                }
            });

            // Map codes back to names
            const topRefs = Object.entries(referrersMap)
                .map(([code, count]) => {
                    const user = profiles.find(p => p.referral_code === code);
                    return { name: user?.full_name || user?.phone || code, count };
                })
                .sort((a, b) => b.count - a.count)
                .slice(0, 5); // Top 5

            setStats(prev => ({
                ...prev,
                totalCashback: currentLiability,
                topReferrers: topRefs
            }));
        }

        setLoading(false);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-obsidian flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-flame/30 border-t-flame rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-gray-400">Cargando métricas...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-obsidian text-white p-4 pb-20">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8 sticky top-0 bg-obsidian/90 backdrop-blur-md py-4 z-10 border-b border-white/5">
                <button onClick={() => navigate('/')} className="p-2 -ml-2 text-gray-400 hover:text-white">
                    <ArrowLeft size={24} />
                </button>
                <h1 className="text-xl font-bold">Panel de Administración</h1>
            </div>

            <div className="max-w-6xl mx-auto space-y-8">

                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Total Sales */}
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <DollarSign size={80} />
                        </div>
                        <p className="text-gray-400 font-medium mb-1">Ventas Totales</p>
                        <h3 className="text-3xl font-black text-green-400">${stats.totalSales.toFixed(2)}</h3>
                        <p className="text-xs text-gray-500 mt-2">Órdenes aprobadas</p>
                    </div>

                    {/* Average Ticket */}
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <TrendingUp size={80} />
                        </div>
                        <p className="text-gray-400 font-medium mb-1">Ticket Promedio</p>
                        <h3 className="text-3xl font-black text-blue-400">
                            ${stats.validOrdersCount > 0 ? (stats.totalSales / stats.validOrdersCount).toFixed(2) : '0.00'}
                        </h3>
                        <p className="text-xs text-gray-500 mt-2">Por pedido</p>
                    </div>

                    {/* Cashback Liability */}
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <TrendingUp size={80} />
                        </div>
                        <p className="text-gray-400 font-medium mb-1">Cashback Circulante</p>
                        <h3 className="text-3xl font-black text-flame">${stats.totalCashback.toFixed(2)}</h3>
                        <p className="text-xs text-gray-500 mt-2">Saldo en billeteras</p>
                    </div>

                    {/* Pending Orders Action */}
                    <div
                        onClick={() => navigate('/admin/orders')}
                        className="bg-flame/10 border border-flame/30 rounded-2xl p-6 cursor-pointer hover:bg-flame/20 transition-all group"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-flame font-bold mb-1">Pedidos Pendientes</p>
                                <h3 className="text-4xl font-black text-white">{pendingCount}</h3>
                            </div>
                            <div className="bg-flame p-3 rounded-full text-white shadow-lg shadow-flame/30 group-hover:scale-110 transition-transform">
                                <ClipboardList size={24} />
                            </div>
                        </div>
                        <p className="text-xs text-flame/70 mt-2 group-hover:text-flame transition-colors">Gestionar órdenes →</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Shortcuts */}
                    <div className="space-y-4">
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            <Utensils className="text-flame" size={20} />
                            Gestión Rápida
                        </h2>
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                onClick={() => navigate('/admin/menu')}
                                className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-6 text-left transition-all"
                            >
                                <Utensils className="mb-3 text-orange-400" size={28} />
                                <h3 className="font-bold text-lg">Menú Digital</h3>
                                <p className="text-xs text-gray-500 mt-1">Editar productos y precios</p>
                            </button>
                            {/* Ferrari Module */}
                            <button
                                onClick={() => navigate('/admin/marketing')}
                                className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-6 text-left transition-all group"
                            >
                                <Users className="mb-3 text-flame group-hover:scale-110 transition-transform" size={28} />
                                <h3 className="font-bold text-lg text-white">Ferrari Marketing</h3>
                                <p className="text-xs text-gray-500 mt-1">Reactivar Clientes</p>
                            </button>
                        </div>
                    </div>

                    {/* Top Referrers */}
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                        <h2 className="text-xl font-bold flex items-center gap-2 mb-6">
                            <Trophy className="text-yellow-400" size={20} />
                            Top Embajadores
                        </h2>
                        {stats.topReferrers.length === 0 ? (
                            <p className="text-gray-500 text-center py-4">Aún no hay referencias activas.</p>
                        ) : (
                            <div className="space-y-4">
                                {stats.topReferrers.map((ref, index) => (
                                    <div key={index} className="flex items-center justify-between p-3 bg-black/20 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${index === 0 ? 'bg-yellow-500 text-black' :
                                                index === 1 ? 'bg-gray-400 text-black' :
                                                    index === 2 ? 'bg-orange-700 text-white' :
                                                        'bg-white/10 text-gray-400'
                                                }`}>
                                                {index + 1}
                                            </div>
                                            <span className="font-medium text-white">{ref.name}</span>
                                        </div>
                                        <div className="flex items-center gap-1 text-green-400 font-bold bg-green-500/10 px-2 py-1 rounded">
                                            <Users size={14} />
                                            {ref.count}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
