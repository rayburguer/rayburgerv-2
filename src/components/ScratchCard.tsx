'use client'

import React, { useRef, useEffect, useState } from 'react'
import { Trophy, Star, Sparkles } from 'lucide-react'
import confetti from 'canvas-confetti'

interface ScratchCardProps {
    onComplete?: () => void
    prize?: string
}

export default function ScratchCard({ onComplete, prize = "¡3% Cashback Extra!" }: ScratchCardProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const containerRef = useRef<HTMLDivElement>(null)
    const [isRevealed, setIsRevealed] = useState(false)
    const [isScratching, setIsScratching] = useState(false)

    useEffect(() => {
        const canvas = canvasRef.current
        const container = containerRef.current
        if (!canvas || !container) return

        const ctx = canvas.getContext('2d')
        if (!ctx) return

        // Set canvas size to match container
        const rect = container.getBoundingClientRect()
        canvas.width = rect.width
        canvas.height = rect.height

        // Draw scratch layer
        // Gradient Gold/Silver
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
        gradient.addColorStop(0, '#B45309') // Dark Gold
        gradient.addColorStop(0.5, '#FCD34D') // Light Gold
        gradient.addColorStop(1, '#B45309') // Dark Gold

        ctx.fillStyle = gradient
        ctx.fillRect(0, 0, canvas.width, canvas.height)

        // Add Pattern/Text
        ctx.fillStyle = '#78350F'
        ctx.font = 'bold 20px sans-serif'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText('¡RASPA AQUÍ!', canvas.width / 2, canvas.height / 2)

        // Pattern circles
        for (let i = 0; i < 50; i++) {
            ctx.beginPath()
            ctx.arc(
                Math.random() * canvas.width,
                Math.random() * canvas.height,
                Math.random() * 5,
                0,
                Math.PI * 2
            )
            ctx.fillStyle = 'rgba(255,255,255,0.2)'
            ctx.fill()
        }

    }, [])

    const scratch = (x: number, y: number) => {
        const canvas = canvasRef.current
        if (!canvas || isRevealed) return

        const ctx = canvas.getContext('2d')
        if (!ctx) return

        const rect = canvas.getBoundingClientRect()
        const mouseX = x - rect.left
        const mouseY = y - rect.top

        // Erase functionality
        ctx.globalCompositeOperation = 'destination-out'
        ctx.beginPath()
        ctx.arc(mouseX, mouseY, 25, 0, Math.PI * 2)
        ctx.fill()

        checkReveal()
    }

    const checkReveal = () => {
        const canvas = canvasRef.current
        if (!canvas) return

        const ctx = canvas.getContext('2d')
        if (!ctx) return

        // Calculate transparent pixels
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        const pixels = imageData.data
        let transparent = 0

        for (let i = 3; i < pixels.length; i += 4) {
            if (pixels[i] === 0) transparent++
        }

        const percentage = (transparent / (pixels.length / 4)) * 100

        if (percentage > 40 && !isRevealed) {
            setIsRevealed(true)
            canvas.style.opacity = '0' // Fade out rest
            triggerWin()
        }
    }

    const triggerWin = () => {
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#FCD34D', '#F59E0B', '#FFFFFF']
        })
        if (onComplete) onComplete()
    }

    // Event Handlers
    const handleMouseDown = (e: React.MouseEvent) => { setIsScratching(true); scratch(e.clientX, e.clientY) }
    const handleMouseMove = (e: React.MouseEvent) => { if (isScratching) scratch(e.clientX, e.clientY) }
    const handleMouseUp = () => setIsScratching(false)

    const handleTouchStart = (e: React.TouchEvent) => { setIsScratching(true); scratch(e.touches[0].clientX, e.touches[0].clientY) }
    const handleTouchMove = (e: React.TouchEvent) => { if (isScratching) scratch(e.touches[0].clientX, e.touches[0].clientY) }
    const handleTouchEnd = () => setIsScratching(false)

    return (
        <div ref={containerRef} className="relative w-full h-48 rounded-xl overflow-hidden shadow-xl select-none group">

            {/* Prize Layer (Underneath) */}
            <div className={`absolute inset-0 bg-slate-800 flex flex-col items-center justify-center p-4 transition-all duration-500 ${isRevealed ? 'scale-110' : 'scale-100'}`}>
                <div className="w-16 h-16 bg-linear-to-br from-amber-400 to-orange-600 rounded-full flex items-center justify-center mb-2 shadow-lg animate-bounce">
                    <Trophy className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-white font-bold text-xl text-center">{prize}</h3>
                <p className="text-amber-400 text-xs font-bold uppercase tracking-widest mt-1">¡Premio Desbloqueado!</p>
                <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
            </div>

            {/* Scratch Layer (Canvas) */}
            <canvas
                ref={canvasRef}
                className={`absolute inset-0 z-20 cursor-crosshair transition-opacity duration-700 ${isRevealed ? 'pointer-events-none' : ''}`}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
            />

            {/* Helper Text Overlay (Before Scratching) */}
            {!isScratching && !isRevealed && (
                <div className="absolute bottom-2 left-0 right-0 text-center pointer-events-none animate-pulse">
                    <span className="bg-black/30 text-white/90 text-[10px] px-2 py-1 rounded-full backdrop-blur-sm">
                        Desliza el dedo para raspar
                    </span>
                </div>
            )}
        </div>
    )
}
