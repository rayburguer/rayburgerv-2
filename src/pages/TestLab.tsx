import { useEffect, useState } from 'react';
import { simulatePurchases } from '../utils/loyaltyTest';

export function TestLab() {
    const [running, setRunning] = useState(false);
    const [completed, setCompleted] = useState(false);

    const runSimulation = async () => {
        setRunning(true);
        setCompleted(false);

        try {
            await simulatePurchases();
            setCompleted(true);
        } catch (err) {
            console.error('Simulation error:', err);
        } finally {
            setRunning(false);
        }
    };

    return (
        <div className="min-h-screen bg-obsidian text-white p-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-black mb-6">🧪 Laboratorio de Lealtad</h1>

                <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-6">
                    <h2 className="text-xl font-bold mb-4">Escenario de Prueba</h2>
                    <div className="space-y-2 text-sm text-gray-300">
                        <p>• <strong>Cliente A (Padrino):</strong> No compra, solo recibe bonos de referidos</p>
                        <p>• <strong>Cliente B:</strong> Compra $50 (Nivel 1 → 3% cashback)</p>
                        <p>• <strong>Cliente C:</strong> Compra $150 (Nivel 2 → 5% cashback)</p>
                        <p>• <strong>Cliente D:</strong> Compra $600 (Nivel 3 → 8% cashback)</p>
                        <p>• <strong>Cliente E:</strong> Compra $20 (Nivel 1 → 3% cashback)</p>
                    </div>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-6">
                    <h2 className="text-xl font-bold mb-4">Cálculos Esperados</h2>
                    <div className="space-y-3 text-sm">
                        <div className="bg-black/40 p-3 rounded">
                            <p className="text-flame font-bold">Cliente B ($50):</p>
                            <p className="text-gray-300">Cashback: $50 × 3% = $1.50</p>
                            <p className="text-gray-300">Bono Padrino A: $50 × 2% = $1.00</p>
                        </div>
                        <div className="bg-black/40 p-3 rounded">
                            <p className="text-flame font-bold">Cliente C ($150):</p>
                            <p className="text-gray-300">Cashback: $150 × 5% = $7.50</p>
                            <p className="text-gray-300">Bono Padrino A: $150 × 2% = $3.00</p>
                        </div>
                        <div className="bg-black/40 p-3 rounded">
                            <p className="text-flame font-bold">Cliente D ($600):</p>
                            <p className="text-gray-300">Cashback: $600 × 8% = $48.00</p>
                            <p className="text-gray-300">Bono Padrino A: $600 × 2% = $12.00</p>
                        </div>
                        <div className="bg-black/40 p-3 rounded">
                            <p className="text-flame font-bold">Cliente E ($20):</p>
                            <p className="text-gray-300">Cashback: $20 × 3% = $0.60</p>
                            <p className="text-gray-300">Bono Padrino A: $20 × 2% = $0.40</p>
                        </div>
                        <div className="bg-green-500/20 border border-green-500/30 p-3 rounded mt-4">
                            <p className="text-green-400 font-bold">Total Padrino A (sin comprar):</p>
                            <p className="text-white text-xl">$1.00 + $3.00 + $12.00 + $0.40 = $16.40</p>
                        </div>
                    </div>
                </div>

                <button
                    onClick={runSimulation}
                    disabled={running}
                    className="w-full bg-flame hover:bg-red-600 text-white font-bold py-4 px-6 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {running ? '⏳ Ejecutando Simulación...' : completed ? '✅ Ejecutar de Nuevo' : '🚀 Ejecutar Simulación'}
                </button>

                <div className="mt-6 bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
                    <p className="text-sm text-blue-300">
                        💡 <strong>Nota:</strong> Abre la consola del navegador (F12) para ver los resultados detallados de la simulación.
                    </p>
                </div>
            </div>
        </div>
    );
}
