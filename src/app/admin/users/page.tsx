import { createClient } from '@/utils/supabase/server'
import AdminUsersClient from './AdminUsersClient'

export default async function AdminUsersPage() {
    const supabase = await createClient()

    // Query optimizada para Users V3
    const { data: users, error } = await supabase
        .from('profiles')
        .select('id, full_name, email, phone, user_level, wallet_balance, total_spent')
        .order('total_spent', { ascending: false })

    if (error) {
        return <div className="text-red-500 p-8">Error cargando usuarios: {error.message}</div>
    }

    return (
        <AdminUsersClient users={users || []} />
    )
}

