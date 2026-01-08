import { useEffect, useState } from 'react';
import { supabase } from '../api/supabase';
import type { Product } from '../types';
import { ProductCard } from '../components/ProductCard';

// Mock data en caso de que la DB esté vacía o falle la conexión inicial sin credenciales
const MOCK_PRODUCTS: Product[] = [
    {
        id: '1',
        name: 'Ray Classic Burger',
        description: 'Carne 100% Angus, queso cheddar, lechuga, tomate y salsa especial.',
        price: 8.99,
        image_url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&q=80',
        category: 'burgers',
        stock: 10
    },
    {
        id: '2',
        name: 'Bacon Ray Master',
        description: 'Doble carne, tocino crujiente, aros de cebolla y salsa BBQ.',
        price: 12.99,
        image_url: 'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?w=800&q=80',
        category: 'burgers',
        stock: 15
    },
    {
        id: '3',
        name: 'Spicy Chicken',
        description: 'Pechuga de pollo empanizada picante, mayonesa de chipotle y pepinillos.',
        price: 9.50,
        image_url: 'https://images.unsplash.com/photo-1615557960916-5f4791effe9d?w=800&q=80',
        category: 'chicken',
        stock: 8,
        customizations: {
            variants: [
                { name: 'Sencilla', price: 0 },
                { name: 'Doble', price: 2.5 }
            ],
            extras: [
                { name: 'Tocineta', price: 1.5 },
                { name: 'Queso Extra', price: 0.8 },
                { name: 'Huevo', price: 0.5 }
            ]
        }
    }
];

const CATEGORIES = [
    { id: 'hamburguesas', label: 'Hamburguesas', icon: '🍔' },
    { id: 'perros', label: 'Perros', icon: '🌭' },
    { id: 'combos', label: 'Combos', icon: '🍱' },
    { id: 'papas', label: 'Papas', icon: '🍟' },
    { id: 'bebidas', label: 'Bebidas', icon: '🥤' },
];

export function Menu() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeCategory, setActiveCategory] = useState('hamburguesas');

    useEffect(() => {
        async function fetchProducts() {
            try {
                setLoading(true);
                // Fetch only available products
                const { data, error } = await supabase
                    .from('products')
                    .select('*')
                    .eq('is_available', true)
                    .order('name');

                if (error) throw error;

                if (data && data.length > 0) {
                    setProducts(data);
                } else {
                    console.log('No products found or DB empty. Using Mock Data.');
                    setProducts(MOCK_PRODUCTS);
                }
            } catch (err) {
                console.error('Error fetching products:', err);
                setError('No se pudieron cargar los productos. Mostrando menú de prueba.');
                setProducts(MOCK_PRODUCTS);
            } finally {
                setLoading(false);
            }
        }

        fetchProducts();
    }, []);

    const filteredProducts = products.filter(p => {
        const cat = (p.category || 'otros').toLowerCase();
        // If retrieving 'extras', don't show them in main menu tabs unless specifically asked (maybe in future). 
        // For now, exclude 'extras' from main listing as they are add-ons.
        if (cat === 'extras') return false;

        return cat === activeCategory;
    });

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-obsidian">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-flame border-t-transparent"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-obsidian px-4 py-8 text-white md:px-8 pb-24">
            <header className="mb-6 text-center">
                <h1 className="text-4xl font-black uppercase tracking-tight text-white">
                    Ray<span className="text-flame">Burger</span>
                </h1>
                <p className="mt-2 text-gray-400">Las mejores hamburguesas del condado</p>
            </header>

            {/* Category Navigation */}
            <div className="mb-8 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
                <div className="flex gap-3 w-max mx-auto">
                    {CATEGORIES.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => setActiveCategory(cat.id)}
                            className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold transition-all whitespace-nowrap ${activeCategory === cat.id
                                    ? 'bg-flame text-white shadow-lg shadow-flame/20 scale-105'
                                    : 'bg-white/5 text-gray-400 hover:bg-white/10'
                                }`}
                        >
                            <span className="text-xl">{cat.icon}</span>
                            <span>{cat.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {error && (
                <div className="mb-6 rounded-lg bg-red-900/20 p-4 text-center text-red-400 border border-red-900/50">
                    <p>{error}</p>
                </div>
            )}

            {filteredProducts.length === 0 ? (
                <div className="text-center py-12 bg-white/5 rounded-2xl border border-white/10 border-dashed">
                    <p className="text-gray-500 text-lg">No hay productos en esta categoría aún.</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 animate-in fade-in duration-500">
                    {filteredProducts.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            )}
        </div>
    );
}
