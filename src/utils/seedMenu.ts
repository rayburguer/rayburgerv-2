
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { resolve } from 'path';

// Load env vars
dotenv.config({ path: resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const BURGER_IMG = 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&q=80';
const HOTDOG_IMG = 'https://images.unsplash.com/photo-1612392062631-94dd85fa98aa?w=800&q=80';

const PRODUCTS = [
    // LAS INTOCABLES
    {
        name: 'La Clásica del Rey',
        description: 'Carne 120g, vegetales frescos y salsas de la casa.',
        price: 5.00,
        category: 'hamburguesas',
        image_url: BURGER_IMG,
        is_available: true,
        customizations: {
            variants: [
                { name: 'Sencilla', price: 0 },
                { name: 'Doble', price: 2.50 }
            ]
        }
    },
    {
        name: 'Ray Bacon Melt',
        description: 'La favorita. Queso fundido abundante y tocineta crujiente.',
        price: 6.50,
        category: 'hamburguesas',
        image_url: BURGER_IMG,
        is_available: true,
        customizations: {
            variants: [
                { name: 'Sencilla', price: 0 },
                { name: 'Doble', price: 2.50 }
            ]
        }
    },
    {
        name: 'La Crispy Supreme',
        description: 'Pollo apanado extra crujiente con el toque secreto.',
        price: 7.00,
        category: 'hamburguesas',
        image_url: BURGER_IMG,
        is_available: true,
        customizations: {
            variants: [
                { name: 'Sencilla', price: 0 },
                { name: 'Doble', price: 3.50 }
            ]
        }
    },
    {
        name: 'La Chistoburger',
        description: 'Imponente combinación de Carne + Chistorra Monserrat.',
        price: 7.50,
        category: 'hamburguesas',
        image_url: BURGER_IMG,
        is_available: true,
        customizations: {
            variants: [
                { name: 'Sencilla', price: 0 },
                { name: 'Doble', price: 3.50 }
            ]
        }
    },
    // EDICIÓN ITALIANA
    {
        name: 'La Romana',
        description: 'Edición Italiana. Doble queso y tomates deshidratados.',
        price: 7.00,
        category: 'hamburguesas',
        image_url: BURGER_IMG,
        is_available: true,
        customizations: {
            variants: [
                { name: 'Sencilla', price: 0 },
                { name: 'Doble', price: 2.50 }
            ]
        }
    },
    {
        name: 'Victoria Rellena',
        description: '250g de carne rellena de queso y tocineta. Una experiencia superior.',
        price: 8.50,
        category: 'hamburguesas',
        image_url: BURGER_IMG,
        is_available: true,
        customizations: { variants: [] }
    },
    {
        name: 'Victoria "Il Capo"',
        description: '250g de carne rellena con tomates deshidratados. Sabor intenso.',
        price: 10.00,
        category: 'hamburguesas',
        image_url: BURGER_IMG,
        is_available: true,
        customizations: { variants: [] }
    },
    // LOS PERROS
    {
        name: 'Perro Clásico',
        description: 'El clásico hot dog con salsas y papitas.',
        price: 2.00,
        category: 'perros',
        image_url: HOTDOG_IMG,
        is_available: true,
        customizations: {}
    },
    {
        name: 'Perro Especial',
        description: 'Con queso y tocineta.',
        price: 3.00,
        category: 'perros',
        image_url: HOTDOG_IMG,
        is_available: true,
        customizations: {}
    },
    {
        name: 'Perripollo',
        description: 'Con pollo desmechado y salsas.',
        price: 3.50,
        category: 'perros',
        image_url: HOTDOG_IMG,
        is_available: true,
        customizations: {}
    },
    {
        name: 'Perro Jumbo',
        description: 'Salchicha jumbo para mayor apetito.',
        price: 3.50,
        category: 'perros',
        image_url: HOTDOG_IMG,
        is_available: true,
        customizations: {}
    }
];

async function seed() {
    console.log('🌱 Seeding Menu...');

    // Optional: Clear existing products in these categories to avoid dupes?
    // For safety, let's just insert. User can delete via admin panel.

    const { error } = await supabase
        .from('products')
        .insert(PRODUCTS);

    if (error) {
        console.error('❌ Error inserting products:', error);
    } else {
        console.log('✅ Menu loaded successfully!');
    }
}

seed();
