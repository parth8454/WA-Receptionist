import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getProducts, addProduct, deleteProduct, updateProduct } from '../services/api';
import { Plus, Trash2, Pencil, Loader2, Check, X, Package } from 'lucide-react';

export default function Catalog() {
    const { shop } = useAuth();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [adding, setAdding] = useState(false);
    const [editingId, setEditingId] = useState(null);

    const emptyForm = { itemName: '', price: '', itemDescription: '', isAvailable: true };
    const [form, setForm] = useState(emptyForm);
    const [editForm, setEditForm] = useState(emptyForm);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const res = await getProducts(shop.id);
            setProducts(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = async () => {
        if (!form.itemName || !form.price) return;
        try {
            setAdding(true);
            await addProduct({ ...form, shopId: shop.id, price: Number(form.price) });
            setForm(emptyForm);
            fetchProducts();
        } catch (err) {
            console.error(err);
        } finally {
            setAdding(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            await deleteProduct(id);
            setProducts(products.filter(p => p._id !== id));
        } catch (err) {
            console.error(err);
        }
    };

    const handleEdit = (product) => {
        setEditingId(product._id);
        setEditForm({
            itemName: product.itemName,
            price: product.price,
            itemDescription: product.itemDescription || '',
            isAvailable: product.isAvailable
        });
    };

    const handleUpdate = async (id) => {
        try {
            await updateProduct(id, { ...editForm, price: Number(editForm.price) });
            setEditingId(null);
            fetchProducts();
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">

            {/* Header */}
            <div>
                <h1 className="text-white text-2xl font-bold">Services & Products</h1>
                <p className="text-gray-400 text-sm mt-1">
                    Manage your catalog — the AI uses this to reply to customers
                </p>
            </div>

            {/* Add New */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
                    <Plus size={18} className="text-green-400" />
                    Add New Service
                </h2>
                <div className="grid grid-cols-2 gap-3">
                    <input
                        type="text"
                        placeholder="Service name (e.g. Haircut)"
                        value={form.itemName}
                        onChange={(e) => setForm({ ...form, itemName: e.target.value })}
                        className="bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-green-500 transition-colors"
                    />
                    <input
                        type="number"
                        placeholder="Price (₹)"
                        value={form.price}
                        onChange={(e) => setForm({ ...form, price: e.target.value })}
                        className="bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-green-500 transition-colors"
                    />
                    <input
                        type="text"
                        placeholder="Description (optional)"
                        value={form.itemDescription}
                        onChange={(e) => setForm({ ...form, itemDescription: e.target.value })}
                        className="col-span-2 bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-green-500 transition-colors"
                    />
                </div>
                <button
                    onClick={handleAdd}
                    disabled={adding || !form.itemName || !form.price}
                    className="mt-3 bg-green-500 hover:bg-green-400 disabled:bg-green-500/30 text-white font-medium px-5 py-2.5 rounded-lg text-sm transition-colors flex items-center gap-2"
                >
                    {adding
                        ? <><Loader2 size={15} className="animate-spin" /> Adding...</>
                        : <><Plus size={15} /> Add Service</>
                    }
                </button>
            </div>

            {/* Products List */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-800">
                    <h2 className="text-white font-semibold">
                        Your Catalog
                        <span className="ml-2 text-xs text-gray-400 font-normal">
                            {products.length} services
                        </span>
                    </h2>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 size={24} className="animate-spin text-green-400" />
                    </div>
                ) : products.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 gap-3">
                        <Package size={32} className="text-gray-600" />
                        <p className="text-gray-400 text-sm">No services yet — add your first one above</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-800">
                        {products.map((product) => (
                            <div key={product._id} className="px-6 py-4">
                                {editingId === product._id ? (
                                    // Edit mode
                                    <div className="grid grid-cols-2 gap-3">
                                        <input
                                            type="text"
                                            value={editForm.itemName}
                                            onChange={(e) => setEditForm({ ...editForm, itemName: e.target.value })}
                                            className="bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500"
                                        />
                                        <input
                                            type="number"
                                            value={editForm.price}
                                            onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                                            className="bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500"
                                        />
                                        <input
                                            type="text"
                                            value={editForm.description}
                                            onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                                            placeholder="Description"
                                            className="col-span-2 bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500"
                                        />
                                        <div className="col-span-2 flex gap-2">
                                            <button
                                                onClick={() => handleUpdate(product._id)}
                                                className="flex items-center gap-1.5 bg-green-500 hover:bg-green-400 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                                            >
                                                <Check size={13} /> Save
                                            </button>
                                            <button
                                                onClick={() => setEditingId(null)}
                                                className="flex items-center gap-1.5 bg-gray-700 hover:bg-gray-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                                            >
                                                <X size={13} /> Cancel
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    // View mode
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <p className="text-white text-sm font-medium">
                                                        {product.itemName}
                                                    </p>
                                                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                                                        product.isAvailable
                                                            ? 'bg-green-500/10 text-green-400'
                                                            : 'bg-red-500/10 text-red-400'
                                                    }`}>
                                                        {product.isAvailable ? 'Available' : 'Unavailable'}
                                                    </span>
                                                </div>
                                                {product.itemDescription && (
                                                    <p className="text-gray-400 text-xs mt-0.5">
                                                    {product.itemDescription}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <p className="text-green-400 font-semibold text-sm">
                                                ₹{product.price}
                                            </p>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => handleEdit(product)}
                                                    className="text-gray-400 hover:text-white transition-colors"
                                                >
                                                    <Pencil size={15} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(product._id)}
                                                    className="text-gray-400 hover:text-red-400 transition-colors"
                                                >
                                                    <Trash2 size={15} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}