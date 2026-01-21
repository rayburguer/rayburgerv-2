import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Calendar, User, MessageCircle, Phone } from 'lucide-react'
import OrderActions from './OrderActions'
import AdminRedeemWidget from '@/components/admin/AdminRedeemWidget'

interface PageProps {
    params: { id: string }
}

export default async function OrderDetailsPage({ params }: any) {
    // Await params for Next.js 15+ compatibility
    const { id } = await params
    const supabase = await createClient()

    // 1. Fetch deeply nested data
    const { data: order, error } = await supabase
        .from('orders')
        .select(`
      *,
      order_items (
        quantity,
        unit_price,
        products (
          name,
          image_url
        ),
        customization
      ),
      profiles (
        full_name,
        phone
      ),
      payment_reports (
        method,
        amount_usd,
        reference_number,
        screenshot_url
      ),
      user_rewards (
        id,
        prize_title,
        prize_code,
        prize_icon,
        status,
        redeemed_at
      )
    `)
        .eq('id', id)
        .single()


    if (error || !order) {
        return (
            <div className="p-8 text-white flex flex-col items-center justify-center">
                <p className="text-xl mb-4">Pedido no encontrado o error de acceso.</p>
                <Link href="/admin" className="text-amber-500 hover:underline">Volver al Tablero</Link>
            </div>
        )
    }

    // 2. Parse User Info
    const profileData = order.profiles
    const profile = Array.isArray(profileData) ? profileData[0] : profileData
    const userName = profile?.full_name || 'Desconocido'
    const userPhone = profile?.phone || 'Sin teléfono'

    // 3. WhatsApp Logic
    let waLink = '#'
    if (userPhone && userPhone.length > 5) {
        let clean = userPhone.replace(/\D/g, '')
        if (clean.startsWith('0')) clean = '58' + clean.slice(1)
        else if (!clean.startsWith('58')) clean = '58' + clean
        waLink = `https://wa.me/${clean}`
    }

    // 4. Parse Reward
    const rewardData = order.user_rewards
    const reward = Array.isArray(rewardData) ? rewardData[0] : rewardData

    return (
        <div className="space-y-6 max-w-5xl mx-auto pb-20">
            {/* Header Navigation */}
            <div>
                <Link
                    href="/admin"
                    className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Volver a Tablero
                </Link>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">
                            Pedido <span className="text-slate-500 text-xl font-mono">#{order.id.slice(0, 8)}</span>
                        </h1>
                        <div className="flex items-center gap-4 text-slate-400 text-sm">
                            <span className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                {new Date(order.created_at).toLocaleString('es-VE')}
                            </span>
                        </div>
                    </div>

                    <div>
                        <span className={`px-4 py-2 rounded-full text-sm font-bold border ${order.status === 'paid' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                            order.status === 'completed' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' :
                                order.status === 'cancelled' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                                    'bg-amber-500/10 text-amber-500 border-amber-500/20'
                            }`}>
                            {order.status.toUpperCase()}
                        </span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Left Column: Products List */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
                        <div className="p-4 border-b border-slate-800 bg-slate-950/30">
                            <h3 className="font-bold text-white">Productos del Pedido</h3>
                        </div>
                        <div className="divide-y divide-slate-800">
                            {order.order_items?.map((item: any, idx: number) => (
                                <div key={idx} className="p-4 flex gap-4 items-center hover:bg-slate-800/20 transition-colors">
                                    <div className="w-16 h-16 bg-slate-800 rounded-lg overflow-hidden shrink-0 border border-slate-700">
                                        <img
                                            src={item.products?.image_url || 'https://placehold.co/100'}
                                            alt={item.products?.name}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-white font-medium text-lg">{item.products?.name || 'Item Eliminado'}</p>

                                        {/* Customization Display */}
                                        {item.customization && item.customization.modifiers && item.customization.modifiers.length > 0 && (
                                            <div className="mt-1 flex flex-wrap gap-1">
                                                {item.customization.modifiers.map((mod: string, mIdx: number) => (
                                                    <span key={mIdx} className="inline-block px-1.5 py-0.5 bg-amber-500/10 text-amber-500 text-[10px] font-bold rounded border border-amber-500/20">
                                                        {mod}
                                                    </span>
                                                ))}
                                                {item.customization.finalPrice && item.customization.finalPrice > (item.unit_price * 1) && (
                                                    <span className="text-[10px] text-slate-500 font-mono ml-1">
                                                        (Precio base modificado)
                                                    </span>
                                                )}
                                            </div>
                                        )}

                                        <p className="text-slate-400 text-sm mt-1">Cantidad: <span className="text-white font-bold">{item.quantity}</span></p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-white font-bold text-lg">${(item.unit_price * item.quantity).toFixed(2)}</p>
                                        <p className="text-slate-500 text-xs">${item.unit_price} c/u</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Column: Customer & Actions */}
                <div className="space-y-6">

                    {/* Customer Card */}
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg">
                        <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-4">Datos del Cliente</h3>
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center shrink-0">
                                <User className="w-6 h-6 text-slate-400" />
                            </div>
                            <div>
                                <p className="text-white font-bold">{userName}</p>
                                <p className="text-slate-500 text-sm font-mono flex items-center gap-1">
                                    <Phone className="w-3 h-3" /> {userPhone}
                                </p>
                            </div>
                        </div>

                        {userPhone && userPhone.length > 5 && (
                            <a
                                href={waLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center gap-2 w-full py-3 bg-green-600 hover:bg-green-500 text-white rounded-xl font-bold transition-all hover:scale-[1.02] shadow-lg shadow-green-900/20"
                            >
                                <MessageCircle className="w-5 h-5" />
                                Chat WhatsApp
                            </a>
                        )}
                    </div>

                    {/* Payment Report Card */}
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg">
                        <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-4">Reporte de Pago</h3>

                        {order.payment_reports && order.payment_reports.length > 0 ? (
                            <div className="space-y-4">
                                {order.payment_reports.map((report: any, idx: number) => (
                                    <div key={idx} className="bg-slate-950/50 p-4 rounded-xl border border-slate-800/50 space-y-3">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="text-white font-bold text-sm uppercase">{report.method}</p>
                                                <p className="text-slate-500 text-xs font-mono">Ref: {report.reference_number || 'N/A'}</p>
                                            </div>
                                            <span className="text-green-400 font-bold font-mono">${Number(report.amount_usd).toFixed(2)}</span>
                                        </div>

                                        {report.screenshot_url && (
                                            <a
                                                href={report.screenshot_url}
                                                target="_blank"
                                                className="block w-full py-2 bg-slate-800 hover:bg-slate-700 text-center rounded-lg text-xs text-slate-300 font-bold transition-colors border border-slate-700"
                                            >
                                                Ver Comprobante
                                            </a>
                                        )}
                                    </div>
                                ))}

                                <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg text-xs text-amber-200">
                                    <p>⚠️ Verifica el monto en banco antes de aprobar.</p>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center p-6 bg-slate-950/30 rounded-xl border border-dashed border-slate-800">
                                <p className="text-slate-500 text-sm">Sin reporte de pago registrado.</p>
                            </div>
                        )}
                    </div>

                    {/* Totals & Actions Card */}
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg">
                        <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-4">Gestión del Pedido</h3>

                        {/* REDEEM WIDGET (New) */}
                        <div className="mb-6">
                            <AdminRedeemWidget orderId={order.id} reward={reward} />
                        </div>


                        <div className="space-y-3 mb-6 bg-slate-950/50 p-4 rounded-xl border border-slate-800/50">
                            <div className="flex justify-between text-slate-300">
                                <span>Subtotal</span>
                                <span>${Number(order.total || order.total_amount || 0).toFixed(2)}</span>
                            </div>
                            <div className="h-px bg-slate-800 my-1" />
                            <div className="flex justify-between text-2xl font-bold text-white">
                                <span>Total</span>
                                <span className="text-amber-500">${Number(order.total || order.total_amount || 0).toFixed(2)}</span>
                            </div>
                        </div>

                        {/* Client Interactions */}
                        <div className="space-y-3">
                            <OrderActions orderId={order.id} currentStatus={order.status} />
                        </div>
                    </div>

                </div>

            </div>
        </div>
    )
}
