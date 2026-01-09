import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, TrendingUp, Users, Copy, Check, Share2, Wallet, Star } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { getLevelName, getCashbackRate } from '../utils/loyalty';

export function UserProfile() {
    const navigate = useNavigate();
    const { profile, user } = useAuthStore();
    const [copied, setCopied] = useState(false);

    const copyReferralCode = () => {
        if (profile?.referral_code) {
            navigator.clipboard.writeText(profile.referral_code);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const shareOnWhatsApp = () => {
        if (profile?.referral_code) {
            const message = `🍔 ¡Únete a RayBurger con mi código de referido!\n\nCódigo: ${profile.referral_code}\n\n✨ Beneficios:\n• Cashback en cada compra\n• Acumula puntos\n• Sube de nivel\n\n¡Regístrate ahora! 👉 [LINK DE TU APP]`;
            const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
            window.open(whatsappUrl, '_blank');
        }
    };

    if (!profile || !user) {
        return (
            <div className="min-h-screen bg-obsidian flex items-center justify-center p-4">
                <div className="text-center">
                    <p className="text-gray-400">Debes iniciar sesión para ver tu perfil</p>
                    <button
                        onClick={() => navigate('/login')}
                        className="mt-4 bg-flame text-white px-6 py-2 rounded-lg"
                    >
                        Iniciar Sesión
                    </button>
                </div>
            </div>
        );
    }

    const level = profile.level || 1;
    const totalSpent = profile.total_spent || 0;
    const walletBalance = profile.wallet_balance || 0;
    const cashbackRate = getCashbackRate(level);
    const levelName = getLevelName(level);

    return (
        <div className="min-h-screen bg-obsidian text-white p-4 pb-20">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6 sticky top-0 bg-obsidian/90 backdrop-blur-md py-4 z-10 border-b border-white/5">
                <button onClick={() => navigate('/')} className="p-2 -ml-2 text-gray-400 hover:text-white">
                    <ArrowLeft size={24} />
                </button>
                <h1 className="text-xl font-bold">Mi Perfil</h1>
            </div>

            <div className="max-w-2xl mx-auto space-y-6">
                {/* User Info */}
                <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h2 className="text-2xl font-black text-white">{profile.full_name || 'Usuario'}</h2>
                            <p className="text-gray-400 text-sm mt-0.5">{profile.phone}</p>
                            {profile.birth_date && (
                                <p className="text-xs text-gray-500 mt-1">🎂 {new Date(profile.birth_date).toLocaleDateString()}</p>
                            )}
                        </div>
                        {profile.is_founder && (
                            <div className="bg-linear-to-r from-yellow-500 to-amber-600 px-3 py-1 rounded-full shadow-lg shadow-yellow-500/20 border border-yellow-400/30 flex items-center gap-1">
                                <Star size={14} className="text-white fill-current" />
                                <span className="text-[10px] font-black text-white uppercase tracking-wider">Socio Fundador</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Wallet Card - PREMIUM DESIGN */}
                <div className="relative overflow-hidden bg-linear-to-br from-green-600 to-green-800 rounded-2xl p-6 shadow-2xl">
                    <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20" />
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full -ml-16 -mb-16" />

                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-4">
                            <Wallet className="text-white" size={28} />
                            <h3 className="text-lg font-bold text-white">Billetera RayBurger</h3>
                        </div>
                        <p className="text-5xl font-black text-white mb-2">${walletBalance.toFixed(2)}</p>
                        <p className="text-sm text-green-100">Disponible para tu próxima compra</p>
                    </div>
                </div>

                {/* Level Card with Progress Bar */}
                <div className="bg-linear-to-br from-flame/20 to-red-600/10 border border-flame/30 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <TrendingUp className="text-flame" size={24} />
                            <div>
                                <h3 className="text-lg font-bold">Nivel {levelName}</h3>
                                <p className="text-sm text-gray-300">Cashback: {cashbackRate}%</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-gray-400">Total Gastado</p>
                            <p className="text-xl font-bold text-flame">${totalSpent.toFixed(2)}</p>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    {level < 3 ? (
                        <div className="mt-6 bg-black/40 rounded-xl p-4 border border-white/5">
                            <div className="flex justify-between items-end mb-2">
                                <div>
                                    <p className="text-sm text-gray-400">Nivel Actual</p>
                                    <p className="text-xl font-black text-white">
                                        {profile.level === 1 ? 'HUNGRY 🍔' :
                                            profile.level === 2 ? 'BURGER LOVER 🍟' :
                                                profile.level === 3 ? 'MASTER 👑' : 'ROOKIE'}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-gray-400">Puntos Totales</p>
                                    <p className="text-flame font-bold">{(profile.total_spent || 0).toFixed(2)} pts</p>
                                </div>
                            </div>

                            {/* Progress Bar */}
                            <div className="w-full bg-gray-700 rounded-full h-4 mb-2 overflow-hidden relative">
                                <div
                                    className="bg-gradient-to-r from-flame to-yellow-500 h-4 rounded-full transition-all duration-1000 ease-out"
                                    style={{ width: `${Math.min(100, ((profile.total_spent || 0) / (profile.level === 1 ? 200 : profile.level === 2 ? 500 : 1000)) * 100)}%` }}
                                ></div>
                            </div>

                            {/* Dopamine Message */}
                            <p className="text-xs text-center mt-2 font-medium">
                                {(profile.total_spent || 0) === 0 ? (
                                    <span className="text-yellow-400 animate-pulse font-bold">¡Estás a solo una Burger de ser Burger Lover! 🍔🚀</span>
                                ) : (
                                    <span className="text-green-400">
                                        ¡Sigue comiendo para desbloquear más Cashback!
                                    </span>
                                )}
                            </p>
                        </div>
                    ) : (
                        <div className="bg-linear-to-r from-yellow-500/20 to-yellow-600/10 border border-yellow-500/30 rounded-lg p-4 text-center">
                            <p className="text-lg font-bold text-yellow-400">🏆 ¡Nivel Máximo Alcanzado!</p>
                            <p className="text-sm text-gray-300 mt-1">Disfrutas del 8% de cashback en todas tus compras</p>
                        </div>
                    )}
                </div>

                {/* Referral Center - ENHANCED */}
                {profile.referral_code && (
                    <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <Users className="text-blue-400" size={24} />
                            <h3 className="text-lg font-bold">Centro de Referidos</h3>
                        </div>

                        <div className="bg-linear-to-br from-blue-600/20 to-blue-800/10 border border-blue-500/30 rounded-xl p-4 mb-4">
                            <p className="text-sm text-blue-300 mb-3">
                                🎁 <strong>Gana 2%</strong> de cada compra de tus amigos referidos
                            </p>
                            <div className="flex items-center gap-3">
                                <div className="flex-1 bg-black/40 border border-white/10 rounded-lg p-4">
                                    <p className="text-xs text-gray-400 mb-1">Tu Código</p>
                                    <p className="text-2xl font-mono font-bold text-center tracking-wider text-white">
                                        {profile.referral_code}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={copyReferralCode}
                                className="bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold py-3 px-4 rounded-lg transition-all flex items-center justify-center gap-2"
                            >
                                {copied ? (
                                    <>
                                        <Check size={18} />
                                        Copiado
                                    </>
                                ) : (
                                    <>
                                        <Copy size={18} />
                                        Copiar
                                    </>
                                )}
                            </button>
                            <button
                                onClick={shareOnWhatsApp}
                                className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition-all flex items-center justify-center gap-2"
                            >
                                <Share2 size={18} />
                                WhatsApp
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
