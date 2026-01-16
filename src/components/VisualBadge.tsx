'use client'

import { Star, Flame, Zap, Sparkles } from 'lucide-react'

type BadgeType = 'NEW' | 'HOT' | 'POPULAR' | '10X'

interface VisualBadgeProps {
    type: BadgeType
    className?: string
}

export default function VisualBadge({ type, className = '' }: VisualBadgeProps) {
    const badges = {
        'NEW': {
            bg: 'bg-green-500',
            text: 'NUEVO',
            icon: Sparkles,
            rotate: '-rotate-12',
            shadow: 'shadow-green-900/50'
        },
        'HOT': {
            bg: 'bg-red-500',
            text: 'HOT',
            icon: Flame,
            rotate: 'rotate-12',
            shadow: 'shadow-red-900/50'
        },
        'POPULAR': {
            bg: 'bg-amber-500',
            text: 'TOP',
            icon: Star,
            rotate: '-rotate-6',
            shadow: 'shadow-amber-900/50'
        },
        '10X': {
            bg: 'bg-purple-600',
            text: '10x PTS',
            icon: Zap,
            rotate: 'rotate-6',
            shadow: 'shadow-purple-900/50'
        }
    }

    const config = badges[type]
    const Icon = config.icon

    return (
        <div className={`absolute z-20 -top-3 -left-3 ${className} filter drop-shadow-md`}>
            <div className={`
                ${config.bg} ${config.rotate}
                px-4 py-1.5 rounded-full border-[3px] border-white
                flex items-center gap-1.5 shadow-[4px_4px_0px_rgba(0,0,0,1)]
                transform hover:scale-110 transition-transform cursor-pointer
            `}>
                <Icon className="w-4 h-4 text-white fill-white stroke-black stroke-[1.5]" />
                <span className="text-xs font-black text-white tracking-widest italic text-stroke-sm shadow-black">
                    {config.text}
                </span>
            </div>
        </div>
    )
}
