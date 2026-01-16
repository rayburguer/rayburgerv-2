'use client'

import { useState } from 'react'
import { FileBarChart, MessageCircle } from 'lucide-react'
import DailyClosingModal from '@/components/DailyClosingModal'
import Link from 'next/link'

export default function AdminHeaderActions() {
    const [isModalOpen, setIsModalOpen] = useState(false)

    return (
        <>
            <Link
                href="/admin/marketing"
                className="bg-purple-500 hover:bg-purple-400 text-black border-2 border-black shadow-[4px_4px_0px_#000] px-5 py-2.5 rounded-xl text-xs font-black uppercase flex items-center gap-2 transition-all hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-none mr-3"
            >
                <MessageCircle className="w-4 h-4 stroke-[2.5px]" />
                CRM Activo
            </Link>

            <button
                onClick={() => setIsModalOpen(true)}
                className="bg-emerald-500 hover:bg-emerald-400 text-black border-2 border-black shadow-[4px_4px_0px_#000] px-5 py-2.5 rounded-xl text-xs font-black uppercase flex items-center gap-2 transition-all hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-none"
            >
                <FileBarChart className="w-4 h-4 stroke-[2.5px]" />
                Cierre Diario
            </button>

            <DailyClosingModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
        </>
    )
}
