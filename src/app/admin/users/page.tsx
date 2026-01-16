import { createClient } from '@/utils/supabase/server'
import { Trophy, Wallet, Phone, DollarSign, Award } from 'lucide-react'

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
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold text-white mb-2">Comunidad RayBurger</h2>
                    <p className="text-slate-400">Gestión de lealtad y usuarios V3</p>
                </div>
                <div className="bg-amber-500/10 border border-amber-500/20 px-6 py-3 rounded-2xl flex flex-col items-center">
                    <span className="text-2xl font-bold text-amber-500">{users?.length || 0}</span>
                    <span className="text-xs text-amber-200/60 uppercase font-bold tracking-wider">Miembros</span>
                </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-950/50 border-b border-slate-800 text-slate-400 text-xs uppercase tracking-wider">
                                <th className="p-5 font-bold">Usuario</th>
                                <th className="p-5 font-bold">Código Referido</th>
                                <th className="p-5 font-bold text-center">Nivel</th>
                                <th className="p-5 font-bold text-right">Saldo Favor</th>
                                <th className="p-5 font-bold text-right">Total Gastado</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                            {users?.map((user) => (
                                <tr key={user.id} className="hover:bg-slate-800/50 transition-colors group">
                                    <td className="p-5">
                                        <div className="flex flex-col">
                                            <span className="text-white font-bold">{user.full_name || 'Sin Nombre'}</span>
                                            <span className="text-slate-500 text-xs">{user.email}</span>
                                        </div>
                                    </td>

                                    <td className="p-5">
                                        <div className="flex items-center gap-2 text-slate-300 font-mono bg-slate-950 px-3 py-1.5 rounded-lg w-fit border border-slate-800 group-hover:border-slate-700 transition-colors">
                                            <Phone className="w-3 h-3 text-slate-500" />
                                            {user.phone || 'N/A'}
                                        </div>
                                    </td>

                                    <td className="p-5 text-center">
                                        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${user.user_level === 'Oro' ? 'bg-amber-400/10 text-amber-400 border-amber-400/20' :
                                                user.user_level === 'Plata' ? 'bg-slate-300/10 text-slate-300 border-slate-300/20' :
                                                    'bg-orange-700/10 text-orange-700 border-orange-700/20'
                                            }`}>
                                            <Trophy className="w-3 h-3" />
                                            {user.user_level || 'Bronce'}
                                        </div>
                                    </td>

                                    <td className="p-5 text-right">
                                        <div className="flex items-center justify-end gap-1 font-mono text-green-400 font-bold">
                                            <Wallet className="w-3 h-3" />
                                            ${Number(user.wallet_balance || 0).toFixed(2)}
                                        </div>
                                    </td>

                                    <td className="p-5 text-right">
                                        <div className="flex items-center justify-end gap-1 font-mono text-slate-300 font-medium">
                                            <DollarSign className="w-3 h-3 text-slate-500" />
                                            <span className="text-white">{Number(user.total_spent || 0).toFixed(2)}</span>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
