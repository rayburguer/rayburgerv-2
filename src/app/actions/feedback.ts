'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

interface FeedbackData {
    orderId: string
    sabor: number
    atencion: number
    tiempo: number
    empaque: number
    comment: string
}

export async function submitFeedback(data: FeedbackData) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { success: false, error: 'Usuario no autenticado' }
    }

    try {
        const { error } = await supabase
            .from('order_feedback')
            .insert({
                order_id: data.orderId,
                user_id: user.id,
                rating_sabor: data.sabor,
                rating_atencion: data.atencion,
                rating_tiempo: data.tiempo,
                rating_empaque: data.empaque,
                comment: data.comment
            })

        if (error) {
            console.error('Error submitting feedback:', error)
            return { success: false, error: error.message }
        }

        revalidatePath('/profile') // Refresh order list to hide button
        return { success: true }
    } catch (err: any) {
        return { success: false, error: err.message }
    }
}
