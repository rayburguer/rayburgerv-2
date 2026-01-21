import { createClient } from '@/utils/supabase/server'
import { CheckCircle2, Send, ArrowRight, Store, Truck } from 'lucide-react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import ConfettiTrigger from '@/components/ConfettiTrigger'
import RewardTrigger from '@/components/RewardTrigger'

export const dynamic = 'force-dynamic'

export default async function OrderConfirmationPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const supabase = await createClient()

    // 1. Fetch Order Details SECURELY (via RPC for Guests)
    // 1. Fetch Order Details SECURELY (via RPC for Guests)
    const { data: orderResponse, error } = await supabase
        .rpc('get_public_order_details', { p_order_id: id })

    // El RPC devuelve un objeto con la estructura ya lista, pero puede venir null si no existe
    // El RPC devuelve un objeto con la estructura ya lista
    // const order = orderResponse as any (Moved below error check)

    // ... (rest of fetch logic calls)

    const { data: config } = await supabase
        .from('app_config')
        .select('value')
        .eq('id', 'main')
        .single()

    // Debug Validation
    if (error || !orderResponse) {
        console.error('[OrderConfirmation] Load Error:', { error, paramsId: id })
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-8 text-center">
                <div className="bg-red-900/10 p-6 rounded-2xl border border-red-500/20 max-w-md w-full">
                    <h1 className="text-xl font-bold text-red-500 mb-2">Error al Cargar Pedido</h1>
                    <p className="text-slate-400 text-sm mb-4">No pudimos encontrar la información de tu orden ({id}).</p>

                    <div className="bg-black/30 p-3 rounded text-left font-mono text-[10px] text-red-300 overflow-auto max-h-32 mb-4">
                        <p>RPC_ERROR: {error?.message || 'None'}</p>
                        <p>DATA_STATUS: {orderResponse ? 'Exists' : 'NULL'}</p>
                    </div>

                    <Link href="/menu" className="block w-full bg-slate-800 text-white font-bold py-3 rounded-lg hover:bg-slate-700 transition-colors">
                        Volver al Menú
                    </Link>
                </div>
            </div>
        )
    }

    const order = orderResponse as any

    const tasa = config ? parseFloat(config.value) : 0 // Fallback
    const totalBs = order.total_amount * tasa

    // 2. Logic for WhatsApp Message
    const deliveryText = order.delivery_type === 'delivery'
        ? `Delivery (Zona ${order.delivery_zone || '?'})${order.delivery_cost > 0 ? ` +$${order.delivery_cost}` : ''}`
        : 'Retiro en Local'

    const clientName = order.guest_name || order.user?.full_name || order.user?.email || 'Cliente'
    const contactInfo = order.guest_contact || order.user?.phone || ''

    const message = `¡Hola RayBurger! 🍔
Acabo de hacer el pedido #${order.id.slice(0, 8)}.
Cliente: ${clientName} ${order.guest_name ? '(Invitado)' : ''}
${contactInfo ? `Contacto: ${contactInfo}` : ''}

Total a Pagar: $${order.total_amount.toFixed(2)} (${totalBs.toFixed(2)} Bs)
Entrega: ${deliveryText}

Adjunto mi comprobante de pago. 📄`

    const whatsappUrl = `https://wa.me/584241234567?text=${encodeURIComponent(message)}` // Replace with real phone if known, using dummy +58...

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
            <ConfettiTrigger />
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-6">

                {/* Header Success */}
                <div className="text-center space-y-2">
                    <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle2 className="w-8 h-8 text-green-500" />
                    </div>
                    <h1 className="text-2xl font-bold text-white">¡Pedido Recibido!</h1>
                    <p className="text-slate-400 text-sm">Tu orden ha sido creada exitosamente.</p>
                </div>

                {/* Summary Card */}
                <div className="bg-slate-950 rounded-xl p-4 border border-slate-800 space-y-3">
                    <div className="flex justify-between items-center text-sm border-b border-slate-800 pb-3">
                        <span className="text-slate-400">Orden ID</span>
                        <span className="text-white font-mono break-all">{order.id}</span>
                    </div>

                    <div className="flex justify-between items-center text-sm border-b border-slate-800 pb-3">
                        <span className="text-slate-400">Cliente</span>
                        <span className="text-white font-medium text-right">
                            {clientName}
                            {order.guest_name && <span className="text-xs text-amber-500 block">Invitado</span>}
                        </span>
                    </div>

                    <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-400">Método Entrega</span>
                        <span className="text-amber-500 font-bold flex items-center gap-1">
                            {order.delivery_type === 'delivery' ? <Truck className="w-3 h-3" /> : <Store className="w-3 h-3" />}
                            {order.delivery_type === 'delivery' ? `Delivery (Zona ${order.delivery_zone})` : 'Retiro en Local'}
                        </span>
                    </div>

                    <div className="pt-3 border-t border-slate-800 flex flex-col items-end">
                        <p className="text-slate-500 text-xs uppercase mb-1">Total a Pagar</p>
                        <h2 className="text-3xl font-bold text-white">${order.total_amount.toFixed(2)}</h2>
                        <p className="text-slate-500 text-sm">Bs. {totalBs.toFixed(2)}</p>
                    </div>
                </div>

                {/* Interactive Reward (Modal Auto-Launch) */}
                <RewardTrigger orderId={order.id} isGuest={!order.user_id} />

                {/* Info Text */}
                <div className="bg-blue-900/10 p-3 rounded-lg border border-blue-900/30 text-center">
                    <p className="text-blue-200 text-xs">
                        Para confirmar tu pedido, por favor realiza el pago y envía el comprobante por WhatsApp.
                    </p>
                </div>

                {/* Actions */}
                <div className="space-y-3">
                    <a
                        href={whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-4 rounded-xl shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2"
                    >
                        <Send className="w-5 h-5" />
                        Enviar Comprobante por WhatsApp
                    </a>

                    <Link
                        href="/menu"
                        className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
                    >
                        Volver al Menú
                    </Link>
                </div>

            </div>
        </div>
    )
}
