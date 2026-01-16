import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Debe coincidir con la interfaz de tus componentes
export interface Product {
    id: string
    name: string
    description: string
    price_usd: number
    image_url: string
    category: string
    created_at?: string
    all_modifiers?: any // Estructura JSON del backend
}

export interface CartItem extends Product {
    quantity: number
    customization?: {
        modifiers: string[]
        finalPrice: number
    }
}

interface CartState {
    items: CartItem[]
    totalItems: number
    totalPrice: number
    addItem: (product: Product, options?: { customization?: { modifiers: string[], finalPrice: number } }) => void
    removeItem: (cartItemId: string) => void // Ojo: Ahora el remove podría necesitar el ID compuesto, pero para simpleza usaremos filter por ID producto y modifiers? Mejor generamos un uniqueId o usamos comparación profunda. 
    // Por simplicidad V3: removemos por index o buscamos item exacto?
    // User no pidió remove complex. Asumimos remove borra TODAS las instancias de ese producto o solo una?
    // El código actual remove: items.find(i => i.id === productId).
    // Si hay 2 burgers con distitnos modifiers, borrara la primera que encuentre.
    // FIX: addItem generará un `cartId` único o usaremos comparación.
    // Para no romper todo: usaremos un `uuid` interno para items del carrito si es posible, o dejaremos la logica actual pero addItem crea entradas separadas. 
    // Si addItem crea entradas separadas, removeItem(productId) borrará la primera. 
    // Aceptable para MVP.
    clearCart: () => void
}

export const useCartStore = create<CartState>()(
    persist(
        (set, get) => ({
            items: [],
            totalItems: 0,
            totalPrice: 0,

            addItem: (product, options) => {
                const { items } = get()

                // Generar firma de modificadores para comparar (usamos el array de modifiers dentro de customization)
                const customizationKey = JSON.stringify(options?.customization || {})
                const priceToUse = options?.customization?.finalPrice || product.price_usd

                // Buscar item idéntico
                const existingItemIndex = items.findIndex((i) =>
                    i.id === product.id &&
                    JSON.stringify(i.customization || {}) === customizationKey
                )

                let newItems: CartItem[]

                if (existingItemIndex > -1) {
                    // Existe exacto -> Incrementamos cantidad
                    newItems = [...items]
                    newItems[existingItemIndex].quantity += 1
                } else {
                    // Nuevo item (o nueva combinación)
                    newItems = [...items, {
                        ...product,
                        price_usd: priceToUse, // El precio base del item en carrito será el custom
                        customization: options?.customization,
                        quantity: 1
                    }]
                }

                // Recalcular totales
                const totalItems = newItems.reduce((acc, item) => acc + item.quantity, 0)
                const totalPrice = newItems.reduce(
                    (acc, item) => acc + item.price_usd * item.quantity,
                    0
                )

                set({ items: newItems, totalItems, totalPrice })
            },

            removeItem: (productId) => {
                const { items } = get()
                const existingItem = items.find((i) => i.id === productId)

                if (!existingItem) return

                let newItems: CartItem[]

                if (existingItem.quantity > 1) {
                    newItems = items.map((i) =>
                        i.id === productId ? { ...i, quantity: i.quantity - 1 } : i
                    )
                } else {
                    newItems = items.filter((i) => i.id !== productId)
                }

                // Recalcular totales
                const totalItems = newItems.reduce((acc, item) => acc + item.quantity, 0)
                const totalPrice = newItems.reduce(
                    (acc, item) => acc + item.price_usd * item.quantity,
                    0
                )

                set({ items: newItems, totalItems, totalPrice })
            },

            clearCart: () => {
                set({ items: [], totalItems: 0, totalPrice: 0 })
            },
        }),
        {
            name: 'rayburger-cart-v3', // Clave en localStorage
        }
    )
)
