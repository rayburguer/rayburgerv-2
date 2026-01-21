'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function login(formData: FormData) {
    const supabase = await createClient()

    const phone = formData.get('phone') as string
    const password = formData.get('password') as string

    // Masquerading: Convert phone to fake email
    const email = `${phone.replace(/\D/g, '')}@rayburger.local`

    const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
    })

    if (error) {
        return { error: error.message }
    }

    const redirectTo = formData.get('redirectTo') as string || '/menu'

    // Validate redirect to prevent open redirect vulnerabilities (basic check)
    const validRedirect = redirectTo.startsWith('/') ? redirectTo : '/menu'

    revalidatePath('/', 'layout')
    redirect(validRedirect)
}

export async function signup(formData: FormData) {
    const supabase = await createClient()

    const phone = formData.get('phone') as string
    const password = formData.get('password') as string
    const fullName = formData.get('fullName') as string
    const referrerPhone = formData.get('referrerPhone') as string || null
    const redirectTo = formData.get('redirectTo') as string || '/menu'

    // Masquerading: Convert phone to fake email
    const email = `${phone.replace(/\D/g, '')}@rayburger.local`

    const { data: authData, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                full_name: fullName,
                phone: phone, // Guardamos el teléfono original también en metadata por si acaso
            },
        },
    })

    if (error) {
        return { error: error.message }
    }

    // Lógica de Referidos (Matrimonio)
    if (referrerPhone && authData.user) {
        // Llamada RPC segura para vincular por teléfono
        await supabase.rpc('link_referral_by_phone', {
            new_user_id: authData.user.id,
            referrer_input_phone: referrerPhone
        })
    }

    const validRedirect = redirectTo.startsWith('/') ? redirectTo : '/menu'
    revalidatePath('/', 'layout')
    redirect(validRedirect)
}
