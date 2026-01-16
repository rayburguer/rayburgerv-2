import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { LayoutDashboard, ShoppingBag, LogOut, Users, Settings } from 'lucide-react'

// ID del Administrador (Hardcoded por seguridad inmediata)
const ADMIN_ID = '1738e367-3afd-4b39-afc2-be95875e1ce8'

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    // 1. Si no hay usuario, login
    if (!user) {
        redirect('/login')
    }

    // 2. Si hay usuario pero NO es el admin, al menú
    if (user.id !== ADMIN_ID) {
        redirect('/menu')
    }

    // 3. Si coincide, renderiza el panel
    return (
        <div className="min-h-screen bg-slate-950 flex font-sans text-slate-300">
            {/* BARRA LATERAL FIJA */}
            <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col fixed h-full z-10">
                <div className="p-6 border-b border-slate-800">
                    <h1 className="text-xl font-bold text-white">
                        RayBurger <span className="text-amber-500">Admin</span>
                    </h1>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    <Link href="/admin" className="flex items-center gap-3 px-4 py-3 bg-slate-800 text-white rounded-xl">
                        <ShoppingBag className="w-5 h-5 text-amber-500" />
                        <span className="font-medium">Pedidos</span>
                    </Link>
                    <Link href="/admin/users" className="flex items-center gap-3 px-4 py-3 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl transition-colors">
                        <Users className="w-5 h-5" />
                        <span className="font-medium">Usuarios V3</span>
                    </Link>
                    <Link href="/admin/products" className="flex items-center gap-3 px-4 py-3 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl transition-colors">
                        <Settings className="w-5 h-5" />
                        <span className="font-medium">Config & Menú</span>
                    </Link>
                    <Link href="/menu" className="flex items-center gap-3 px-4 py-3 hover:bg-slate-800 rounded-xl transition-colors">
                        <LayoutDashboard className="w-5 h-5" />
                        <span className="font-medium">Ir a la App (Cliente)</span>
                    </Link>
                </nav>

                <div className="p-4 border-t border-slate-800">
                    {/* Botón de Salida simple */}
                    <form action="/auth/signout" method="post">
                        <button className="flex items-center gap-3 px-4 py-3 w-full hover:bg-red-900/20 hover:text-red-400 rounded-xl transition-colors">
                            <LogOut className="w-5 h-5" />
                            <span>Salir</span>
                        </button>
                    </form>
                </div>
            </aside>

            {/* ZONA DE CONTENIDO (Aquí se pintará tu tabla) */}
            <main className="flex-1 ml-64 p-8">
                {children}
            </main>
        </div>
    )
}