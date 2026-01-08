import { ShoppingCart } from 'lucide-react';
import { useCartStore } from '../store/useCartStore';
import { useSettingsStore } from '../store/useSettingsStore';
import { formatVES } from '../utils/currency';

interface HeaderProps {
    onCartClick: () => void;
}

export function Header({ onCartClick }: HeaderProps) {
    const cartItems = useCartStore((state) => state.cartItems);
    const getTotal = useCartStore((state) => state.getTotal);
    const exchangeRate = useSettingsStore((state) => state.exchangeRate);

    const itemCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
    const totalUSD = getTotal();

    return (
        <header className="sticky top-0 z-50 flex items-center justify-between bg-black/90 px-4 py-3 backdrop-blur-md border-b border-white/10 shadow-md">
            <div className="flex items-center gap-2">
                <h1 className="text-xl font-black uppercase tracking-tight text-white">
                    Ray<span className="text-flame">Burger</span>
                </h1>
            </div>

            <div className="flex items-center gap-4">
                {itemCount > 0 && (
                    <div className="hidden sm:flex flex-col items-end text-right">
                        <span className="text-sm font-bold text-white">${totalUSD.toFixed(2)}</span>
                        <span className="text-xs text-gray-400">{formatVES(totalUSD, exchangeRate)}</span>
                    </div>
                )}

                <div className="relative">
                    <button
                        onClick={onCartClick}
                        className="flex items-center justify-center rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-flame hover:text-white"
                    >
                        <ShoppingCart size={24} />
                        {itemCount > 0 && (
                            <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-flame text-xs font-bold text-white shadow-sm ring-2 ring-obsidian">
                                {itemCount}
                            </span>
                        )}
                    </button>
                </div>
            </div>
        </header>
    );
}
