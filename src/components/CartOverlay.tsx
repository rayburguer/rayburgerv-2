'use client'

import { useState, useEffect } from 'react'
import { ShoppingBag } from 'lucide-react'
import { useCartStore } from '@/store/cart'
import CartDrawer from '@/components/CartDrawer'

export default function CartOverlay() {
    const [isOpen, setIsOpen] = useState(false)
    const totalItems = useCartStore((state) => state.totalItems)
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) return null

    return (
        <>
            {/* Floating Action Button (FAB) */}
            {/* Floating Action Button (FAB) */}
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 z-30 w-16 h-16 md:w-20 md:h-20 bg-linear-to-tr from-yellow-400 via-orange-500 to-red-600 rounded-full shadow-[0_10px_40px_-10px_rgba(249,115,22,0.6)] flex items-center justify-center text-white hover:scale-110 active:scale-95 transition-all duration-300 group border-4 border-slate-900/50"
                aria-label="Ver Carrito"
            >
                <div className="absolute inset-0 bg-white/20 rounded-full opacity-0 hover:opacity-100 transition-opacity"></div>
                <ShoppingBag className="w-8 h-8 md:w-10 md:h-10 drop-shadow-xl relative z-10" />

                {/* Badge */}
                {totalItems > 0 && (
                    <div className="absolute -top-1 -right-1 bg-white text-red-600 text-xs md:text-sm font-black w-7 h-7 rounded-full flex items-center justify-center border-2 border-red-600 shadow-lg animate-bounce z-20">
                        {totalItems}
                    </div>
                )}
            </button>

            {/* Drawer */}
            <CartDrawer isOpen={isOpen} onClose={() => setIsOpen(false)} />
        </>
    )
}
