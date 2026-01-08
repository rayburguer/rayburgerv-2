import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem, Product } from '../types';

interface CartState {
    cartItems: CartItem[];
    addItem: (product: Product, quantity: number, extras?: Record<string, number>, variant?: string, removals?: string[]) => void;
    removeItem: (cartItemId: string) => void;
    clearCart: () => void;
    getTotal: () => number;
}

export const useCartStore = create<CartState>()(
    persist(
        (set, get) => ({
            cartItems: [],

            addItem: (product, quantity, extras = {}, variant, removals = []) => {
                set((state) => {
                    // Create a unique ID for this cart item to differentiate same products with different options
                    const cartItemId = crypto.randomUUID();

                    const newItem: CartItem = {
                        ...product, // Inherit product properties (id, name, price, etc.)
                        cartItemId,
                        quantity,
                        selectedExtras: extras,
                        selectedVariant: variant,
                        selectedRemovals: removals,
                    };

                    return { cartItems: [...state.cartItems, newItem] };
                });
            },

            removeItem: (cartItemId) => {
                set((state) => ({
                    cartItems: state.cartItems.filter((item) => item.cartItemId !== cartItemId),
                }));
            },

            clearCart: () => {
                set({ cartItems: [] });
            },

            getTotal: () => {
                const { cartItems } = get();
                return cartItems.reduce((total, item) => {
                    const itemBasePrice = Number(item.price) || 0;

                    // Add variant price
                    let variantPrice = 0;
                    if (item.selectedVariant && item.customizations?.variants) {
                        const v = item.customizations.variants.find(v => v.name === item.selectedVariant);
                        if (v) variantPrice = Number(v.price) || 0;
                    }

                    const extrasPrice = Object.values(item.selectedExtras || {}).reduce((acc, curr) => acc + (Number(curr) || 0), 0);
                    const itemTotal = (itemBasePrice + variantPrice + extrasPrice) * item.quantity;
                    return total + itemTotal;
                }, 0);
            },
        }),
        {
            name: 'rayburger-cart-storage', // Key for localStorage
        }
    )
);
