'use client'

import React, { useRef, useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Trophy, X, Loader2, Wallet, PartyPopper, Frown, Utensils, Gift, Zap } from 'lucide-react'
import confetti from 'canvas-confetti'
import { useRouter } from 'next/navigation'

interface ScratchRewardModalProps {
    isOpen: boolean
    onClose: () => void
    orderId: string
    isGuest?: boolean
}

// Mapeo Visual de Premios
const PRIZE_ICONS: Record<string, any> = {
    'burger': { icon: Utensils, color: 'text-amber-500', bg: 'bg-amber-500/20' },
    'hotdog': { icon: Utensils, color: 'text-red-500', bg: 'bg-red-500/20' },
    'soda': { icon: Zap, color: 'text-blue-400', bg: 'bg-blue-400/20' },
    'coins': { icon: Wallet, color: 'text-yellow-400', bg: 'bg-yellow-400/20' },
    'moto': { icon: Zap, color: 'text-green-400', bg: 'bg-green-400/20' },
    'users': { icon: PartyPopper, color: 'text-purple-400', bg: 'bg-purple-400/20' },
    'sad': { icon: Frown, color: 'text-slate-400', bg: 'bg-slate-700/50' },
}

export default function ScratchRewardModal({ isOpen, onClose, orderId, isGuest }: ScratchRewardModalProps) {
    const supabase = createClient()
    const router = useRouter()

    const canvasRef = useRef<HTMLCanvasElement>(null)
    const containerRef = useRef<HTMLDivElement>(null)

    // Estado del Juego
    const [loading, setLoading] = useState(true)
    const [prizeData, setPrizeData] = useState<any>(null)
    const [isRevealed, setIsRevealed] = useState(false)
    const [isScratching, setIsScratching] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // 1. OBTENER PREMIO (Secure RPC)
    useEffect(() => {
        if (isOpen && orderId) {
            checkSessionAndFetch()
        }
    }, [isOpen, orderId])

    const checkSessionAndFetch = async () => {
        // Double Check Session to fix "Guest Loop"
        const { data: { session } } = await supabase.auth.getSession()

        // Si hay sesión pero la página dice que es Guest, refrescamos para sincronizar
        if (session && isGuest) {
            console.log('[ScratchModal] Session detected but isGuest=true. Refreshing...')
            router.refresh()
            // Continue fetching anyway to show prize meanwhile
        }

        fetchPrize()
    }

    const fetchPrize = async () => {
        try {
            setLoading(true)
            const { data, error } = await supabase.rpc('claim_scratch_reward', { p_order_id: orderId })

            if (error) throw error
            if (data && !data.success) throw new Error(data.error || 'Error desconocido')

            setPrizeData(data)

            // UX FIX: SIEMPRE iniciamos tapado para dar la emoción de raspar (incluso si ya fue jugado)
            // if (data.is_replay) setIsRevealed(true) <--- REMOVED

        } catch (e: any) {
            console.error('Error fetching prize:', e)
            setError(e.message)
        } finally {
            setLoading(false)
        }
    }

    // 2. INICIALIZAR CANVAS
    useEffect(() => {
        // Renderizamos canvas siempre que no esté revelado visualmente
        if (!isOpen || loading || isRevealed || error) return

        const timer = setTimeout(() => {
            const canvas = canvasRef.current
            const container = containerRef.current
            if (!canvas || !container) return

            const ctx = canvas.getContext('2d')
            if (!ctx) return

            const rect = container.getBoundingClientRect()
            canvas.width = rect.width
            canvas.height = rect.height

            // Arte del Raspadito (Dorado Premium)
            const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
            gradient.addColorStop(0, '#B45309')
            gradient.addColorStop(0.2, '#FCD34D')
            gradient.addColorStop(0.5, '#F59E0B')
            gradient.addColorStop(0.8, '#FCD34D')
            gradient.addColorStop(1, '#B45309')

            ctx.fillStyle = gradient
            ctx.fillRect(0, 0, canvas.width, canvas.height)

            // Decoración
            ctx.fillStyle = '#78350F'
            ctx.font = 'bold 24px sans-serif'
            ctx.textAlign = 'center'
            ctx.textBaseline = 'middle'
            ctx.fillText('¡RASPA AQUÍ!', canvas.width / 2, canvas.height / 2)

        }, 100)

        return () => clearTimeout(timer)
    }, [isOpen, loading, isRevealed, error])

    // 3. LOGICA RASPADO
    const scratch = (clientX: number, clientY: number) => {
        const canvas = canvasRef.current
        if (!canvas || isRevealed) return

        const ctx = canvas.getContext('2d')
        if (!ctx) return

        const rect = canvas.getBoundingClientRect()
        const x = clientX - rect.left
        const y = clientY - rect.top

        ctx.globalCompositeOperation = 'destination-out'
        ctx.beginPath()
        ctx.arc(x, y, 30, 0, Math.PI * 2)
        ctx.fill()

        checkRevealProgress()
    }

    const checkRevealProgress = () => {
        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext('2d', { willReadFrequently: true })

        if (!ctx) return

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        const pixels = imageData.data
        let transparent = 0
        const totalSample = pixels.length / 40

        for (let i = 3; i < pixels.length; i += 40) {
            if (pixels[i] === 0) transparent++
        }

        const percentage = (transparent / totalSample) * 100

        if (percentage > 50 && !isRevealed) {
            revealPrize()
        }
    }

    const revealPrize = () => {
        setIsRevealed(true)
        if (canvasRef.current) canvasRef.current.style.opacity = '0'

        // Vibración
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
            navigator.vibrate([100, 50, 100])
        }

        // Confeti
        if (prizeData?.icon !== 'sad') {
            confetti({
                particleCount: 150,
                spread: 100,
                origin: { y: 0.6 },
                zIndex: 9999
            })
        }
    }

    // Handlers Mouse/Touch
    const handleMouseDown = ({ clientX, clientY }: React.MouseEvent) => { setIsScratching(true); scratch(clientX, clientY) }
    const handleMouseMove = ({ clientX, clientY }: React.MouseEvent) => { if (isScratching) scratch(clientX, clientY) }
    const handleMouseUp = () => setIsScratching(false)
    const handleTouchStart = (e: React.TouchEvent) => { setIsScratching(true); scratch(e.touches[0].clientX, e.touches[0].clientY) }
    const handleTouchMove = (e: React.TouchEvent) => { if (isScratching) scratch(e.touches[0].clientX, e.touches[0].clientY) }

    // UI Helpers
    const handleClose = () => {
        if (isGuest && isRevealed) {
            router.push(`/login?redirect=/order-confirmation/${orderId}&claim=true`)
        } else {
            router.push('/menu')
        }
    }

    if (!isOpen) return null

    // Seleccionar Icono Visual
    const Visual = (prizeData && PRIZE_ICONS[prizeData.icon]) || PRIZE_ICONS['burger']

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-300" />

            <div className="relative w-full max-w-sm bg-slate-900 rounded-3xl overflow-hidden border-2 border-amber-500/30 shadow-2xl animate-in zoom-in-95 duration-300">

                {/* Header */}
                <div className="bg-slate-950 p-6 text-center border-b border-white/5">
                    <h2 className="text-2xl font-black text-white tracking-tight uppercase">
                        {loading ? 'Cargando Ticket...' : '¡Raspadito Ray!'}
                    </h2>
                    <p className="text-amber-500 text-xs font-bold tracking-widest mt-1">PEDIDO #{orderId.slice(0, 6)}</p>
                </div>

                {/* Game Area */}
                <div className="p-6 relative min-h-[300px] flex items-center justify-center">

                    {loading ? (
                        <div className="flex flex-col items-center gap-4 text-slate-500">
                            <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
                            <span className="text-xs font-mono">Preparando tu suerte...</span>
                        </div>
                    ) : error ? (
                        <div className="text-center text-red-400 p-4 bg-red-900/10 rounded-xl border border-red-500/20">
                            <Frown className="w-10 h-10 mx-auto mb-2 opacity-50" />
                            <p className="text-sm font-bold">{error}</p>
                            <button onClick={handleClose} className="mt-4 text-xs underline">Cerrar</button>
                        </div>
                    ) : (
                        <div
                            ref={containerRef}
                            className="relative w-full h-64 rounded-2xl overflow-hidden shadow-inner bg-slate-950 ring-4 ring-slate-800"
                        >
                            {/* PREMIO REVELADO (Fondo) */}
                            <div className={`absolute inset-0 flex flex-col items-center justify-center p-4 transition-all duration-700 ${isRevealed ? 'scale-100 opacity-100' : 'scale-90 opacity-0'}`}>

                                <div className={`w-24 h-24 ${Visual.bg} rounded-full flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(0,0,0,0.5)] animate-bounce`}>
                                    <Visual.icon className={`w-12 h-12 ${Visual.color} stroke-[2px]`} />
                                </div>

                                <h3 className={`text-2xl font-black text-center leading-none mb-3 text-white drop-shadow-md`}>
                                    {prizeData.title}
                                </h3>

                                {prizeData.icon !== 'sad' && (
                                    <div className="bg-white/10 px-4 py-1.5 rounded-full border border-white/10">
                                        <code className="text-sm font-mono text-amber-300 tracking-widest selection:bg-amber-500/30">
                                            {prizeData.code}
                                        </code>
                                    </div>
                                )}
                            </div>

                            {/* CAPA DE RASPADO (Canvas) - Siempre presente hasta que se rebele visualmente */}
                            <canvas
                                ref={canvasRef}
                                className={`absolute inset-0 z-10 touch-none cursor-crosshair transition-opacity duration-1000 ${isRevealed ? 'pointer-events-none opacity-0' : 'opacity-100'}`}
                                onMouseDown={handleMouseDown}
                                onMouseMove={handleMouseMove}
                                onMouseUp={handleMouseUp}
                                onMouseLeave={handleMouseUp}
                                onTouchStart={handleTouchStart}
                                onTouchMove={handleTouchMove}
                                onTouchEnd={handleMouseUp}
                            />

                            {/* Hint */}
                            {!isRevealed && !isScratching && (
                                <div className="absolute inset-x-0 bottom-4 text-center pointer-events-none animate-bounce">
                                    <span className="text-amber-900/50 font-black text-lg uppercase tracking-widest drop-shadow-sm">
                                        👆 Raspa Aquí
                                    </span>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 pt-0">
                    {/* INSTRUCCIONES PARA RECLAMAR */}
                    {isRevealed && prizeData?.icon !== 'sad' && !isGuest && (
                        <div className="mb-4 p-3 bg-amber-900/20 border border-amber-500/20 rounded-lg text-center">
                            <p className="text-xs text-amber-200 font-medium">
                                📢 Muestra esta pantalla al cajero para reclamar tu premio.
                            </p>
                        </div>
                    )}

                    <button
                        onClick={handleClose}
                        disabled={!isRevealed && !error}
                        className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all duration-300 ${(isRevealed || error)
                            ? 'bg-amber-500 hover:bg-amber-400 text-slate-900 shadow-[0_0_20px_rgba(245,158,11,0.4)] scale-100'
                            : 'bg-slate-800 text-slate-600 cursor-not-allowed grayscale'
                            }`}
                    >
                        {isGuest && isRevealed
                            ? '🎉 ¡REGÍSTRATE PARA RECLAMAR!'
                            : (prizeData?.icon === 'sad' ? 'MEJOR SUERTE LA PRÓXIMA' : 'GUARDAR Y CONTINUAR')
                        }
                    </button>
                    {isGuest && isRevealed && (
                        <p className="text-center text-xs text-slate-500 mt-3">
                            Debes crear una cuenta para guardar este premio en tu Wallet.
                        </p>
                    )}
                </div>

            </div>
        </div>
    )
}
