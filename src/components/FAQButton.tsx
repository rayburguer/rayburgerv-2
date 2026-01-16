'use client'

import { useState } from 'react'
import { HelpCircle, ChevronRight, X } from 'lucide-react'

export default function FAQButton() {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="p-2 text-slate-400 hover:text-white transition-colors"
                aria-label="Ayuda"
            >
                <HelpCircle className="w-6 h-6" />
            </button>

            {isOpen && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-end md:items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl md:rounded-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-10 md:zoom-in duration-300 flex flex-col max-h-[80vh]">
                        {/* Header */}
                        <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-950">
                            <div>
                                <h3 className="text-xl font-black text-white italic tracking-tight">MANUAL DE VICIO 🍔</h3>
                                <p className="text-xs text-slate-400">Todo lo que necesitas saber</p>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-2 bg-slate-800 rounded-full hover:bg-slate-700 transition-colors"
                            >
                                <X className="w-5 h-5 text-white" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-5 overflow-y-auto space-y-4">
                            <FAQItem
                                question="¿Cómo hago un pedido?"
                                answer="1. Elige tus burgers favoritas. 2. Ve al carrito. 3. Elige Delivery o Pickup. 4. Si pagas en Bs, sube el capture. ¡Listo!"
                            />
                            <FAQItem
                                question="¿Qué son los Puntos RayBurger?"
                                answer="Por cada $1 que gastas, ganas 10 puntos. Al acumular, subes de nivel (Bronce, Plata, Oro) y ganas Cashback en cada compra."
                            />
                            <FAQItem
                                question="¿Qué es el Saldo Favor?"
                                answer="Es dinero real en tu billetera digital. Proviene de tus Cashbacks o recargas. Úsalo para pagar tus próximos pedidos sin tocar tu cuenta bancaria."
                            />
                            <FAQItem
                                question="¿Hacen delivery a toda la ciudad?"
                                answer="Cubrimos Zonas 1, 2 y 3. Al pagar, selecciona tu zona y el sistema calculará el costo automáticamente."
                            />
                            <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl mt-4">
                                <p className="text-sm text-amber-500 font-bold text-center">
                                    ¿Dudas urgentes? Escríbenos al WhatsApp
                                </p>
                            </div>
                        </div>

                        <div className="p-4 border-t border-slate-800 bg-slate-950">
                            <button
                                onClick={() => setIsOpen(false)}
                                className="w-full py-3 bg-white text-black font-black uppercase tracking-wider rounded-xl hover:bg-slate-200 transition-colors"
                            >
                                ¡Entendido, a comer!
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

function FAQItem({ question, answer }: { question: string, answer: string }) {
    const [open, setOpen] = useState(false)
    return (
        <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950/50">
            <button
                onClick={() => setOpen(!open)}
                className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-800/50 transition-colors"
            >
                <span className="font-bold text-slate-200 text-sm">{question}</span>
                <ChevronRight className={`w-4 h-4 text-slate-500 transition-transform ${open ? 'rotate-90' : ''}`} />
            </button>
            {open && (
                <div className="px-4 pb-4 pt-0 text-slate-400 text-xs leading-relaxed animate-in fade-in slide-in-from-top-1">
                    {answer}
                </div>
            )}
        </div>
    )
}
