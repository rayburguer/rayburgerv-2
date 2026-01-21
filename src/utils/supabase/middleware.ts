import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) =>
                        request.cookies.set(name, value)
                    )
                    supabaseResponse = NextResponse.next({
                        request,
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    // ACTUALIZACIÓN DE SESIÓN
    // Es importante llamar a getUser para asegurar que el token se refresque
    const {
        data: { user },
    } = await supabase.auth.getUser()

    // PROTECCIÓN DE RUTAS (STRICT ADMIN)
    if (request.nextUrl.pathname.startsWith('/admin')) {
        // 1. Verificar Login
        if (!user) {
            const url = request.nextUrl.clone()
            url.pathname = '/login'
            return NextResponse.redirect(url)
        }

        // 2. Verificar Rol Admin en DB
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single()

        if (profileError || profile?.role !== 'admin') {
            // Log de seguridad (Advertencia)
            console.warn(`⛔ Intento de acceso no autorizado a /admin: ${user.email} (Rol detectado: ${profile?.role || 'None'})`)

            const url = request.nextUrl.clone()
            url.pathname = '/login'
            url.searchParams.set('error', 'Acceso denegado: Área restringida.')
            return NextResponse.redirect(url)
        }
    }

    // DASHBOARD PROTECTION (Si existe ruta dashboard separada)
    if (!user && request.nextUrl.pathname.startsWith('/dashboard')) {
        const url = request.nextUrl.clone()
        url.pathname = '/login'
        return NextResponse.redirect(url)
    }

    return supabaseResponse
}
