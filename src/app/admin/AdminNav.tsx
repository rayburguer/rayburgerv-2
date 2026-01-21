'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, ShoppingBag, LogOut, Users, Settings } from 'lucide-react'

export default function AdminNav() {
    const pathname = usePathname()

    const navItems = [
        { name: 'Pedidos', href: '/admin', icon: ShoppingBag },
        { name: 'Usuarios V3', href: '/admin/users', icon: Users },
        { name: 'Config & Menú', href: '/admin/products', icon: Settings },
    ]

    const isLinkActive = (href: string) => {
        // Lógica de Estado Activo
        if (href === '/admin') {
            // "Pedidos" activa en raíz o subrutas de orders
            return pathname === '/admin' || pathname.startsWith('/admin/orders')
        }
        // Otras rutas: coincidencia por prefijo
        return pathname.startsWith(href)
    }

    return (
        <>
            {/* SIDEBAR ESCRITORIO */}
            <aside className="hidden md:flex w-64 bg-slate-900 border-r border-slate-800 flex-col md:fixed h-full z-10">
                <div className="p-6 border-b border-slate-800">
                    <h1 className="text-xl font-bold text-white">
                        RayBurger <span className="text-amber-500">Admin</span>
                    </h1>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    {navItems.map((item) => {
                        const active = isLinkActive(item.href)
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${active
                                        ? 'bg-slate-800 text-amber-500'
                                        : 'hover:bg-slate-800 text-slate-400 hover:text-white'
                                    }`}
                            >
                                <item.icon className={`w-5 h-5 ${active ? 'text-amber-500' : ''}`} />
                                <span className={`font-medium ${active ? 'text-amber-500' : ''}`}>{item.name}</span>
                            </Link>
                        )
                    })}

                    <Link href="/menu" className="flex items-center gap-3 px-4 py-3 hover:bg-slate-800 rounded-xl transition-colors text-slate-400 hover:text-white">
                        <LayoutDashboard className="w-5 h-5" />
                        <span className="font-medium">Ir a la App (Cliente)</span>
                    </Link>
                </nav>

                <div className="p-4 border-t border-slate-800">
                    <form action="/auth/signout" method="post">
                        <button className="flex items-center gap-3 px-4 py-3 w-full hover:bg-red-900/20 hover:text-red-400 rounded-xl transition-colors text-slate-400">
                            <LogOut className="w-5 h-5" />
                            <span>Salir</span>
                        </button>
                    </form>
                </div>
            </aside>

            {/* BOTTOM NAV MÓVIL */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 flex justify-around p-3 z-50 pb-safe">
                {navItems.map((item) => {
                    const active = isLinkActive(item.href)
                    return (
                        <Link key={item.href} href={item.href} className={`flex flex-col items-center ${active ? 'text-amber-500' : 'text-slate-400'}`}>
                            <item.icon className="w-6 h-6" />
                            <span className="text-[10px] mt-1">{item.name}</span>
                        </Link>
                    )
                })}
                <Link href="/menu" className="flex flex-col items-center text-slate-400">
                    <LayoutDashboard className="w-6 h-6" />
                    <span className="text-[10px] mt-1">Ver App</span>
                </Link>
            </div>
        </>
    )
}
