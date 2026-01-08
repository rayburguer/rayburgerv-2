import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle, Home, MessageSquare } from 'lucide-react';
import { useCartStore } from '../store/useCartStore';
import { ScratchCard } from '../components/ScratchCard';
import { supabase } from '../api/supabase';
import { useAuthStore } from '../store/useAuthStore';
import type { Order } from '../types';

export function OrderSuccess() {
    const navigate = useNavigate();
    const location = useLocation();
    const { clearCart } = useCartStore();
    const { user } = useAuthStore();
    const [showRewardMsg, setShowRewardMsg] = useState(false);
    const [rewardCode, setRewardCode] = useState<string | null>(null);
    const [showFeedback, setShowFeedback] = useState(false);
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [submittingFeedback, setSubmittingFeedback] = useState(false);
    const [feedbackSent, setFeedbackSent] = useState(false);

    const state = location.state as { order: Order; message: string } | null;

    useEffect(() => {
        // Clear cart on mount to ensure user starts fresh
        clearCart();

        // Redirect if no order state
        if (!state) {
            navigate('/');
        }
    }, [clearCart, navigate, state]);

    // Early return if no data
    if (!state || !state.order) {
        return (
            <div className="min-h-screen bg-obsidian flex items-center justify-center p-4">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-flame/30 border-t-flame rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-gray-400">Cargando detalles del pedido...</p>
                </div>
            </div>
        );
    }

    const { order } = state;

    const submitFeedback = async () => {
        if (rating === 0) return;
        setSubmittingFeedback(true);
        try {
            const { error } = await supabase
                .from('feedback')
                .insert({
                    order_id: order.id,
                    user_id: user?.id,
                    rating,
                    comment
                });
            if (error) throw error;
            setFeedbackSent(true);
            setTimeout(() => setShowFeedback(false), 2000);
        } catch (e) {
            console.error(e);
        } finally {
            setSubmittingFeedback(false);
        }
    };

    return (
        <div className="min-h-screen bg-obsidian flex flex-col items-center py-10 px-4 animate-in fade-in duration-500 overflow-y-auto">

            <div className="bg-white/5 border border-white/10 rounded-2xl p-8 max-w-md w-full text-center space-y-6">

                <div className="flex justify-center">
                    <div className="h-24 w-24 rounded-full bg-green-500/20 flex items-center justify-center text-green-500 animate-in zoom-in duration-500">
                        <CheckCircle size={48} />
                    </div>
                </div>

                <div>
                    <h1 className="text-3xl font-black text-white mb-2">¡Pedido Recibido!</h1>
                    <p className="text-gray-400">Tu orden ha sido registrada correctamente.</p>
                </div>

                {/* GAMIFICATION: ScratchCard */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 border-dashed">
                    <h3 className="text-sm font-bold text-flame uppercase tracking-widest mb-4">🎁 ¡Bonus de Fidelidad!</h3>
                    <p className="text-xs text-gray-400 mb-4">Raspa la tarjeta para descubrir un premio</p>
                    <ScratchCard onReveal={(code) => {
                        setRewardCode(code);
                        setShowRewardMsg(true);
                    }} />

                    {showRewardMsg && (
                        <div className="mt-4 p-3 bg-yellow-500/20 border border-yellow-500/30 rounded-xl animate-in bounce-in">
                            <p className="text-yellow-400 font-bold text-sm">¡Ganaste!</p>
                            <p className="text-white font-mono font-black">{rewardCode}</p>
                            <p className="text-[10px] text-gray-400 mt-1">Usa este código en tu próxima visita</p>
                        </div>
                    )}
                </div>

                <div className="bg-white/5 rounded-xl p-4 border border-white/5 text-left">
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Detalles del Pedido</h3>
                    <div className="space-y-1 text-sm text-gray-300">
                        <p><span className="text-gray-500">Orden ID:</span> <span className="text-white font-mono">#{order?.id?.slice(0, 8) || 'N/A'}</span></p>
                        <p><span className="text-gray-500">Total:</span> <span className="text-white font-bold">${order?.total_amount?.toFixed(2) || '0.00'}</span></p>
                        <p><span className="text-gray-500">Cliente:</span> {order?.customer_name || 'N/A'}</p>
                        <p><span className="text-gray-500">Entrega:</span> <span className="capitalize">{order?.delivery_method || 'N/A'}</span></p>
                    </div>
                </div>

                {/* FEEDBACK BUTTON */}
                {!feedbackSent ? (
                    <button
                        onClick={() => setShowFeedback(true)}
                        className="w-full bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 font-bold py-3 rounded-xl border border-blue-600/30 transition-all flex items-center justify-center gap-2"
                    >
                        <MessageSquare size={18} />
                        Calificar Experiencia
                    </button>
                ) : (
                    <div className="py-3 text-green-400 font-bold flex items-center justify-center gap-2">
                        <CheckCircle size={18} />
                        ¡Gracias por tu opinión!
                    </div>
                )}

                <button
                    onClick={() => navigate('/')}
                    className="w-full bg-white/10 hover:bg-white/20 text-white font-bold py-3.5 rounded-xl border border-white/10 transition-all flex items-center justify-center gap-2"
                >
                    <Home size={20} />
                    Volver al Menú
                </button>

            </div>

            {/* FEEDBACK MODAL */}
            {showFeedback && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-obsidian border border-white/10 rounded-3xl p-8 w-full max-w-sm shadow-2xl animate-in zoom-in duration-300">
                        <h2 className="text-2xl font-black text-white text-center mb-6">¿Qué tal estuvo todo?</h2>

                        <div className="flex justify-between mb-8">
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                                <button
                                    key={num}
                                    onClick={() => setRating(num)}
                                    className={`w-7 h-7 rounded-lg text-xs font-bold transition-all ${rating >= num
                                        ? 'bg-flame text-white scale-110 shadow-lg shadow-flame/30'
                                        : 'bg-white/5 text-gray-500 hover:bg-white/10'
                                        }`}
                                >
                                    {num}
                                </button>
                            ))}
                        </div>

                        <div className="space-y-4">
                            <textarea
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                placeholder="Dinos algo breve (opcional)..."
                                className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white text-sm focus:outline-none focus:border-flame h-24 resize-none"
                            />

                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    onClick={() => setShowFeedback(false)}
                                    className="bg-white/5 hover:bg-white/10 text-gray-400 font-bold py-3 rounded-xl transition-all"
                                >
                                    Omitir
                                </button>
                                <button
                                    onClick={submitFeedback}
                                    disabled={rating === 0 || submittingFeedback}
                                    className="bg-flame hover:bg-red-600 disabled:opacity-50 text-white font-bold py-3 rounded-xl shadow-lg shadow-flame/20 transition-all flex items-center justify-center gap-2"
                                >
                                    {submittingFeedback ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        'Enviar'
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
