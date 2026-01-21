'use client'

import { X, Plus, Minus, Trash2, Loader2, ArrowLeft, Send, CheckCircle2, Wallet, Camera, Copy, UserCircle, Pizza, ShoppingBag } from 'lucide-react'
import { useCartStore } from '@/store/cart'
import { useEffect, useState, useRef } from 'react'
import { placeOrder } from '@/app/actions/place-order'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'

// V3 Specs hardcoded (si no hay app_config en context)
// Tasa dinámica desde DB


interface CartDrawerProps {
    isOpen: boolean
    onClose: () => void
}

type Step = 'cart' | 'auth_choice' | 'guest_form' | 'delivery' | 'payment'

export default function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
    const { items, addItem, removeItem, totalPrice, clearCart } = useCartStore()
    const [mounted, setMounted] = useState(false)
    const [isOrdering, setIsOrdering] = useState(false)
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [step, setStep] = useState<Step>('cart')

    // Guest Data
    const [guestName, setGuestName] = useState('')
    const [guestContact, setGuestContact] = useState('')

    // Payment Data States
    const [reference, setReference] = useState('')
    const [paymentProof, setPaymentProof] = useState('') // Just a flag or filename for now
    const [useBalance, setUseBalance] = useState(false)
    const [walletBalance, setWalletBalance] = useState(0)

    // Delivery Logic
    const [deliveryType, setDeliveryType] = useState<'pickup' | 'delivery'>('pickup')
    const [deliveryZone, setDeliveryZone] = useState('1') // '1', '2', '3'
    const [balanceLoading, setBalanceLoading] = useState(true)
    const [tasaDolar, setTasaDolar] = useState(0) // Se obtiene de DB


    const router = useRouter()
    const fileInputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        setMounted(true)
    }, [])

    // Fetch Balance when drawer opens
    useEffect(() => {
        if (isOpen) {
            setStep('cart')
            setReference('')
            setPaymentProof('')
            setUseBalance(false)
            setDeliveryType('pickup')
            setDeliveryZone('1')
            fetchBalanceAndRate()
        }
    }, [isOpen])

    const fetchBalanceAndRate = async () => {
        setBalanceLoading(true)
        const supabase = createBrowserClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
            setIsAuthenticated(true)
            const { data: profile } = await supabase.from('profiles').select('wallet_balance').eq('id', user.id).single()
            setWalletBalance(Number(profile?.wallet_balance || 0))
        } else {
            setIsAuthenticated(false)
            setWalletBalance(0)
        }

        // Fetch Tasa Dinámica
        const { data: menuData } = await supabase.from('v_menu_completo').select('tasa_referencia').limit(1).single()
        if (menuData?.tasa_referencia) {
            setTasaDolar(Number(menuData.tasa_referencia))
        }
        setBalanceLoading(false)
    }

    if (!mounted) return null

    const cartItems = items || []
    const baseTotal = isNaN(totalPrice) ? 0 : totalPrice

    // DELIVERY CALC
    const deliveryCost = deliveryType === 'delivery' ? Number(deliveryZone) : 0
    const displayTotal = baseTotal + deliveryCost

    // Cálculos de Pago
    const walletDeduction = useBalance ? Math.min(walletBalance, displayTotal) : 0
    const remainingToPayUSD = Math.max(0, displayTotal - walletDeduction)
    const remainingToPayBS = remainingToPayUSD * tasaDolar

    // Datos Pago Móvil (Hardcoded V3)
    const PAGO_MOVIL = {
        banco: '0102 - Venezuela',
        telefono: '04128344594',
        cedula: 'V-13412781'
    }

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text)
        alert('Copiado: ' + text)
    }

    const handleCheckout = async () => {
        // Validación Flexible: Capture O Referencia
        // (Si hay deuda pendiente)
        const hasDebt = remainingToPayUSD > 0
        const hasPaymentInfo = reference.length >= 4 || paymentProof.length > 0

        if (hasDebt && !hasPaymentInfo) {
            alert('Por favor, ingresa los últimos 4 dígitos o sube el capture para validar tu pago.')
            return
        }

        setIsOrdering(true)
        try {
            // Si el usuario no subió archivo real pero activamos el flag, mandamos placeholder
            const finalProof = paymentProof ? 'capture_subido.jpg' : ''

            const result = await placeOrder({
                cartItems,
                total: displayTotal,
                paymentReference: reference,
                useBalance,
                paymentProof: finalProof,
                deliveryType,
                deliveryZone: deliveryType === 'delivery' ? deliveryZone : undefined,
                guestName: !isAuthenticated ? guestName : undefined,
                guestContact: !isAuthenticated ? guestContact : undefined
            })

            if (result.success && result.orderId) {
                // Generar Mensaje de WhatsApp
                const text = generateWhatsAppMessage({
                    orderId: result.orderId,
                    items: cartItems,
                    total: displayTotal,
                    deliveryType,
                    reference: reference || (paymentProof ? 'Capture Subido' : 'Saldo Favor/Pendiente'),
                    customerName: !isAuthenticated ? guestName : 'Usuario Registrado'
                })

                // Redirigir a WhatsApp
                // Numero del Admin (Tomado de PAGO_MOVIL constant o config)
                const ADMIN_PHONE = '584128344594'
                window.open(`https://wa.me/${ADMIN_PHONE}?text=${encodeURIComponent(text)}`, '_blank')

                clearCart()
                onClose()
                // alert('¡Recibido! Estamos verificando tu pago para liberar tus puntos y enviar tu pedido. 🚀') // Alert redundante si ya abrimos WA
                router.push(`/order-confirmation/${result.orderId}`)
            } else {
                alert('Error al crear el pedido: ' + (result.error || 'Desconocido'))
            }
        } catch (error: any) {
            alert('Error crítico de conexión: ' + error.message)
        } finally {
            setIsOrdering(false)
        }
    }

    // --- RENDER CONTENT BY STEP ---

    // UI: CART STEP
    const renderCartStep = () => (
        <>
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
                {/* Same Cart List as before */}
                {cartItems.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-slate-500 space-y-6 animate-in fade-in zoom-in duration-500 relative overflow-hidden">
                        {/* Background pop elements */}
                        <div className="absolute top-10 left-10 text-slate-800 opacity-20 transform -rotate-12 text-6xl font-black select-none">?</div>
                        <div className="absolute bottom-20 right-10 text-slate-800 opacity-20 transform rotate-45 text-8xl font-black select-none">!</div>

                        <div className="relative group cursor-pointer" onClick={onClose}>
                            {/* Empty Burger Illustration (PNG) */}
                            <img
                                src="/illustrations/sad-burger.png"
                                alt="Sad Burger"
                                className="w-56 h-56 object-contain drop-shadow-2xl transition-transform group-hover:scale-110 duration-300 filter group-hover:brightness-110"
                            />

                            <div className="absolute -bottom-2 -right-6 bg-red-500 text-white font-black text-xs px-3 py-1 rotate-[-10deg] rounded-lg border-2 border-white shadow-lg animate-bounce">
                                ¡SOS!
                            </div>
                        </div>

                        <div className="text-center space-y-2 relative z-10">
                            <h3 className="text-3xl font-black text-white tracking-tight -rotate-1">
                                ¡ALERTA ROJA! 🚨
                            </h3>
                            <p className="text-slate-400 font-medium text-lg">
                                Niveles de hamburguesa <br />
                                <span className="text-red-500 font-bold">CRÍTICAMENTE BAJOS</span>
                            </p>
                        </div>

                        <button
                            onClick={onClose}
                            className="bg-amber-500 hover:bg-amber-400 text-slate-900 text-lg font-black py-4 px-10 rounded-2xl border-2 border-slate-950 pop-shadow-strong transform hover:-translate-y-1 active:translate-y-0 active:pop-shadow-none transition-all"
                        >
                            RESCATARME 🍔
                        </button>
                    </div>
                ) : (
                    cartItems.map((item) => (
                        <div key={item.id} className="flex gap-4 bg-slate-950/50 p-3 rounded-xl border border-slate-800/50 animate-in fade-in slide-in-from-right-4">
                            <div className="w-16 h-16 rounded-lg overflow-hidden bg-slate-800 shrink-0">
                                <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1 flex flex-col justify-between">
                                <div className="flex justify-between items-start">
                                    <h4 className="text-white font-medium text-sm line-clamp-1">{item.name}</h4>
                                    {item.customization && item.customization.modifiers && item.customization.modifiers.length > 0 && (
                                        <div className="flex flex-wrap gap-1 mt-1">
                                            {item.customization.modifiers.map((mod: any, idx: number) => (
                                                <span key={idx} className="text-[10px] text-slate-400 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-700">
                                                    {mod}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                    <p className="text-amber-500 font-bold bg-amber-500/10 px-2 py-0.5 rounded text-xs ml-2 shrink-0">
                                        ${(item.price_usd * item.quantity).toFixed(2)}
                                    </p>
                                </div>
                                <div className="flex items-center gap-3 mt-2">
                                    <div className="flex items-center bg-slate-900 rounded-lg border border-slate-700">
                                        <button onClick={() => removeItem(item.id)} className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-white transition-colors">
                                            {item.quantity === 1 ? <Trash2 className="w-4 h-4" /> : <Minus className="w-4 h-4" />}
                                        </button>
                                        <span className="w-6 text-center text-sm font-bold text-white">{item.quantity}</span>
                                        <button onClick={() => addItem(item)} className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-white transition-colors">
                                            <Plus className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <div className="p-5 border-t border-slate-800 bg-slate-900">
                <div className="flex justify-between text-white text-xl font-bold mb-6">
                    <span>Total</span>
                    <span className="text-amber-500">${displayTotal.toFixed(2)}</span>
                </div>
                <button
                    onClick={() => {
                        if (!isAuthenticated) {
                            setStep('auth_choice')
                            return
                        }
                        setStep('delivery')
                    }}
                    disabled={cartItems.length === 0}
                    className="w-full bg-linear-to-r from-amber-600 to-orange-600 hover:to-orange-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-orange-900/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                    {isAuthenticated ? 'Ir a Pagar' : 'Finalizar Pedido'} <ArrowRightIcon />
                </button>
            </div>
        </>
    )

    // UI: AUTH CHOICE (Guest vs Login)
    const renderAuthChoiceStep = () => (
        <div className="flex-1 p-5 space-y-6 flex flex-col justify-center animate-in slide-in-from-right-8">
            <div className="text-center space-y-2">
                <div className="w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <UserCircle className="w-8 h-8 text-amber-500" />
                </div>
                <h3 className="text-xl font-bold text-white">¿Cómo deseas continuar?</h3>
                <p className="text-slate-400 text-sm">Elige una opción para finalizar tu compra.</p>
            </div>

            <div className="space-y-4">
                <button
                    onClick={() => setStep('guest_form')}
                    className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-4 rounded-xl transition-colors border border-slate-700"
                >
                    Continuar como Invitado
                </button>

                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-slate-800" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-slate-950 px-2 text-slate-500">O mejor aún</span>
                    </div>
                </div>

                <button
                    onClick={() => router.push('/login?redirect=menu')} // Simple redirect
                    className="w-full bg-amber-600 hover:bg-amber-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-amber-900/20 transition-all group relative overflow-hidden"
                >
                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                    <span className="relative flex flex-col items-center leading-tight">
                        <span>Iniciar Sesión / Registrarse</span>
                        <span className="text-[10px] opacity-90 mt-1 bg-black/20 px-2 py-0.5 rounded-full">
                            🎁 Gana $0.50 de Bono
                        </span>
                    </span>
                </button>
            </div>
        </div>
    )

    // UI: GUEST FORM
    const renderGuestFormStep = () => (
        <div className="flex-1 p-5 space-y-6 animate-in slide-in-from-right-8">
            <div className="text-center mb-6">
                <h3 className="text-lg font-bold text-white">Datos de Invitado</h3>
                <p className="text-slate-400 text-xs">Necesitamos esto para contactarte sobre tu delivery.</p>
            </div>

            <div className="space-y-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Nombre Completo</label>
                    <input
                        type="text"
                        value={guestName}
                        onChange={(e) => setGuestName(e.target.value)}
                        placeholder="Ej. Juan Pérez"
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-amber-500 transition-colors"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">WhatsApp / Teléfono</label>
                    <input
                        type="tel"
                        value={guestContact}
                        onChange={(e) => setGuestContact(e.target.value)}
                        placeholder="Ej. 0412 123 4567"
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-amber-500 transition-colors"
                    />
                </div>
            </div>

            <button
                onClick={() => {
                    if (guestName.length < 3 || guestContact.length < 8) {
                        alert('Por favor completa tus datos correctamente.')
                        return
                    }
                    setStep('delivery')
                }}
                className="w-full mt-6 bg-slate-100 hover:bg-white text-slate-900 font-bold py-4 rounded-xl shadow-lg transition-all"
            >
                Continuar a Delivery
            </button>
        </div>
    )

    // UI: DELIVERY STEP
    const renderDeliveryStep = () => (
        <div className="flex-1 overflow-y-auto p-5 space-y-6 animate-in slide-in-from-right-8 duration-300">
            <h3 className="text-white font-bold text-lg mb-2">Método de Entrega</h3>

            {/* 1. Selector Tipo */}
            <div className="grid grid-cols-2 gap-4">
                <button
                    onClick={() => setDeliveryType('pickup')}
                    className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${deliveryType === 'pickup'
                        ? 'bg-amber-500/10 border-amber-500 text-amber-500'
                        : 'bg-slate-900 border-slate-800 text-slate-500 hover:border-slate-700'
                        }`}
                >
                    <span className="font-bold">Retiro en Local</span>
                    <span className="text-xs">Gratis</span>
                </button>
                <button
                    onClick={() => setDeliveryType('delivery')}
                    className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${deliveryType === 'delivery'
                        ? 'bg-amber-500/10 border-amber-500 text-amber-500'
                        : 'bg-slate-900 border-slate-800 text-slate-500 hover:border-slate-700'
                        }`}
                >
                    <span className="font-bold">Delivery</span>
                    <span className="text-xs">A Domicilio</span>
                </button>
            </div>

            {/* 2. Zonas (Solo si es Delivery) */}
            {deliveryType === 'delivery' && (
                <div className="space-y-3 animate-in fade-in zoom-in duration-200">
                    <h3 className="text-white font-bold text-sm">Selecciona tu Zona:</h3>
                    {['1', '2', '3'].map((z) => (
                        <button
                            key={z}
                            onClick={() => setDeliveryZone(z)}
                            className={`w-full p-3 rounded-lg flex justify-between items-center transition-all ${deliveryZone === z
                                ? 'bg-amber-500 text-slate-900 font-bold'
                                : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
                                }`}
                        >
                            <span>Zona {z}</span>
                            <span>${z}.00</span>
                        </button>
                    ))}
                    <p className="text-xs text-slate-500 text-center mt-2">
                        *El costo se sumará automáticamente al total.
                    </p>
                </div>
            )}

            {/* Total Preview */}
            <div className="mt-8 bg-slate-900 p-4 rounded-xl space-y-2 border border-slate-800">
                <div className="flex justify-between text-slate-400 text-sm">
                    <span>Subtotal</span>
                    <span>${baseTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-400 text-sm">
                    <span>Delivery</span>
                    <span className={deliveryCost > 0 ? 'text-amber-500' : ''}>
                        {deliveryCost > 0 ? `$${deliveryCost.toFixed(2)}` : 'Gratis'}
                    </span>
                </div>
                <div className="flex justify-between text-white font-bold text-lg pt-2 border-t border-slate-800">
                    <span>Total Final</span>
                    <span className="text-amber-500">${displayTotal.toFixed(2)}</span>
                </div>
            </div>

            <button
                onClick={() => setStep('payment')}
                className="w-full mt-4 bg-amber-600 hover:bg-amber-500 text-white font-bold py-4 rounded-xl transition-all"
            >
                Confirmar y Pagar
            </button>
        </div>
    )

    // UI: PAYMENT STEP
    const renderPaymentStep = () => (
        <div className="flex-1 overflow-y-auto p-5 pb-20 space-y-6 animate-in slide-in-from-right-8 duration-300">

            {/* 1. Wallet Toggle */}
            <div className={`p-4 rounded-xl border transition-all ${useBalance ? 'bg-amber-500/10 border-amber-500/50' : 'bg-slate-950 border-slate-800'}`}>
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                        <Wallet className={`w-5 h-5 ${useBalance ? 'text-amber-500' : 'text-slate-400'}`} />
                        <span className="text-white font-bold text-sm">Usar Saldo Favor</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" checked={useBalance} onChange={(e) => setUseBalance(e.target.checked)} disabled={walletBalance <= 0} />
                        <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                    </label>
                </div>
                <p className="text-xs text-slate-400">Disponible: ${walletBalance.toFixed(2)}</p>
                {useBalance && (
                    <div className="mt-2 text-xs font-mono text-amber-300">
                        - ${walletDeduction.toFixed(2)} será descontado.
                    </div>
                )}
            </div>

            {/* Resumen a Pagar */}
            <div className="bg-slate-800/50 p-4 rounded-xl text-center border border-slate-700">
                <p className="text-slate-400 text-xs uppercase mb-1">Total Restante a Pagar</p>
                {remainingToPayUSD > 0 ? (
                    <>
                        <h3 className="text-3xl font-bold text-white tracking-tight">${remainingToPayUSD.toFixed(2)}</h3>
                        <p className="text-slate-400 text-sm font-mono mt-1">Bs. {remainingToPayBS.toFixed(2)}</p>
                    </>
                ) : (
                    <h3 className="text-2xl font-bold text-green-500 flex items-center justify-center gap-2">
                        <CheckCircle2 className="w-6 h-6" /> Cubierto
                    </h3>
                )}
            </div>

            {/* 2. Datos de Pago (Solo si hay deuda) */}
            {remainingToPayUSD > 0 && (
                <div className="space-y-4">
                    <h3 className="text-white font-bold text-sm flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-xs">1</span>
                        Pago Móvil / Zelle
                    </h3>

                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-2">
                            <button onClick={() => handleCopy(`${PAGO_MOVIL.telefono} ${PAGO_MOVIL.cedula}`)} className="text-slate-500 hover:text-white transition-colors">
                                <Copy className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="space-y-1 text-sm">
                            <p className="text-slate-400">Banco: <span className="text-white font-mono">{PAGO_MOVIL.banco}</span></p>
                            <p className="text-slate-400">Teléfono: <span className="text-white font-mono">{PAGO_MOVIL.telefono}</span></p>
                            <p className="text-slate-400">Cédula: <span className="text-white font-mono">{PAGO_MOVIL.cedula}</span></p>
                        </div>
                    </div>
                </div>
            )}

            {/* 3. Reporte de Pago */}
            {(remainingToPayUSD > 0) && (
                <div className="space-y-4">
                    <h3 className="text-white font-bold text-sm flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-xs">2</span>
                        Reportar Pago
                    </h3>

                    <div className="grid grid-cols-2 gap-3">
                        {/* File Input Fake UI */}
                        <div className="relative">
                            <input
                                ref={fileInputRef}
                                type="file"
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                accept="image/*"
                                onChange={(e) => {
                                    if (e.target.files?.[0]) {
                                        setPaymentProof(e.target.files[0].name)
                                        // Visual feedback only
                                        // alert('Capture seleccionado')
                                    }
                                }}
                            />
                            <div className={`flex flex-col items-center justify-center h-full min-h-[50px] border border-dashed rounded-xl transition-colors py-3 ${paymentProof ? 'bg-green-500/10 border-green-500/50 text-green-500' : 'bg-slate-900 border-slate-700 text-slate-500 hover:text-white hover:border-slate-500'
                                }`}>
                                {paymentProof ? <CheckCircle2 className="w-5 h-5 mb-1" /> : <Camera className="w-5 h-5 mb-1" />}
                                <span className="text-[10px] uppercase font-bold text-center px-1">
                                    {paymentProof ? 'Capture Listo' : 'Subir Capture'}
                                </span>
                            </div>
                        </div>

                        {/* Reference Input */}
                        <input
                            type="text"
                            placeholder="Últimos 4 dígitos"
                            value={reference}
                            onChange={(e) => {
                                const val = e.target.value.replace(/\D/g, '').slice(0, 4)
                                setReference(val)
                            }}
                            className="bg-slate-900 border border-slate-800 text-white rounded-xl px-3 text-center focus:outline-none focus:border-amber-500 font-mono text-sm placeholder:text-slate-700"
                        />
                    </div>
                </div>
            )}

            {/* Action Final */}
            <button
                onClick={handleCheckout}
                disabled={isOrdering}
                className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-green-900/20 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4"
            >
                {isOrdering ? (
                    <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Validando...
                    </>
                ) : (
                    <>
                        <Send className="w-5 h-5" />
                        Enviar Reporte de Pago
                    </>
                )}
            </button>
        </div>
    )

    return (
        <>
            {isOpen && <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity" onClick={onClose} />}
            <div className={`fixed top-0 right-0 h-full w-[90%] max-w-md bg-slate-950 border-l border-slate-800 shadow-2xl z-50 transform transition-transform duration-300 ease-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className="flex flex-col h-full bg-slate-950">
                    {/* Header */}
                    <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-900/50 backdrop-blur-md">
                        <div className="flex items-center gap-3">
                            {step !== 'cart' && (
                                <button onClick={() => {
                                    if (step === 'auth_choice') setStep('cart')
                                    else if (step === 'guest_form') setStep('auth_choice')
                                    else if (step === 'delivery') setStep(isAuthenticated ? 'cart' : 'guest_form')
                                    else if (step === 'payment') setStep('delivery')
                                    else setStep('cart')
                                }} className="p-1 text-slate-400 hover:text-white rounded-full">
                                    <ArrowLeft className="w-5 h-5" />
                                </button>
                            )}
                            <h2 className="text-lg font-bold text-white">
                                {step === 'cart' ? 'Tu Pedido' :
                                    step === 'auth_choice' ? 'Identifícate' :
                                        step === 'guest_form' ? 'Tus Datos' :
                                            step === 'delivery' ? 'Entrega' : 'Pago'}
                            </h2>
                        </div>
                        <button onClick={onClose} disabled={isOrdering} className="p-2 text-slate-400 hover:text-white bg-slate-900 rounded-full transition-colors border border-slate-800">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {step === 'cart' && renderCartStep()}
                    {step === 'auth_choice' && renderAuthChoiceStep()}
                    {step === 'guest_form' && renderGuestFormStep()}
                    {step === 'delivery' && renderDeliveryStep()}
                    {step === 'payment' && renderPaymentStep()}
                </div>
            </div>
        </>
    )
}


function generateWhatsAppMessage({ orderId, items, total, deliveryType, reference, customerName }: any) {
    let message = `¡Hola! Quiero confirmar mi pedido *#${orderId.slice(0, 6).toUpperCase()}* 🍔\n`
    message += `--------------------------------\n`

    items.forEach((item: any) => {
        message += `${item.quantity}x ${item.name}\n`
        if (item.customization?.modifiers?.length > 0) {
            message += `   (${item.customization.modifiers.join(', ')})\n`
        }
    })

    message += `--------------------------------\n`
    message += `💰 *Total: $${total.toFixed(2)}*\n`
    // message += `📍 Entrega: ${deliveryType === 'delivery' ? 'Delivery' : 'Pick-up'}\n`
    message += `💳 Ref: ${reference}\n`
    if (customerName) message += `👤 Cliente: ${customerName}\n`

    return message
}

function ArrowRightIcon() {
    return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
}
