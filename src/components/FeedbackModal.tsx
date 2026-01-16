'use client'

import { useState } from 'react'
import { Star, X, Loader2, Send } from 'lucide-react'
import { submitFeedback } from '@/app/actions/feedback'

interface FeedbackModalProps {
    orderId: string
    isOpen: boolean
    onClose: () => void
}

export default function FeedbackModal({ orderId, isOpen, onClose }: FeedbackModalProps) {
    const [ratings, setRatings] = useState({ sabor: 10, atencion: 10, tiempo: 10, empaque: 10 })
    const [comment, setComment] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)

    if (!isOpen) return null

    const handleRating = (category: keyof typeof ratings, value: number) => {
        setRatings(prev => ({ ...prev, [category]: value }))
    }

    const handleSubmit = async () => {
        setIsSubmitting(true)
        const res = await submitFeedback({
            orderId,
            ...ratings,
            comment
        })

        if (res.success) {
            alert('¡Gracias por tu opinión! Recompensa acreditada en tu Wallet. 💸')
            onClose()
        } else {
            alert('Error: ' + res.error)
        }
        setIsSubmitting(false)
    }

    const RatingRow = ({ label, field, value }: { label: string, field: keyof typeof ratings, value: number }) => (
        <div className="space-y-2">
            <div className="flex justify-between text-sm">
                <span className="text-white font-medium">{label}</span>
                <span className="text-amber-500 font-bold">{value}/10</span>
            </div>
            <div className="flex gap-1 justify-between bg-slate-800 p-2 rounded-lg">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                    <button
                        key={num}
                        onClick={() => handleRating(field, num)}
                        className={`w-full h-8 rounded flex items-center justify-center text-[10px] font-bold transition-all ${num <= value
                                ? 'bg-amber-500 text-slate-900 shadow-lg shadow-amber-500/20 scale-110'
                                : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                            }`}
                    >
                        {num}
                    </button>
                ))}
            </div>
        </div>
    )

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>

                {/* Header */}
                <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-linear-to-r from-slate-900 to-slate-950">
                    <div>
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                            Califica tu Pedido
                        </h2>
                        <p className="text-xs text-amber-500 font-bold mt-1">¡Gana Saldo Favor por ayudarnos!</p>
                    </div>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-full bg-slate-800 hover:bg-slate-700">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">

                    <RatingRow label="🍔 Sabor y Temperatura" field="sabor" value={ratings.sabor} />
                    <RatingRow label="⏱️ Tiempo de Entrega" field="tiempo" value={ratings.tiempo} />
                    <RatingRow label="📦 Empaque y Presentación" field="empaque" value={ratings.empaque} />
                    <RatingRow label="🤝 Atención al Cliente" field="atencion" value={ratings.atencion} />

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-white">Comentario (Opcional)</label>
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="¿Qué te pareció la experiencia?"
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-amber-500 min-h-[80px]"
                        />
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-slate-800 bg-slate-950">
                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="w-full bg-linear-to-r from-amber-600 to-orange-600 hover:to-orange-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-orange-900/20 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Enviando...
                            </>
                        ) : (
                            <>
                                <Send className="w-5 h-5" />
                                Enviar y Ganar Recompensa
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    )
}
