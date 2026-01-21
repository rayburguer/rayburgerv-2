import { Wallet, Star } from 'lucide-react'

interface PurchasePowerCardProps {
    balance: number
    userName?: string
}

export default function PurchasePowerCard({ balance, userName = 'Ray' }: PurchasePowerCardProps) {
    return (
        <div className="relative group w-full mb-6 mx-4 md:mx-0 max-w-[calc(100%-2rem)] md:max-w-md">
            {/* Card Container */}
            <div className="bg-linear-to-r from-amber-600 to-orange-600 rounded-2xl p-5 shadow-lg relative overflow-hidden flex items-center justify-between">

                {/* Texture/Noise Overlay */}
                <div className="absolute inset-0 opacity-10 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay"></div>

                {/* Glow Effect */}
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-yellow-400/30 blur-3xl rounded-full pointer-events-none"></div>

                <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-bold text-amber-100 uppercase tracking-wider">Tu Saldo Disponible</span>
                        {userName && <span className="text-[10px] text-amber-200 font-medium hidden xs:inline">• Hola, {userName}</span>}
                    </div>
                    <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-black text-white tracking-tight drop-shadow-sm">
                            ${Number(balance).toFixed(2)}
                        </span>
                        <span className="text-xs text-amber-200 font-bold">USD</span>
                    </div>
                </div>

                <div className="relative z-10 flex flex-col items-end">
                    <div className="bg-white/20 backdrop-blur-md border border-white/30 rounded-full px-3 py-1 flex items-center gap-1.5 shadow-sm">
                        <Star className="w-3 h-3 text-yellow-300 fill-yellow-300" />
                        <span className="text-[10px] font-bold text-white uppercase tracking-tight">RayMember VIP</span>
                    </div>
                    {/* Visual Chip/Icon just for style */}
                    <Wallet className="w-12 h-12 text-white/10 absolute -bottom-6 -right-2 rotate-12" />
                </div>
            </div>
        </div>
    )
}
