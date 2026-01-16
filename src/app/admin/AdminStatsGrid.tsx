import { DollarSign, Users, Award, TrendingUp } from 'lucide-react'

interface AdminStats {
    sales_today: number
    points_liability: number
    total_users: number
    active_orders: number
}

export default function AdminStatsGrid({ stats }: { stats: AdminStats | null }) {
    if (!stats) return null

    const cards = [
        {
            title: 'Ventas Hoy',
            value: `$${Number(stats.sales_today).toFixed(2)}`,
            sub: 'Caja del día',
            icon: DollarSign,
            bg: 'bg-green-400',
            text: 'text-green-950',
            rotate: 'rotate-1'
        },
        {
            title: 'En Cocina',
            value: stats.active_orders,
            sub: 'Pedidos activos',
            icon: TrendingUp,
            bg: 'bg-amber-400',
            text: 'text-amber-950',
            rotate: '-rotate-1'
        },
        {
            title: 'Clientes',
            value: Number(stats.total_users).toLocaleString(),
            sub: 'Registrados',
            icon: Users,
            bg: 'bg-blue-400',
            text: 'text-blue-950',
            rotate: 'rotate-1'
        },
        {
            title: 'Deuda Puntos',
            value: Number(stats.points_liability).toLocaleString(),
            sub: 'Pasivo acumulado',
            icon: Award,
            bg: 'bg-purple-400',
            text: 'text-purple-950',
            rotate: '-rotate-1'
        }
    ]

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-8">
            {cards.map((card, i) => {
                const Icon = card.icon
                return (
                    <div key={i} className={`
                        relative overflow-visible group hover:-translate-y-1 transition-transform cursor-default
                        border-[3px] border-white shadow-[5px_5px_0px_#000] rounded-2xl
                        ${card.bg} ${card.rotate}
                    `}>
                        {/* Icon Badge */}
                        <div className="absolute -top-3 -right-3 bg-white border-2 border-black p-2 rounded-full shadow-sm z-10 transform group-hover:scale-110 transition-transform">
                            <Icon className={`w-5 h-5 ${card.text}`} />
                        </div>

                        <div className="p-5 flex flex-col items-start h-full justify-between">
                            <span className={`text-xs font-black uppercase tracking-widest opacity-70 ${card.text}`}>
                                {card.title}
                            </span>

                            <span className={`text-3xl lg:text-4xl font-black mt-1 ${card.text} drop-shadow-sm`}>
                                {card.value}
                            </span>

                            <span className={`text-[10px] font-bold bg-black/10 px-2 py-0.5 rounded-full mt-2 ${card.text}`}>
                                {card.sub}
                            </span>
                        </div>
                    </div>
                )
            })}
        </div>
    )
}
