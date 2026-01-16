'use client'

import { CheckCircle2, Copy, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'

export default function OrderSuccessPage() {
    const params = useParams()
    const orderId = params.id as string

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center shadow-2xl relative overflow-hidden">

                {/* Confetti effect placeholder or just ambience */}
                <div className="absolute top-0 left-0 w-full h-2 bg-linear-to-r from-green-500 via-emerald-500 to-teal-500" />

                <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6 ring-1 ring-green-500/30">
                    <CheckCircle2 className="w-10 h-10 text-green-500" />
                </div>

                <h1 className="text-2xl font-bold text-white mb-2">¡Pedido Recibido!</h1>
                <p className="text-slate-400 mb-8">
                    Tu orden ha sido creada y está pendiente de verificación de pago.
                </p>

                <div className="bg-slate-950 rounded-xl p-4 border border-slate-800 mb-8">
                    <p className="text-xs text-slate-500 uppercase tracking-widest mb-1">ID del Pedido</p>
                    <div className="flex items-center justify-center gap-2">
                        <code className="text-amber-500 font-mono text-lg">{orderId}</code>
                        <button
                            onClick={() => navigator.clipboard.writeText(orderId)}
                            className="text-slate-600 hover:text-white transition-colors"
                            title="Copiar ID"
                        >
                            <Copy className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                <div className="flex flex-col gap-3">
                    <Link
                        href="/menu"
                        className="w-full bg-slate-800 hover:bg-slate-700 text-white font-medium py-3.5 rounded-xl transition-all flex items-center justify-center gap-2"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Volver al Menú
                    </Link>

                    {/* Future: Button to upload payment proof */}
                    {/* <button className="w-full bg-amber-600 hover:bg-amber-500 text-white font-bold py-3.5 rounded-xl">
            Reportar Pago
          </button> */}
                </div>

            </div>
        </div>
    )
}
