'use client'

import { useState } from 'react'
import { updateOrderStatus } from '@/app/actions/admin'
import { CheckCircle2, XCircle, Truck, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function OrderActions({
    orderId,
    currentStatus
}: {
    orderId: string,
    currentStatus: string
}) {
    const [loading, setLoading] = useState<string | null>(null)
    const router = useRouter()

    const handleUpdate = async (status: string) => {
        // Confirmación simple
        if (!confirm(`¿Estás seguro de cambiar el estatus a: ${status.toUpperCase()}?`)) return

        setLoading(status)
        try {
            // Usamos Server Action para máxima seguridad y revalidación automática
            const res = await updateOrderStatus(orderId, status)

            if (!res.success) {
                alert('Error: ' + res.error)
            } else {
                // Éxito: El router.refresh() a veces ayuda si revalidatePath no es instantáneo en cliente
                router.refresh()
            }
        } catch (err) {
            alert('Error de conexión')
        } finally {
            setLoading(null)
        }
    }

    // Render logic para estados
    if (currentStatus === 'cancelled') {
        return <div className="p-3 bg-red-900/20 border border-red-900/50 rounded-lg text-red-500 text-center font-bold">Pedido Cancelado</div>
    }

    if (currentStatus === 'delivered') {
        return <div className="p-3 bg-blue-900/20 border border-blue-900/50 rounded-lg text-blue-500 text-center font-bold">Pedido Completado y Entregado</div>
    }

    return (
        <div className="flex flex-col gap-3 w-full">
            {/* Estado Inicial: Confirmar Pago */}
            {(currentStatus === 'pending' || currentStatus === 'pending_confirmation') && (
                <button
                    onClick={() => handleUpdate('preparing')}
                    disabled={!!loading}
                    className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-amber-600 hover:bg-amber-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-amber-900/20 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {loading === 'preparing' ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
                    Confirmar Pago y Preparar
                </button>
            )}

            {/* Estado Cocina: Marcar Enviado/Entregado */}
            {(currentStatus === 'preparing' || currentStatus === 'paid') && (
                <button
                    onClick={() => handleUpdate('delivered')}
                    disabled={!!loading}
                    className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-900/20 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {loading === 'delivered' ? <Loader2 className="w-5 h-5 animate-spin" /> : <Truck className="w-5 h-5" />}
                    Marcar como ENTREGADO
                </button>
            )}

            {/* Botón de Cancelar siempre disponible si no está completado */}
            {(currentStatus === 'pending' || currentStatus === 'pending_confirmation' || currentStatus === 'preparing' || currentStatus === 'paid') && (
                <button
                    onClick={() => handleUpdate('cancelled')}
                    disabled={!!loading}
                    className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-slate-800 hover:bg-red-900/30 text-slate-400 hover:text-red-400 border border-slate-700 hover:border-red-900/50 rounded-xl font-medium transition-colors mt-2"
                >
                    {loading === 'cancelled' ? <Loader2 className="w-5 h-5 animate-spin" /> : <XCircle className="w-5 h-5" />}
                    Cancelar Pedido
                </button>
            )}
        </div>
    )
}
