'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, ShoppingBag, UtensilsCrossed, Users } from 'lucide-react'

export default function AdminMobileNav() {
    const pathname = usePathname()

    const isActive = (path: string) => pathname === path

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-slate-950 border-t border-slate-800 flex justify-around p-3 pb-safe md:hidden shadow-[0_-5px_20px_rgba(0,0,0,0.5)]">

            {/* Resumen (Dashboard) */}
            <Link
                href="/admin"
                className={`flex flex-col items-center gap-1 transition-colors ${isActive('/admin') ? 'text-amber-500' : 'text-slate-500 hover:text-slate-300'
                    }`}
            >
                <div className={`p-1 rounded-lg ${isActive('/admin') ? 'bg-amber-500/10' : ''}`}>
                    <LayoutDashboard className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-bold">Resumen</span>
            </Link>

            {/* Pedidos */}
            <Link
                href="/admin" // Asumiendo que pedidos está en el home del admin o en /admin/orders si existiera
                className={`flex flex-col items-center gap-1 transition-colors ${isActive('/admin/orders') ? 'text-amber-500' : 'text-slate-500 hover:text-slate-300'
                    }`}
            >
                <div className="relative p-1 rounded-lg">
                    <ShoppingBag className="w-6 h-6" />
                    {/* Notification Dot */}
                    <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-slate-950 animate-pulse" />
                </div>
                <span className="text-[10px] font-bold">Pedidos</span>
            </Link>

            {/* Menú (Productos) */}
            <Link
                href="/admin/products"
                className={`flex flex-col items-center gap-1 transition-colors ${isActive('/admin/products') ? 'text-amber-500' : 'text-slate-500 hover:text-slate-300'
                    }`}
            >
                <div className={`p-1 rounded-lg ${isActive('/admin/products') ? 'bg-amber-500/10' : ''}`}>
                    <UtensilsCrossed className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-bold">Menú</span>
            </Link>

            {/* Usuarios */}
            <Link
                href="/admin/users"
                className={`flex flex-col items-center gap-1 transition-colors ${isActive('/admin/users') ? 'text-amber-500' : 'text-slate-500 hover:text-slate-300'
                    }`}
            >
                <div className={`p-1 rounded-lg ${isActive('/admin/users') ? 'bg-amber-500/10' : ''}`}>
                    <Users className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-bold">Usuarios</span>
            </Link>

        </div>
    )
}
