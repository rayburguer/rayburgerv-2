'use client'

import Link from 'next/link'
import { LayoutDashboard, ShoppingBag, Users, Megaphone, Utensils, TrendingUp, Bell, ChevronRight, Activity } from 'lucide-react'

interface AdminDashboardProps {
    userName: string
    salesToday: number
    pendingOrdersCount: number
    recentActivity: any[]
}

export default function AdminDashboard({ userName, salesToday, pendingOrdersCount, recentActivity }: AdminDashboardProps) {
    return (
        <div className="min-h-screen bg-slate-950 font-sans selection:bg-indigo-500/30 pb-24">

            {/* 1. Header Premium */}
            <div className="pt-8 px-6 mb-6 flex items-center justify-between">
                <div>
                    <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">Panel de Control</p>
                    <h1 className="text-2xl font-bold text-white leading-none">
                        Hola, <span className="text-transparent bg-clip-text bg-linear-to-r from-indigo-400 to-purple-400">{userName}</span>
                    </h1>
                </div>
                <div className="w-10 h-10 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center relative shadow-lg">
                    {/* Admin Avatar */}
                    <div className="w-9 h-9 rounded-full bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs">
                        AD
                    </div>
                    {/* Status Dot */}
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-slate-900 rounded-full"></span>
                </div>
            </div>

            <div className="px-5 space-y-6">

                {/* 2. Main KPI Card (Glassmorphism) */}
                <div className="relative w-full group">
                    {/* Glow Effect */}
                    <div className="absolute -inset-1 bg-linear-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-3xl blur opacity-25 group-hover:opacity-40 transition duration-1000"></div>

                    <div className="relative bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl overflow-hidden">
                        {/* Background Decoration */}
                        <div className="absolute top-0 right-0 p-4 opacity-50">
                            <TrendingUp className="w-24 h-24 text-indigo-500/10 transform rotate-12 -translate-y-4 translate-x-4" />
                        </div>

                        <div className="relative z-10">
                            <div className="flex justify-between items-start mb-2">
                                <span className="text-slate-400 text-sm font-medium flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                                    Ventas de Hoy
                                </span>
                                <span className="bg-green-500/10 text-green-400 text-xs font-bold px-2 py-1 rounded-full border border-green-500/20 flex items-center gap-1">
                                    <TrendingUp className="w-3 h-3" /> +15%
                                </span>
                            </div>

                            <h2 className="text-4xl font-black text-white tracking-tight mb-1">
                                ${salesToday.toFixed(2)}
                            </h2>
                            <p className="text-indigo-300/60 text-xs font-mono">Actualizado en tiempo real</p>
                        </div>
                    </div>
                </div>

                {/* 3. Quick Actions Grid */}
                <div>
                    <h3 className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-4 px-1">Accesos Rápidos</h3>
                    <div className="grid grid-cols-2 gap-3">

                        {/* Menu Manager */}
                        <Link href="/admin/products" className="group bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/50 p-4 rounded-2xl flex flex-col items-center justify-center gap-3 transition-all shadow-lg hover:shadow-amber-500/10 active:scale-95">
                            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center group-hover:scale-110 transition-transform shadow-[0_0_15px_-5px_orange]">
                                <Utensils className="w-6 h-6" />
                            </div>
                            <span className="text-sm font-bold text-slate-200 group-hover:text-white">Editar Menú</span>
                        </Link>

                        {/* Orders Manager */}
                        <Link href="/admin/orders" className="relative group bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-orange-500/50 p-4 rounded-2xl flex flex-col items-center justify-center gap-3 transition-all shadow-lg hover:shadow-orange-500/10 active:scale-95">
                            {pendingOrdersCount > 0 && (
                                <span className="absolute top-2 right-2 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-lg border border-slate-900 animate-pulse z-10">
                                    {pendingOrdersCount} Nuevos
                                </span>
                            )}
                            <div className="w-12 h-12 rounded-2xl bg-orange-500/10 text-orange-500 flex items-center justify-center group-hover:scale-110 transition-transform shadow-[0_0_15px_-5px_orangered]">
                                <ShoppingBag className="w-6 h-6" />
                            </div>
                            <span className="text-sm font-bold text-slate-200 group-hover:text-white">Pedidos</span>
                        </Link>

                        {/* Users / CRM */}
                        <Link href="/admin/users" className="group bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-blue-500/50 p-4 rounded-2xl flex flex-col items-center justify-center gap-3 transition-all shadow-lg hover:shadow-blue-500/10 active:scale-95">
                            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center group-hover:scale-110 transition-transform shadow-[0_0_15px_-5px_dodgerblue]">
                                <Users className="w-6 h-6" />
                            </div>
                            <span className="text-sm font-bold text-slate-200 group-hover:text-white">Usuarios</span>
                        </Link>

                        {/* Marketing */}
                        <Link href="/admin/marketing" className="group bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-purple-500/50 p-4 rounded-2xl flex flex-col items-center justify-center gap-3 transition-all shadow-lg hover:shadow-purple-500/10 active:scale-95">
                            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-500 flex items-center justify-center group-hover:scale-110 transition-transform shadow-[0_0_15px_-5px_purple]">
                                <Megaphone className="w-6 h-6" />
                            </div>
                            <span className="text-sm font-bold text-slate-200 group-hover:text-white">Marketing</span>
                        </Link>

                    </div>
                </div>

                {/* 4. Recent Activity Feed */}
                <div>
                    <h3 className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-4 px-1 mt-4">Actividad Reciente</h3>
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-1 divide-y divide-slate-800/50">
                        {recentActivity.map((activity, i) => (
                            <div key={i} className="p-3 flex gap-3 hover:bg-slate-800/50 rounded-xl transition-colors">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border border-white/5 ${activity.type === 'order' ? 'bg-orange-500/10 text-orange-500' :
                                        activity.type === 'user' ? 'bg-blue-500/10 text-blue-500' :
                                            'bg-slate-700/50 text-slate-400'
                                    }`}>
                                    <Activity className="w-4 h-4" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm text-slate-300 truncate font-medium">{activity.text}</p>
                                    <p className="text-xs text-slate-500">{activity.time}</p>
                                </div>
                            </div>
                        ))}
                        {recentActivity.length === 0 && (
                            <div className="p-4 text-center text-slate-500 text-xs">Sin actividad reciente</div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    )
}
