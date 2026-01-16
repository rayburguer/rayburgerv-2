'use client'

import { useEffect, useState } from 'react'
import { Gift, X } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { usePathname, useRouter } from 'next/navigation'

export default function ReferralFAB() {
    const [isOpen, setIsOpen] = useState(true) // Start open (or expanded) for visibility
    const [userPhone, setUserPhone] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)
    const pathname = usePathname()
    const router = useRouter()
    const supabase = createClient()

    // Hide on Auth pages or Admin


    useEffect(() => {
        const checkUser = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                const { data: profile } = await supabase.from('profiles').select('phone').eq('id', user.id).single()
                setUserPhone(profile?.phone || null)
            }
            setLoading(false)
        }
        checkUser()
    }, [supabase])

    const handleShare = () => {
        if (!userPhone) {
            // If not logged in or no phone, redirect to Login
            router.push('/login?next=/profile')
            return
        }

        const text = `¡Hola! Pide en Ray Burger 🍔 usando mi número ${userPhone} como código de referido y ambos ganaremos premios. https://rayburger.app`
        const url = `https://wa.me/?text=${encodeURIComponent(text)}`
        window.open(url, '_blank')
    }

    // Hide on Auth pages or Admin
    if (loading || pathname.startsWith('/login') || pathname.startsWith('/register') || pathname.startsWith('/admin')) {
        return null
    }

    return (
        <div className="fixed bottom-24 left-4 md:bottom-8 md:left-8 z-40 flex flex-col items-start gap-2 group">

            {/* Tooltip / Call to Action (Visible initially or on hover) */}
            <div className={`bg-white text-slate-900 px-4 py-2 rounded-xl shadow-xl border border-amber-100 mb-2 transition-all duration-300 origin-bottom-left ${isOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0 group-hover:scale-100 group-hover:opacity-100'}`}>
                <p className="text-xs font-bold whitespace-nowrap">
                    🎁 ¡Gana Dinero invitando!
                </p>
                <div className="absolute -bottom-1 left-4 w-3 h-3 bg-white rotate-45 border-r border-b border-amber-100"></div>
            </div>

            {/* Main Button */}
            <button
                onClick={handleShare}
                className="relative bg-linear-to-br from-purple-500 via-fuchsia-600 to-pink-600 text-white p-4 md:p-5 rounded-full shadow-[0_0_20px_rgba(192,38,211,0.6)] hover:scale-110 active:scale-95 transition-all duration-300 animate-bounce-slow border-2 border-white/20"
            >
                <div className="absolute inset-0 bg-white/20 rounded-full opacity-0 hover:opacity-100 animate-pulse"></div>
                <Gift className="w-7 h-7 md:w-8 md:h-8 drop-shadow-md relative z-10" />

                {/* Red dot indicator */}
                <span className="absolute top-0 right-0 w-4 h-4 bg-green-400 rounded-full border-2 border-slate-900 animate-ping"></span>
                <span className="absolute top-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-slate-900"></span>
            </button>

            {/* Close helper (Mobile only maybe?) */}
            {isOpen && (
                <button
                    onClick={() => setIsOpen(false)}
                    className="absolute -top-2 -right-2 bg-slate-200 text-slate-600 rounded-full p-1 hover:bg-slate-300 md:hidden"
                >
                    <X className="w-3 h-3" />
                </button>
            )}
        </div>
    )
}
