'use client'

import { useState } from 'react'
import { Settings, Package, BarChart3, List, Layers, DollarSign } from 'lucide-react'
import SalesStats from './SalesStats'
import TopProductsWidget from './TopProductsWidget'
import PeakHoursWidget from './PeakHoursWidget'
import DollarRateEditor from './DollarRateEditor'
import CategoryManager from './CategoryManager'
import ProductManagerPRO from './ProductManagerPRO'
import ExtrasManager from './ExtrasManager'

interface AdminProductsClientProps {
    stats: any
    topProducts: any[]
    peakHours: any[]
    currentRate: string
    categories: any[]
    products: any[]
    modifiers: any[]
}

type Tab = 'inventory' | 'config' | 'analytics'

export default function AdminProductsClient({
    stats,
    topProducts,
    peakHours,
    currentRate,
    categories,
    products,
    modifiers
}: AdminProductsClientProps) {
    const [activeTab, setActiveTab] = useState<Tab>('inventory')

    return (
        <div className="space-y-6 max-w-[1600px] mx-auto pb-24">

            {/* Header + Tabs */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
                        <Settings className="w-8 h-8 text-amber-500" />
                        <span className="hidden md:inline">Panel de Control</span>
                        <span className="md:hidden">Control</span>
                    </h2>
                    <p className="text-slate-400 text-sm hidden md:block">Gestión integral de tu negocio.</p>
                </div>

                {/* Mobile/Desktop Tabs */}
                <div className="flex p-1 bg-slate-900 border border-slate-800 rounded-xl overflow-x-auto">
                    <button
                        onClick={() => setActiveTab('inventory')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'inventory'
                                ? 'bg-amber-500 text-slate-900 shadow-lg'
                                : 'text-slate-400 hover:text-white'
                            }`}
                    >
                        <Package className="w-4 h-4" />
                        Inventario
                    </button>
                    <button
                        onClick={() => setActiveTab('config')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'config'
                                ? 'bg-amber-500 text-slate-900 shadow-lg'
                                : 'text-slate-400 hover:text-white'
                            }`}
                    >
                        <Layers className="w-4 h-4" />
                        Config & Menú
                    </button>
                    <button
                        onClick={() => setActiveTab('analytics')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'analytics'
                                ? 'bg-amber-500 text-slate-900 shadow-lg'
                                : 'text-slate-400 hover:text-white'
                            }`}
                    >
                        <BarChart3 className="w-4 h-4" />
                        Métricas
                    </button>
                </div>
            </div>

            {/* CONTENT AREA */}
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">

                {/* TAB: INVENTARIO (Product Manager) */}
                {activeTab === 'inventory' && (
                    <div className="h-[calc(100vh-200px)]">
                        <ProductManagerPRO
                            products={products}
                            categories={categories}
                        />
                    </div>
                )}

                {/* TAB: CONFIGURACION (Categories, Extras, Dollar) */}
                {activeTab === 'config' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-3">
                            <DollarRateEditor initialRate={currentRate} />
                        </div>
                        <div className="h-[500px]">
                            <CategoryManager categories={categories} />
                        </div>
                        <div className="h-[500px] lg:col-span-2">
                            <ExtrasManager modifiers={modifiers} />
                        </div>
                    </div>
                )}

                {/* TAB: ANALYTICS (Stats, Charts) */}
                {activeTab === 'analytics' && (
                    <div className="space-y-6">
                        <SalesStats stats={stats} />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <TopProductsWidget data={topProducts} />
                            <PeakHoursWidget data={peakHours} />
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
