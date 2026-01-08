import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Plus, Image as ImageIcon, Search, Eye, EyeOff, Edit2 } from 'lucide-react';
import { supabase } from '../api/supabase';
import type { Product } from '../types';

export function AdminMenu() {
    const navigate = useNavigate();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editForm, setEditForm] = useState<Partial<Product>>({});

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .order('category', { ascending: true })
            .order('name', { ascending: true });

        if (error) {
            console.error('Error fetching products:', error);
            alert('Error al cargar productos');
        } else {
            setProducts(data || []);
        }
        setLoading(false);
    };

    const toggleAvailability = async (product: Product) => {
        // Toggle optimistic update
        const newStatus = !product.is_available;
        setProducts(products.map(p => p.id === product.id ? { ...p, is_available: newStatus } : p));

        const { error } = await supabase
            .from('products')
            .update({ is_available: newStatus })
            .eq('id', product.id);

        if (error) {
            // Revert on error
            setProducts(products.map(p => p.id === product.id ? { ...p, is_available: !newStatus } : p));
            alert('Error al actualizar disponibilidad');
        }
    };

    const startEditing = (product: Product) => {
        setEditingId(product.id);
        setEditForm({
            name: product.name,
            price: product.price,
            description: product.description,
            image_url: product.image_url
        });
    };

    const saveEdit = async (id: string) => {
        // Optimistic update
        setProducts(products.map(p => p.id === id ? { ...p, ...editForm } : p));
        setEditingId(null);

        const { error } = await supabase
            .from('products')
            .update(editForm)
            .eq('id', id);

        if (error) {
            console.error('Update error:', error);
            alert('Error al guardar cambios');
            fetchProducts(); // Revert
        }
    };

    const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>, productId: string) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Validations
        if (!file.type.startsWith('image/')) {
            alert('Por favor selecciona un archivo de imagen válido');
            return;
        }
        if (file.size > 2 * 1024 * 1024) { // 2MB limit
            alert('La imagen no debe superar los 2MB');
            return;
        }

        const fileExt = file.name.split('.').pop();
        const fileName = `${productId}-${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;

        try {
            // Optimistic UI update (optional, but maybe tricky with images)
            // Just show loading state if possible

            // 1. Upload to Supabase Storage
            const { error: uploadError } = await supabase.storage
                .from('products')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            // 2. Get Public URL
            const { data: { publicUrl } } = supabase.storage
                .from('products')
                .getPublicUrl(filePath);

            // 3. Update Product in DB
            const { error: dbError } = await supabase
                .from('products')
                .update({ image_url: publicUrl })
                .eq('id', productId);

            if (dbError) throw dbError;

            // 4. Update Local State
            setProducts(products.map(p =>
                p.id === productId ? { ...p, image_url: publicUrl } : p
            ));

            alert('✅ Imagen actualizada correctamente');

        } catch (error: any) {
            console.error('Upload error:', error);
            alert('Error al subir imagen: ' + error.message);
        }
    };

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.category || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="min-h-screen bg-obsidian flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-flame/30 border-t-flame rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-gray-400">Cargando menú...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-obsidian text-white p-4 pb-20">
            {/* Header */}
            <div className="flex items-center justify-between mb-6 sticky top-0 bg-obsidian/90 backdrop-blur-md py-4 z-10 border-b border-white/5">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/admin')} className="p-2 -ml-2 text-gray-400 hover:text-white">
                        <ArrowLeft size={24} />
                    </button>
                    <h1 className="text-xl font-bold">Gestión de Menú</h1>
                </div>
                <button
                    onClick={() => alert('Próximamente: Crear Producto')}
                    className="bg-flame hover:bg-red-600 text-white p-2 rounded-lg transition-colors"
                >
                    <Plus size={24} />
                </button>
            </div>

            <div className="max-w-4xl mx-auto">
                {/* Search */}
                <div className="mb-6 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                    <input
                        type="text"
                        placeholder="Buscar hamburguesa, bebida..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-flame focus:ring-1 focus:ring-flame transition-all"
                    />
                </div>

                {/* Products Grid Grouped by Category */}
                <div className="space-y-8">
                    {['hamburguesas', 'perros', 'combos', 'papas', 'bebidas', 'extras'].map(category => {
                        const categoryProducts = filteredProducts.filter(p =>
                            (p.category || 'otros').toLowerCase() === category
                            // Include 'otros' for products without valid category if we are in 'hamburguesas' just to show them somewhere, or handle separately? 
                            // Let's stick to strict categories for now, maybe add 'otros' section at end.
                        );

                        if (categoryProducts.length === 0) return null;

                        return (
                            <div key={category}>
                                <h3 className="text-xl font-bold text-white mb-4 capitalize border-b border-white/10 pb-2">
                                    {category === 'extras' ? '🧩 Extras & Adicionales' : category}
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {categoryProducts.map((product) => (
                                        <div
                                            key={product.id}
                                            className={`bg-white/5 border rounded-xl p-4 transition-all ${!product.is_available ? 'opacity-60 grayscale border-red-900/30' : 'border-white/10'
                                                }`}
                                        >
                                            <div className="flex gap-4">
                                                {/* Image */}
                                                <div className="w-24 h-24 bg-black/40 rounded-lg overflow-hidden shrink-0 relative group">
                                                    <img
                                                        src={product.image_url}
                                                        alt={product.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                    {/* Upload trigger overlay */}
                                                    <label className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                                        <ImageIcon size={20} className="text-white" />
                                                        <input
                                                            type="file"
                                                            className="hidden"
                                                            accept="image/*"
                                                            onChange={(e) => handleImageUpload(e, product.id)}
                                                        />
                                                    </label>
                                                </div>

                                                {/* Content */}
                                                <div className="flex-1 min-w-0">
                                                    {editingId === product.id ? (
                                                        <div className="space-y-2">
                                                            <input
                                                                type="text"
                                                                value={editForm.name}
                                                                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                                                className="w-full bg-black/40 border border-white/20 rounded px-2 py-1 text-sm font-bold"
                                                                autoFocus
                                                            />
                                                            <div className="flex gap-2">
                                                                <input
                                                                    type="number"
                                                                    value={editForm.price}
                                                                    onChange={(e) => setEditForm({ ...editForm, price: parseFloat(e.target.value) })}
                                                                    className="w-24 bg-black/40 border border-white/20 rounded px-2 py-1 text-sm font-mono text-flame"
                                                                    step="0.01"
                                                                />
                                                                <button
                                                                    onClick={() => saveEdit(product.id)}
                                                                    className="bg-green-600 hover:bg-green-700 text-white rounded px-3 py-1 text-xs font-bold flex items-center gap-1"
                                                                >
                                                                    <Save size={14} /> Guardar
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <>
                                                            <div className="flex justify-between items-start mb-1">
                                                                <h3 className="font-bold text-lg truncate pr-2">{product.name}</h3>
                                                                <button
                                                                    onClick={() => startEditing(product)}
                                                                    className="text-gray-500 hover:text-white p-1"
                                                                >
                                                                    <Edit2 size={16} />
                                                                </button>
                                                            </div>
                                                            <p className="text-flame font-black text-xl mb-1">${product.price.toFixed(2)}</p>
                                                            <p className="text-xs text-gray-500 line-clamp-2">{product.description}</p>
                                                        </>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Actions Footer */}
                                            <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
                                                <span className={`text-xs font-bold px-2 py-1 rounded ${(product.category || '').toLowerCase() === 'burgers' ? 'bg-orange-500/20 text-orange-400' :
                                                        (product.category || '').toLowerCase() === 'drinks' ? 'bg-blue-500/20 text-blue-400' :
                                                            'bg-gray-500/20 text-gray-400'
                                                    }`}>
                                                    {(product.category || 'GENERAL').toUpperCase()}
                                                </span>

                                                <button
                                                    onClick={() => toggleAvailability(product)}
                                                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-bold transition-all ${product.is_available
                                                            ? 'bg-green-500/10 text-green-400 hover:bg-green-500/20'
                                                            : 'bg-red-500/10 text-red-400 hover:bg-red-500/20'
                                                        }`}
                                                >
                                                    {product.is_available ? (
                                                        <>
                                                            <Eye size={16} /> Visible
                                                        </>
                                                    ) : (
                                                        <>
                                                            <EyeOff size={16} /> Oculto
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
