import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, AlertCircle, LogIn, Mail } from 'lucide-react';
import { supabase } from '../api/supabase';

export function Login() {
    const navigate = useNavigate();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const { error: authError } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (authError) {
                setError(authError.message === 'Invalid login credentials'
                    ? 'Correo o contraseña incorrectos'
                    : 'Error al iniciar sesión');
            } else {
                navigate('/');
            }
        } catch (err: any) {
            setError('Error al iniciar sesión');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-obsidian flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-sm shadow-2xl">

                <div className="text-center mb-8">
                    <h1 className="text-3xl font-black text-white tracking-tight">
                        RAY<span className="text-flame">BURGER</span>
                    </h1>
                    <p className="text-gray-400 mt-2">Acceso a tu cuenta</p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-500 text-sm">
                        <AlertCircle size={18} />
                        <span>{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-300 ml-1">Correo Electrónico</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-flame focus:ring-1 focus:ring-flame transition-all"
                                placeholder="tu@email.com"
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
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-flame focus:ring-1 focus:ring-flame transition-all"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-flame hover:bg-red-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-flame/20 transition-all active:scale-95 flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>
                                <LogIn size={20} />
                                Iniciar Sesión
                            </>
                        )}
                    </button>
                </form>

                <div className="mt-6 text-center space-y-2">
                    <p className="text-sm text-gray-400">
                        ¿No tienes cuenta?{' '}
                        <button onClick={() => navigate('/register')} className="text-flame hover:underline font-bold">
                            Regístrate
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
