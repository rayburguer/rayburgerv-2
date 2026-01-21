'use client'

import { useEffect, useState } from 'react'

interface CategoryNavProps {
    categories: string[]
}

export default function CategoryNav({ categories }: CategoryNavProps) {
    const [activeCategory, setActiveCategory] = useState(categories[0])

    const scrollToCategory = (cat: string) => {
        const element = document.getElementById(`category-${cat}`)
        if (element) {
            // Offset for sticky header
            const y = element.getBoundingClientRect().top + window.pageYOffset - 140
            window.scrollTo({ top: y, behavior: 'smooth' })
            setActiveCategory(cat)
        }
    }

    // Optional: Add intersection observer to update active state on scroll
    useEffect(() => {
        const handleScroll = () => {
            // Simple logic to highlight category in view
            // This can be optimized later
        }
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    return (
        <div className="sticky top-0 z-40 bg-slate-950/95 backdrop-blur-sm border-b border-white/5 py-4 pl-4 mb-6">
            <div className="flex gap-3 overflow-x-auto no-scrollbar pr-4">
                {categories.map((cat) => (
                    <button
                        key={cat}
                        onClick={() => scrollToCategory(cat)}
                        className={`px-5 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all ${activeCategory === cat
                            ? 'bg-amber-500 text-slate-900 shadow-lg shadow-amber-500/20 scale-105'
                            : 'bg-slate-900 text-slate-400 border border-slate-700 hover:border-slate-500'
                            }`}
                    >
                        {cat}
                    </button>
                ))}
            </div>
        </div>
    )
}
