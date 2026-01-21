'use client'

import { useState } from 'react'
import { Trophy, Wallet, Phone, DollarSign, PlusCircle, MinusCircle, Search, X, CheckCircle2, Loader2 } from 'lucide-react'
import { updateUserBalance } from '@/app/actions/admin-users'

interface AdminUsersClientProps {
    users: any[]
}

export default function AdminUsersClient({ users }: AdminUsersClientProps) {
    const [search, setSearch] = useState('')
    const [selectedUser, setSelectedUser] = useState<any>(null)
    const [amount, setAmount] = useState('')
    const [reason, setReason] = useState('')
    const [loading, setLoading] = useState(false)
    const [isModalOpen, setIsModalOpen] = useState(false)

    // Filter Logic
    const filteredUsers = users.filter(user =>
        (user.full_name?.toLowerCase() || '').includes(search.toLowerCase()) ||
        (user.email?.toLowerCase() || '').includes(search.toLowerCase()) ||
        (user.phone || '').includes(search)
    )

    const handleOpenModal = (user: any, action: 'add' | 'subtract') => {
        setSelectedUser({ ...user, action })
        setAmount('')
        setReason('')
        setIsModalOpen(true)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!selectedUser || !amount) return

        setLoading(true)
        const value = parseFloat(amount)
        const finalAmount = selectedUser.action === 'add' ? value : -value

        const res = await updateUserBalance(selectedUser.id, finalAmount, reason || 'Ajuste Manual Admin')

        if (res.success) {
            alert('Saldo actualizado correctamente')
            setIsModalOpen(false)
            // La revalidación automática del server action actualizará la data si esto fuera un server component puro,
            // pero como recibimos props, idealmente deberíamos recargar la ruta
            window.location.reload()
        } else {
            alert('Error: ' + res.error)
        }
        setLoading(false)
    }

    return (
        <div className="space-y-6 pb-24">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-white mb-1">Comunidad RayBurger</h2>
                    <p className="text-slate-400">Gestión de lealtad y usuarios V3</p>
                </div>

                <div className="flex gap-4 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input
                            type="text"
                            placeholder="Buscar usuario..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-4 py-3 text-sm text-white focus:border-amber-500 focus:outline-none"
                        />
                    </div>
                </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-950/50 border-b border-slate-800 text-slate-400 text-xs uppercase tracking-wider">
                                <th className="p-5 font-bold">Usuario</th>
                                <th className="p-5 font-bold">Contacto</th>
                                <th className="p-5 font-bold text-center">Nivel</th>
                                <th className="p-5 font-bold text-right">Saldo Favor</th>
                                <th className="p-5 font-bold text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                            {filteredUsers.map((user) => (
                                <tr key={user.id} className="hover:bg-slate-800/50 transition-colors group">
                                    <td className="p-5">
                                        <div className="flex flex-col">
                                            <span className="text-white font-bold">{user.full_name || 'Sin Nombre'}</span>
                                            <span className="text-slate-500 text-xs">{user.email}</span>
                                        </div>
                                    </td>

                                    <td className="p-5">
                                        <div className="flex items-center gap-2 text-slate-300 font-mono bg-slate-950 px-3 py-1.5 rounded-lg w-fit border border-slate-800">
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
                                        <div className="flex flex-col items-end">
                                            <div className="flex items-center gap-1 font-mono text-green-400 font-bold text-lg">
                                                <Wallet className="w-4 h-4" />
                                                ${Number(user.wallet_balance || 0).toFixed(2)}
                                            </div>
                                            <span className="text-xs text-slate-500">Gastado: ${Number(user.total_spent || 0).toFixed(2)}</span>
                                        </div>
                                    </td>

                                    <td className="p-5 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => handleOpenModal(user, 'add')}
                                                className="p-2 bg-green-500/10 text-green-500 hover:bg-green-500 hover:text-white rounded-lg transition-all"
                                                title="Añadir Saldo"
                                            >
                                                <PlusCircle className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={() => handleOpenModal(user, 'subtract')}
                                                className="p-2 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-lg transition-all"
                                                title="Quitar Saldo"
                                            >
                                                <MinusCircle className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {filteredUsers.length === 0 && (
                        <div className="p-8 text-center text-slate-500">
                            No se encontraron usuarios.
                        </div>
                    )}
                </div>
            </div>

            {/* MODAL GESTIÓN SALDO */}
            {isModalOpen && selectedUser && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setIsModalOpen(false)}>
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl relative animate-in zoom-in-95" onClick={e => e.stopPropagation()}>

                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                    <Wallet className={`w-6 h-6 ${selectedUser.action === 'add' ? 'text-green-500' : 'text-red-500'}`} />
                                    {selectedUser.action === 'add' ? 'Añadir Saldo' : 'Retirar Saldo'}
                                </h3>
                                <p className="text-slate-400 text-sm mt-1">
                                    Usuario: <span className="text-white font-bold">{selectedUser.full_name}</span>
                                </p>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-500 hover:text-white">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">Monto ($)</label>
                                <div className="relative">
                                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0.01"
                                        required
                                        value={amount}
                                        onChange={e => setAmount(e.target.value)}
                                        className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-white focus:border-amber-500 focus:outline-none font-mono text-lg"
                                        placeholder="0.00"
                                        autoFocus
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">Motivo (Opcional)</label>
                                <input
                                    type="text"
                                    value={reason}
                                    onChange={e => setReason(e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-amber-500 focus:outline-none text-sm"
                                    placeholder={selectedUser.action === 'add' ? "Ej. Recarga Manual, Bono compensación" : "Ej. Corrección, Canje manual"}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className={`w-full py-4 rounded-xl font-bold text-white shadow-lg transition-all flex items-center justify-center gap-2 mt-4 ${selectedUser.action === 'add'
                                        ? 'bg-green-600 hover:bg-green-500 shadow-green-900/20'
                                        : 'bg-red-600 hover:bg-red-500 shadow-red-900/20'
                                    }`}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Procesando...
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle2 className="w-5 h-5" />
                                        Confirmar {selectedUser.action === 'add' ? 'Recarga' : 'Retiro'}
                                    </>
                                )}
                            </button>
                        </form>

                    </div>
                </div>
            )}
        </div>
    )
}
