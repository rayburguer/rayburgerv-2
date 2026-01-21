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
                className={`fixed bottom-24 right-4 md:bottom-8 md:right-8 z-50 w-14 h-14 md:w-20 md:h-20 bg-amber-500 rounded-full shadow-lg pop-shadow-strong flex items-center justify-center text-slate-900 hover:scale-110 active:scale-95 transition-all duration-300 border-2 border-slate-900 ${totalItems === 0 ? 'hidden md:flex' : 'flex'}`}
                aria-label="Ver Carrito"
            >
                <ShoppingBag className="w-7 h-7 md:w-9 md:h-9" />

                {/* Badge */}
                {totalItems > 0 && (
                    <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center border-2 border-slate-900">
                        {totalItems}
                    </div>
                )}
            </button>

            {/* Drawer */}
            <CartDrawer isOpen={isOpen} onClose={() => setIsOpen(false)} />
        </>
    )
}
