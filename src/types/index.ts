export interface Product {
    id: string;
    name: string;
    description?: string;
    price: number;
    image_url?: string;
    category?: string;
    stock?: number;
    is_available?: boolean;
    created_at?: string;
    customizations?: {
        variants?: { name: string; price: number }[];
        extras?: { name: string; price: number }[];
    };
}

export interface Profile {
    id: string;
    phone: string;
    full_name?: string;
    level?: number;
    total_spent?: number;
    wallet_balance?: number;
    referred_by?: string;
    referral_code?: string;
    role?: 'admin' | 'customer';
    created_at?: string;
    is_founder?: boolean;
    birth_date?: string;
}

export interface Order {
    id: string;
    user_id?: string;
    customer_name: string;
    customer_phone: string;
    delivery_method: 'pickup' | 'delivery';
    delivery_address?: string;
    items: OrderItem[];
    total_amount: number;
    status: 'pending' | 'preparing' | 'delivered' | 'cancelled' | 'completed';
    paid?: boolean;
    created_at?: string;
}

export interface OrderItem {
    product_id: string;
    quantity: number;
    unit_price: number;
    name: string;
    extras?: Record<string, number>;
    removals?: string[];
    variant?: string;
}

export interface CartItem extends Product {
    cartItemId: string; // Unique ID for this specific line item in cart
    quantity: number;
    selectedExtras?: Record<string, number>; // name: price
    selectedRemovals?: string[];
    selectedVariant?: string;
}
