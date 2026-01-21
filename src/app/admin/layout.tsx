import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import AdminNav from './AdminNav'
import AdminMobileNav from '@/components/admin/AdminMobileNav'

// ID del Administrador
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

    if (!user) {
        redirect('/login')
    }

    if (user.id !== ADMIN_ID) {
        redirect('/menu')
    }

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col md:flex-row font-sans text-slate-300 overflow-x-hidden">

            {/* NAVEGACIÓN (Cliente) */}
            <AdminNav />

            {/* ZONA DE CONTENIDO */}
            <main className="flex-1 ml-0 md:ml-64 p-4 md:p-8 w-full max-w-[100vw]">

                {/* Cabecera Móvil */}
                <div className="md:hidden mb-6 flex items-center justify-between">
                    <h1 className="text-lg font-bold text-white">
                        RayBurger <span className="text-amber-500">Admin</span>
                    </h1>
                </div>

                {children}
            </main>

            {/* Espaciador móvil (opcional, ya manejado por pb-24 en page.tsx pero lo dejamos por seguridad) */}
            <div className="md:hidden h-20 w-full"></div>
            {/* FIXED BOTTOM NAV (Móvil Only) */}
            <AdminMobileNav />

        </div>
    )
}