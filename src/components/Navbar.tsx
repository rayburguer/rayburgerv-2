import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { Wallet, UserCircle } from 'lucide-react'
import FAQButton from './FAQButton'

export default async function Navbar() {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    let balance = 0.00

    if (user) {
        const { data: profile } = await supabase
            .from('profiles')
            .select('wallet_balance')
            .eq('id', user.id)
            .single()

        if (profile) {
            balance = Number(profile.wallet_balance) || 0.00
        }
    }

    return (
        <nav className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800 shadow-md">
            <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">

                {/* Left: Brand Identity */}
                <div className="flex items-center gap-3">
                    <Link href="/menu" className="flex flex-col group">
                        <span className="text-2xl font-black italic tracking-tighter text-white leading-none group-hover:text-amber-500 transition-colors">
                            RAYBURGER
                        </span>
                        <span className="text-[10px] font-bold text-amber-500 tracking-widest uppercase -mt-1 group-hover:text-white transition-colors">
                            Sabor a la parrilla
                        </span>
                    </Link>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-2">

                    {/* FAQ Button (New) */}
                    <FAQButton />

                    {/* Wallet Badge (Desktop/Tablet mostly, mobile fits if small) */}
                    {user && (
                        <Link href="/profile" className="hidden xs:flex items-center gap-2 bg-slate-900 border border-slate-800 hover:border-amber-500/50 text-white px-3 py-1.5 rounded-full transition-all">
                            <Wallet className="w-3.5 h-3.5 text-amber-500" />
                            <span className="font-mono font-bold text-sm text-amber-500">
                                ${balance.toFixed(2)}
                            </span>
                        </Link>
                    )}

                    {/* Profile Link */}
                    <Link href="/profile" className="p-2 text-slate-400 hover:text-white transition-colors">
                        <UserCircle className="w-7 h-7" />
                    </Link>

                </div>
            </div>
        </nav>
    )
}
