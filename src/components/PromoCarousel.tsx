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
        <div className="relative w-full aspect-21/9 md:aspect-3/1 overflow-hidden rounded-2xl shadow-2xl mb-8 group">
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

                    {/* Gradient Overlay */}
                    <div className={`absolute inset-0 bg-linear-to-r ${promo.color} opacity-80 mix-blend-multiply`} />
                    <div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-transparent" />

                    {/* Content */}
                    <div className="absolute inset-0 flex flex-col justify-center px-6 md:px-12 max-w-2xl">
                        <span className="inline-block py-1 px-3 rounded-full bg-white/20 text-white text-xs font-bold backdrop-blur-md mb-2 w-fit border border-white/10">
                            DESTACADO
                        </span>
                        <h2 className="text-3xl md:text-5xl font-black text-white mb-2 leading-tight drop-shadow-lg">
                            {promo.title}
                        </h2>
                        <p className="text-slate-200 text-sm md:text-lg mb-6 font-medium drop-shadow-md max-w-md">
                            {promo.subtitle}
                        </p>
                        <Link
                            href={promo.link}
                            className="w-fit bg-white text-slate-900 px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:scale-105 transition-transform shadow-lg active:scale-95"
                        >
                            {promo.action} <ChevronRight className="w-4 h-4" />
                        </Link>
                    </div>
                </div>
            ))}

            {/* Indicators */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
                {PROMOS.map((_, idx) => (
                    <button
                        key={idx}
                        onClick={() => setCurrent(idx)}
                        className={`w-2 h-2 rounded-full transition-all ${idx === current ? 'bg-white w-6' : 'bg-white/40 hover:bg-white/60'}`}
                    />
                ))}
            </div>
        </div>
    )
}
