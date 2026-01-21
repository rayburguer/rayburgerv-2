'use client'

import React, { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { Gift, CheckCircle, XCircle, AlertCircle, Loader2 } from 'lucide-react'

interface AdminRedeemWidgetProps {
    orderId: string
    reward: {
        id: string
        prize_title: string
        prize_code: string
        prize_icon: string
        status: 'active' | 'redeemed' | 'lost'
        redeemed_at?: string
    } | null
}

export default function AdminRedeemWidget({ orderId, reward }: AdminRedeemWidgetProps) {
    const supabase = createClient()
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [msg, setMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null)

    if (!reward || reward.status === 'lost') {
        return (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm opacity-60">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center">
                        <XCircle className="w-5 h-5 text-slate-500" />
                    </div>
                    <div>
                        <h4 className="font-bold text-slate-400 text-sm uppercase">Sin Premio</h4>
                        <p className="text-xs text-slate-600">Este pedido no tiene premio o fue "sigue intentando".</p>
                    </div>
                </div>
            </div>
        )
    }

    const handleRedeem = async () => {
        if (!confirm(`¿Confirmas que has entregado: ${reward.prize_title}?`)) return

        setLoading(true)
        setMsg(null)

        try {
            const { data, error } = await supabase.rpc('verify_and_redeem_reward', { p_order_id: orderId })

            if (error) throw error
            if (data && !data.success) throw new Error(data.error)

            setMsg({ type: 'success', text: '¡Marcado como entregado!' })
            router.refresh()

        } catch (e: any) {
            console.error('Redeem Error:', e)
            setMsg({ type: 'error', text: e.message || 'Error al canjear' })
        } finally {
            setLoading(false)
        }
    }

    if (reward.status === 'redeemed') {
        return (
            <div className="bg-blue-900/10 border border-blue-500/20 rounded-xl p-4 shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                        <CheckCircle className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                        <h4 className="font-bold text-blue-400 text-sm uppercase">Premio Entregado</h4>
                        <p className="text-sm font-medium text-white">{reward.prize_title}</p>
                        <p className="text-xs text-blue-300/60 mt-0.5">
                            {reward.redeemed_at ? new Date(reward.redeemed_at).toLocaleString() : 'Entregado'}
                        </p>
                    </div>
                </div>
            </div>
        )
    }

    // STATUS = ACTIVE
    return (
        <div className="bg-amber-900/10 border border-amber-500/30 rounded-xl p-4 shadow-md relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                <Gift className="w-24 h-24 text-amber-500 -rotate-12" />
            </div>

            <div className="relative z-10">
                <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center animate-pulse">
                        <Gift className="w-6 h-6 text-slate-900" />
                    </div>
                    <div>
                        <h4 className="font-bold text-amber-500 text-sm uppercase tracking-wider">¡Premio Pendiente!</h4>
                        <p className="text-lg font-black text-white leading-tight">{reward.prize_title}</p>
                        <code className="text-xs bg-black/30 px-2 py-0.5 rounded text-amber-300 font-mono mt-1 inline-block border border-amber-500/20">
                            {reward.prize_code}
                        </code>
                    </div>
                </div>

                {msg && (
                    <div className={`mb-3 p-2 rounded text-xs font-bold ${msg.type === 'error' ? 'bg-red-500/10 text-red-500' : 'bg-green-500/10 text-green-500'}`}>
                        {msg.text}
                    </div>
                )}

                <button
                    onClick={handleRedeem}
                    disabled={loading}
                    className="w-full py-3 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed text-slate-900 font-bold rounded-lg shadow-lg shadow-amber-900/20 flex items-center justify-center gap-2 transition-all active:scale-95"
                >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                    MARCAR COMO ENTREGADO
                </button>
                <p className="text-[10px] text-center text-slate-500 mt-2">
                    Presiona solo después de entregar el producto.
                </p>
            </div>
        </div>
    )
}
