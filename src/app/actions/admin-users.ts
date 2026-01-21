'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

// ID del Administrador (Hardcoded por seguridad o validar rol en DB)
const ADMIN_ID = '1738e367-3afd-4b39-afc2-be95875e1ce8'

export async function updateUserBalance(userId: string, amount: number, reason: string) {
    const supabase = await createClient()

    // 1. Validar que quien llama sea Admin
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || user.id !== ADMIN_ID) {
        return { success: false, error: 'Acceso Denegado: Solo administradores.' }
    }

    if (!userId || amount === 0) {
        return { success: false, error: 'Datos inválidos.' }
    }

    try {
        // 2. Obtener saldo actual
        const { data: profile, error: fetchError } = await supabase
            .from('profiles')
            .select('wallet_balance')
            .eq('id', userId)
            .single()

        if (fetchError || !profile) {
            return { success: false, error: 'Usuario no encontrado.' }
        }

        const currentBalance = Number(profile.wallet_balance || 0)
        const newBalance = currentBalance + amount

        if (newBalance < 0) {
            return { success: false, error: 'El saldo no puede ser negativo.' }
        }

        // 3. Actualizar Saldo
        const { error: updateError } = await supabase
            .from('profiles')
            .update({ wallet_balance: newBalance })
            .eq('id', userId)

        if (updateError) throw updateError

        // TODO: Opcional - Registrar en una tabla 'transactions' si existiera
        // await logTransaction(...)

        console.log(`✅ Saldo actualizado para ${userId}: ${currentBalance} -> ${newBalance} (Razón: ${reason})`)

        revalidatePath('/admin/users')
        return { success: true, newBalance }

    } catch (error: any) {
        console.error('Error updating balance:', error)
        return { success: false, error: error.message }
    }
}
