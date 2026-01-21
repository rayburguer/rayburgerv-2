'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { ChevronRight, Share2 } from 'lucide-react'
import Link from 'next/link'

const PROMOS = [
    {
        id: 1,
        title: '¡Nueva RayBurger Doble!',
        subtitle: 'Doble carne, doble sabor. Pruébala hoy.',
        image: '/banners/promo-burger.png',
        action: 'Pedir Ahora',
        link: '#menu-list', // Scroll to menu
        color: 'from-amber-600/90 to-amber-900/90'
    },
    {
        id: 2,
        title: 'Gana Dinero Invitando',
        subtitle: 'Recibe comisiones vitalicias por cada amigo.',
        image: '/banners/promo-referral-v2.png',
        action: 'Ver mi Link',
        link: '/profile',
        color: 'from-purple-600/90 to-blue-900/90'
    }
]

export default function PromoCarousel() {
    const [current, setCurrent] = useState(0)

    // Auto-play
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrent(prev => (prev + 1) % PROMOS.length)
        }, 5000)
        return () => clearInterval(timer)
    }, [])

    return (
        <div className="relative w-full h-[45vh] md:h-[50vh] overflow-hidden rounded-b-3xl md:rounded-3xl shadow-2xl mb-6 group">
            {PROMOS.map((promo, idx) => (
                <div
                    key={promo.id}
                    className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${idx === current ? 'opacity-100 z-10' : 'opacity-0 z-0'
                        }`}
                >
                    {/* Background Image */}
                    <Image
                        src={promo.image}
                        alt={promo.title}
                        fill
                        className="object-cover"
                        priority={idx === 0}
                    />

                    {/* Gradient Overlay (Cinematic Bottom Fade) */}
                    <div className="absolute inset-0 bg-linear-to-t from-slate-950 via-slate-950/60 to-transparent" />

                    {/* Content */}
                    <div className="absolute bottom-0 left-0 w-full p-8 md:p-12 flex flex-col items-start pb-16">
                        <span className="inline-block py-1 px-3 rounded-full bg-amber-500 text-slate-900 text-[10px] font-black tracking-widest uppercase mb-3 shadow-lg shadow-amber-500/20">
                            DESTACADO
                        </span>
                        <h2 className="text-4xl md:text-6xl font-black text-white mb-2 leading-none drop-shadow-xl tracking-tight">
                            {promo.title}
                        </h2>
                        <p className="text-slate-300 text-sm md:text-lg mb-6 font-medium max-w-md drop-shadow-md line-clamp-2">
                            {promo.subtitle}
                        </p>
                        <Link
                            href={promo.link}
                            className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-8 py-3 rounded-full font-bold flex items-center gap-2 hover:bg-amber-500 hover:text-slate-900 hover:border-amber-500 transition-all shadow-lg active:scale-95 group/btn"
                        >
                            {promo.action} <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                        </Link>
                    </div>
                </div>
            ))}

            {/* Indicators (Instagram Stories Style) */}
            <div className="absolute top-4 left-0 w-full px-4 flex gap-2 z-30">
                {PROMOS.map((_, idx) => (
                    <button
                        key={idx}
                        onClick={() => setCurrent(idx)}
                        className="h-1 flex-1 rounded-full overflow-hidden bg-white/20"
                    >
                        <div
                            className={`h-full bg-white transition-all duration-5000 ease-linear ${idx === current ? 'w-full' : 'w-0'}`}
                        />
                    </button>
                ))}
            </div>
        </div>
    )
}
