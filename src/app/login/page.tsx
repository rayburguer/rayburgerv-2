'use client'

import { useState, useEffect, Suspense } from 'react'
import { login, signup } from './actions'
import { Store, User, Smartphone, Lock, UserPlus, ArrowRight } from 'lucide-react'
import { useSearchParams } from 'next/navigation'

function LoginForm() {
    const [isRegistering, setIsRegistering] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Referral Logic
    const searchParams = useSearchParams()
    const refCode = searchParams.get('ref')
    const [referrerPhone, setReferrerPhone] = useState(refCode || '')

    useEffect(() => {
        if (refCode) {
            setIsRegistering(true) // Auto-switch to register if referred
            setReferrerPhone(refCode)
        }
    }, [refCode])

    async function handleSubmit(formData: FormData) {
        setLoading(true)
        setError(null)
        const action = isRegistering ? signup : login
        const result = await action(formData)

        if (result?.error) {
            setError(result.error)
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
            {/* Background Ambience */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-amber-600/10 rounded-full blur-[100px]" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-orange-600/10 rounded-full blur-[100px]" />
            </div>

            <div className="w-full max-w-md relative z-10">
                {/* Brand */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-linear-to-tr from-amber-500 to-orange-600 mb-4 shadow-xl shadow-orange-900/40">
                        <Store className="w-10 h-10 text-white" />
                    </div>
                    <h1 className="text-4xl font-bold text-white tracking-tight">RayBurger <span className="text-amber-500">V3</span></h1>
                    <p className="text-slate-400 mt-2 text-sm uppercase tracking-widest font-medium">Calidad que se nota</p>
                </div>

                {/* Card */}
                <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 p-8 rounded-3xl shadow-2xl">
                    <div className="flex gap-4 mb-8 bg-slate-800/50 p-1 rounded-xl">
                        <button
                            onClick={() => setIsRegistering(false)}
                            className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all ${!isRegistering
                                ? 'bg-slate-700 text-white shadow-lg'
                                : 'text-slate-400 hover:text-white'
                                }`}
                        >
                            Iniciar Sesión
                        </button>
                        <button
                            onClick={() => setIsRegistering(true)}
                            className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all ${isRegistering
                                ? 'bg-amber-600 text-white shadow-lg'
                                : 'text-slate-400 hover:text-white'
                                }`}
                        >
                            <span className="flex items-center justify-center gap-2">
                                Registrarse
                            </span>
                        </button>
                    </div>

                    <form action={handleSubmit} className="space-y-4">
                        {error && (
                            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm mb-4">
                                {error}
                            </div>
                        )}

                        {isRegistering && (
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-slate-400 ml-1 uppercase">Nombre Completo</label>
                                <div className="relative">
                                    <User className="w-5 h-5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                                    <input
                                        name="fullName"
                                        type="text"
                                        required
                                        placeholder="Juan Pérez"
                                        className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl py-3.5 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all placeholder:text-slate-600"
                                    />
                                </div>
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-slate-400 ml-1 uppercase">Teléfono</label>
                            <div className="relative">
                                <Smartphone className="w-5 h-5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                                <input
                                    name="phone"
                                    type="tel"
                                    required
                                    placeholder="0414..."
                                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl py-3.5 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all placeholder:text-slate-600"
                                />
                            </div>
                        </div>

                        {/* Referrer Phone (Only for Signup) */}
                        {isRegistering && (
                            <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                                <label className="text-xs font-semibold text-amber-500 ml-1 uppercase flex items-center gap-1">
                                    <UserPlus className="w-3 h-3" />
                                    ¿Quién te recomendó? <span className="text-slate-500 dark:text-slate-600 normal-case">(Opcional)</span>
                                </label>
                                <div className="relative">
                                    <Smartphone className="w-5 h-5 text-amber-600/50 absolute left-3 top-1/2 -translate-y-1/2" />
                                    <input
                                        name="referrerPhone"
                                        type="tel"
                                        value={referrerPhone}
                                        onChange={(e) => setReferrerPhone(e.target.value)}
                                        placeholder="Teléfono de tu amigo"
                                        className="w-full bg-slate-900/50 border border-amber-500/30 rounded-xl py-3.5 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all placeholder:text-slate-600 font-bold text-amber-500"
                                    />
                                    {/* Visual Indicator of Locked Referral */}
                                    {refCode && (
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                            <span className="text-[10px] bg-green-500/20 text-green-500 px-2 py-0.5 rounded-full font-bold">
                                                APLICADO
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-slate-400 ml-1 uppercase">Contraseña</label>
                            <div className="relative">
                                <Lock className="w-5 h-5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                                <input
                                    name="password"
                                    type="password"
                                    required
                                    placeholder="••••••••"
                                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl py-3.5 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all placeholder:text-slate-600"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-linear-to-r from-amber-500 to-orange-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-orange-900/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-6"
                        >
                            {loading ? (
                                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    {isRegistering ? 'Crear Cuenta' : 'Entrar'}
                                    <ArrowRight className="w-5 h-5" />
                                </>
                            )}
                        </button>
                    </form>
                </div>

                <p className="text-center text-slate-500 text-xs mt-8">
                    © 2024 RayBurger App. Todos los derechos reservados.
                </p>
            </div>
        </div>
    )
}

export default function LoginPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-slate-950" />}>
            <LoginForm />
        </Suspense>
    )
}
