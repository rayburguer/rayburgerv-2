import { useState } from 'react';
// Vercel Trigger: Forcing update for Birth Date field
import { useNavigate } from 'react-router-dom';
import { Lock, User, AlertCircle, CheckCircle, Gift, Mail } from 'lucide-react';
import { supabase } from '../api/supabase';
import { PhoneInput, validateVenezuelanPhone } from '../components/PhoneInput';

export function Register() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        birthDate: '',
        password: '',
        confirmPassword: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [phoneError, setPhoneError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setPhoneError(null);

        // Validation
        if (!validateVenezuelanPhone(formData.phone)) {
            setPhoneError('Teléfono inválido. Debe tener 10 dígitos.');
            setLoading(false);
            return;
        }

        if (!formData.birthDate) {
            setError('La fecha de nacimiento es obligatoria');
            setLoading(false);
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setError('Las contraseñas no coinciden');
            setLoading(false);
            return;
        }

        if (formData.password.length < 6) {
            setError('La contraseña debe tener al menos 6 caracteres');
            setLoading(false);
            return;
        }

        try {
            // Trim inputs to remove potential whitespace
            const email = formData.email.trim();
            const password = formData.password.trim();
            const fullName = formData.fullName.trim();
            const phone = formData.phone.trim();
            const birthDate = formData.birthDate;

            console.log('Attempting registration for:', email);

            // Standard Supabase registration
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: email,
                password: password,
                options: {
                    data: {
                        full_name: fullName,
                        phone: phone,
                        birth_date: birthDate,
                    }
                }
            });

            if (authError) throw authError;

            if (!authData.user) {
                throw new Error('No se pudo crear el usuario');
            }

            // Success - redirect to home
            navigate('/');

        } catch (err: any) {
            console.error('Registration error:', err);
            setError(err.message || 'Error al crear la cuenta');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-obsidian flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-sm shadow-2xl">

                <div className="text-center mb-6">
                    <h1 className="text-3xl font-black text-white tracking-tight">
                        RAY<span className="text-flame">BURGER</span>
                    </h1>
                    <p className="text-gray-400 mt-2">Crea tu cuenta</p>
                </div>

                {/* Benefits Banner */}
                <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
                    <div className="flex items-start gap-3">
                        <Gift className="text-green-400 shrink-0 mt-0.5" size={20} />
                        <div className="text-sm">
                            <p className="text-green-400 font-bold">¡Únete al Club!</p>
                            <p className="text-gray-300 text-xs mt-1">Cashback y beneficios exclusivos</p>
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-500 text-sm">
                        <AlertCircle size={18} />
                        <span>{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-300 ml-1">Nombre Completo</label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                            <input
                                type="text"
                                required
                                value={formData.fullName}
                                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-flame focus:ring-1 focus:ring-flame transition-all"
                                placeholder="Juan Pérez"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-300 ml-1">Correo Electrónico</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                            <input
                                type="email"
                                required
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-flame focus:ring-1 focus:ring-flame transition-all"
                                placeholder="tu@email.com"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-300 ml-1">Teléfono WhatsApp</label>
                        <PhoneInput
                            value={formData.phone}
                            onChange={(value) => setFormData({ ...formData, phone: value })}
                            error={phoneError || undefined}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-300 ml-1">Fecha de Nacimiento</label>
                        <div className="relative">
                            <input
                                type="date"
                                required
                                value={formData.birthDate}
                                onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                                className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-flame focus:ring-1 focus:ring-flame transition-all"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-300 ml-1">Contraseña</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                            <input
                                type="password"
                                required
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-flame focus:ring-1 focus:ring-flame transition-all"
                                placeholder="••••••••"
                            />
                        </div>
                        <p className="text-xs text-gray-500 ml-1">Mínimo 6 caracteres</p>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-300 ml-1">Confirmar Contraseña</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                            <input
                                type="password"
                                required
                                value={formData.confirmPassword}
                                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-flame focus:ring-1 focus:ring-flame transition-all"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-flame hover:bg-red-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-flame/20 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>
                                <CheckCircle size={20} />
                                Crear Cuenta
                            </>
                        )}
                    </button>
                </form>

                <div className="mt-6 text-center space-y-2">
                    <p className="text-sm text-gray-400">
                        ¿Ya tienes cuenta?{' '}
                        <button onClick={() => navigate('/login')} className="text-flame hover:underline font-bold">
                            Inicia Sesión
                        </button>
                    </p>
                    <button onClick={() => navigate('/')} className="text-sm text-gray-500 hover:text-white transition-colors">
                        Continuar sin cuenta
                    </button>
                </div>

            </div>
        </div>
    );
}
