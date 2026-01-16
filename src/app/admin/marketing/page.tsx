'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Users, Copy, MessageCircle, Filter, Loader2, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface SegmentedUser {
    id: string
    name: string
    phone: string
    user_level: string
    puntos_actuales: number
}

export default function AdminMarketingPage() {
    const [loading, setLoading] = useState(false)
    const [users, setUsers] = useState<SegmentedUser[]>([])
    const [filterLevel, setFilterLevel] = useState('todos')
    const supabase = createClient()

    const fetchUsers = async () => {
        setLoading(true)
        const { data, error } = await supabase.rpc('get_segmented_users', {
            target_level: filterLevel
        })

        if (error) {
            alert('Error: ' + error.message)
        } else {
            console.log("Users fetched:", data)
            setUsers(data || [])
        }
        setLoading(false)
    }

    // Auto-fetch on filter change
    useEffect(() => {
        fetchUsers()
    }, [filterLevel])

    const copyNumbers = () => {
        const numbers = users.map(u => u.phone.replace(/\D/g, '')).join(',')
        navigator.clipboard.writeText(numbers)
        alert(`Copiados ${users.length} números al portapapeles.`)
    }

    return (
        <div className="min-h-screen bg-slate-950 p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link href="/admin" className="p-2 bg-slate-900 rounded-full text-slate-400 hover:text-white transition-colors border border-slate-800">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                        <MessageCircle className="w-6 h-6 text-purple-500" />
                        Marketing & CRM
                    </h1>
                    <p className="text-slate-400 text-sm">Gestiona y contacta a tu audiencia</p>
                </div>
            </div>

            {/* Filter Controls */}
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-purple-500/10 rounded-xl">
                        <Filter className="w-6 h-6 text-purple-500" />
                    </div>
                    <div>
                        <h3 className="text-white font-bold">Segmentación</h3>
                        <p className="text-slate-500 text-xs">Filtra por nivel de fidelidad</p>
                    </div>
                </div>

                <div className="flex gap-2">
                    {['Todos', 'Oro', 'Plata', 'Bronce'].map((level) => (
                        <button
                            key={level}
                            onClick={() => setFilterLevel(level.toLowerCase())}
                            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${filterLevel === level.toLowerCase()
                                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/20'
                                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
                                }`}
                        >
                            {level}
                        </button>
                    ))}
                </div>
            </div>

            {/* Results Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Stats Card */}
                <div className="lg:col-span-1 bg-linear-to-br from-slate-900 to-slate-950 border border-slate-800 rounded-2xl p-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-6 opacity-5">
                        <Users className="w-32 h-32 text-white" />
                    </div>

                    <h3 className="text-slate-400 text-sm font-bold uppercase tracking-widest mb-2">Audiencia Encontrada</h3>
                    <div className="flex items-baseline gap-2">
                        <span className="text-5xl font-bold text-white tracking-tight">
                            {loading ? '...' : users.length}
                        </span>
                        <span className="text-slate-500 font-bold">Clientes</span>
                    </div>

                    <p className="text-slate-500 text-xs mt-4">
                        Usuarios activos con número de teléfono verificado.
                    </p>

                    <button
                        onClick={copyNumbers}
                        disabled={users.length === 0 || loading}
                        className="w-full mt-6 bg-white text-slate-900 font-bold py-3 rounded-xl hover:bg-slate-200 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Copy className="w-4 h-4" />}
                        Copiar Lista Difusión
                    </button>
                </div>

                {/* User List Preview */}
                <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden flex flex-col max-h-[500px]">
                    <div className="p-4 border-b border-slate-800 bg-slate-950/50">
                        <h3 className="text-white font-bold text-sm">Vista Previa</h3>
                    </div>

                    <div className="overflow-y-auto flex-1 p-2 space-y-2">
                        {loading ? (
                            <div className="flex items-center justify-center h-40">
                                <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
                            </div>
                        ) : users.length === 0 ? (
                            <div className="text-center py-12 text-slate-500">
                                No se encontraron usuarios en este segmento.
                            </div>
                        ) : (
                            users.map((user) => (
                                <div key={user.id} className="flex items-center justify-between bg-slate-800/50 p-3 rounded-xl hover:bg-slate-800 transition-colors group">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${user.user_level === 'Oro' ? 'bg-yellow-500/20 text-yellow-500' :
                                                user.user_level === 'Plata' ? 'bg-slate-400/20 text-slate-300' :
                                                    'bg-amber-700/20 text-amber-600'
                                            }`}>
                                            {user.user_level?.[0] || 'B'}
                                        </div>
                                        <div>
                                            <p className="text-white text-sm font-medium">{user.name}</p>
                                            <p className="text-slate-500 text-xs font-mono">{user.phone}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <span className="text-slate-600 text-xs font-mono hidden md:block">
                                            {user.puntos_actuales} pts
                                        </span>
                                        <a
                                            href={`https://wa.me/${user.phone.replace(/\D/g, '')}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="p-2 bg-slate-700 text-green-500 rounded-lg hover:bg-green-500 hover:text-white transition-colors"
                                        >
                                            <MessageCircle className="w-4 h-4" />
                                        </a>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
