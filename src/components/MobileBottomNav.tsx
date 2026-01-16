'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Store, UserCircle, ShoppingBag } from 'lucide-react'

export default function MobileBottomNav() {
    const pathname = usePathname()

    // Hide on login/register pages
    if (pathname === '/login' || pathname === '/register') return null

    const navItems = [
        { name: 'Menú', href: '/menu', icon: Store },
        // { name: 'Ordenes', href: '/orders', icon: ShoppingBag }, // Future?
        { name: 'Perfil', href: '/profile', icon: UserCircle },
    ]

    return (
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 z-50 pb-safe">
            <div className="flex justify-around items-center h-16">
                {navItems.map((item) => {
                    const isActive = pathname === item.href
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${isActive ? 'text-amber-500' : 'text-slate-500 hover:text-slate-300'
                                }`}
                        >
                            <div className={`p-1 rounded-full transition-all ${isActive ? 'bg-amber-500/10' : ''}`}>
                                <item.icon className={`w-6 h-6 ${isActive ? 'fill-current' : ''}`} />
                            </div>
                            <span className="text-[10px] font-medium tracking-wide">{item.name}</span>
                        </Link>
                    )
                })}
            </div>
        </div>
    )
}
