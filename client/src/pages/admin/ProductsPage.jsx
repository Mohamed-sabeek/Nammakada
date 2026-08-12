import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Plus, MagnifyingGlass, Funnel, Trash, PencilSimple, WarningCircle, CheckCircle, Package } from '@phosphor-icons/react';
import api from '../../services/api';
import PageHeader from '../../components/ui/PageHeader';
import CustomSelect from '../../components/ui/CustomSelect';

const AdminProductsPage = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Pagination & Filters
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'all');

    // Toast
    const [toast, setToast] = useState(null);

    // Confirmation Modal
    const [confirmModal, setConfirmModal] = useState({ isOpen: false, productId: null, action: null });

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(search), 500);
        return () => clearTimeout(timer);
    }, [search]);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            let url = `/products/admin/all?page=${page}&limit=10`;
            if (debouncedSearch) url += `&search=${debouncedSearch}`;
            if (statusFilter !== 'all') url += `&status=${statusFilter}`;

            const { data } = await api.get(url);
            setProducts(data.data.products);
            setTotalPages(data.data.totalPages);
        } catch (err) {
            setError('Failed to fetch products');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, [page, debouncedSearch, statusFilter]);

    const handleAction = async (id, action) => {
        try {
            if (action === 'delete') {
                await api.delete(`/products/${id}?force=true`);
                showToast('Product permanently deleted', 'success');
            } else if (action === 'deactivate' || action === 'activate') {
                await api.delete(`/products/${id}`);
                showToast(`Product ${action}d successfully`, 'success');
            }
            fetchProducts();
        } catch (err) {
            showToast(`Failed to ${action} product`, 'error');
        }
        setConfirmModal({ isOpen: false, productId: null, action: null });
    };

    const showToast = (message, type) => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const openConfirmModal = (productId, action) => {
        setConfirmModal({ isOpen: true, productId, action });
    };

    return (
        <div className="space-y-6">
            <PageHeader 
                title="Products" 
                subtitle="Manage your NammaKada product catalog." 
            />

            {/* Filters */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                        <MagnifyingGlass size={20} />
                    </div>
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                        placeholder="Search products by name or description..."
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-600 focus:border-transparent outline-none transition-all"
                    />
                </div>
                <div className="flex items-center gap-2 shrink-0">
                    <Funnel size={20} className="text-gray-400" />
                    <div className="w-48">
                        <CustomSelect
                            value={statusFilter}
                            onChange={(value) => { setStatusFilter(value); setPage(1); }}
                            options={[
                                { value: "all", label: "All Status" },
                                { value: "active", label: "Active" },
                                { value: "inactive", label: "Inactive" },
                                { value: "out_of_stock", label: "Out of Stock" },
                                { value: "low_stock", label: "Low Stock" }
                            ]}
                        />
                    </div>
                    <Link
                        to="/admin/products/new"
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 h-[42px] rounded-xl font-bold flex items-center justify-center gap-2 transition-colors shadow-sm shrink-0 whitespace-nowrap"
                    >
                        <Plus size={20} weight="bold" /> Add Product
                    </Link>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left whitespace-nowrap">
                        <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-bold">
                            <tr>
                                <th className="px-6 py-4">Product</th>
                                <th className="px-6 py-4">Category</th>
                                <th className="px-6 py-4">Price</th>
                                <th className='px-6 py-4'>Quality</th>
                                <th className="px-6 py-4">Stock</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
                                    </td>
                                </tr>
                            ) : products.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center">
                                        <div className="text-gray-400 mb-2 flex justify-center"><Package size={48} /></div>
                                        <p className="text-gray-500 font-medium">No products found</p>
                                    </td>
                                </tr>
                            ) : products.map(product => (
                                <tr key={product._id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <img src={product.image} className="w-12 h-12 rounded-lg object-cover bg-gray-100" />
                                            <div>
                                                <p className="font-bold text-gray-900 truncate max-w-[200px]">{product.name}</p>
                                                <p className="text-xs text-gray-500">ID: {product._id.slice(-6).toUpperCase()}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm font-medium text-gray-600">{product.category}</td>
                                    <td className="px-6 py-4 text-sm font-bold text-gray-900">₹{product.price}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold tracking-wide ${
                                            (product.quality || 'Standard') === 'Premium' ? 'bg-green-50 text-green-700 border border-green-200' :
                                            (product.quality || 'Standard') === 'Good' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                                            'bg-gray-100 text-gray-700 border border-gray-200'
                                        }`}>
                                            {product.quality || 'Standard'}
                                        </span>
                                    </td>

                                    <td className="px-6 py-4 text-sm">
                                        {product.stock === 0 ? (
                                            <span className="text-red-500 font-bold">0 (Out)</span>
                                        ) : product.stock <= 5 ? (
                                            <span className="text-orange-500 font-bold">{product.stock} (Low)</span>
                                        ) : (
                                            <span className="text-green-600 font-bold">{product.stock}</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${product.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                            {product.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Link
                                                to={`/admin/products/${product._id}/edit`}
                                                className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                                            >
                                                <PencilSimple size={20} />
                                            </Link>
                                            <button
                                                onClick={() => openConfirmModal(product._id, product.isActive ? 'deactivate' : 'activate')}
                                                className="p-2 text-orange-500 hover:bg-orange-50 rounded-lg transition-colors"
                                                title={product.isActive ? 'Deactivate' : 'Activate'}
                                            >
                                                <WarningCircle size={20} />
                                            </button>
                                            <button
                                                onClick={() => openConfirmModal(product._id, 'delete')}
                                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                            >
                                                <Trash size={20} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
                        <button
                            disabled={page === 1}
                            onClick={() => setPage(p => p - 1)}
                            className="px-4 py-2 bg-gray-50 text-gray-600 font-medium rounded-lg disabled:opacity-50"
                        >
                            Previous
                        </button>
                        <span className="text-sm font-medium text-gray-500">Page {page} of {totalPages}</span>
                        <button
                            disabled={page === totalPages}
                            onClick={() => setPage(p => p + 1)}
                            className="px-4 py-2 bg-gray-50 text-gray-600 font-medium rounded-lg disabled:opacity-50"
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>

            {/* Confirmation Modal */}
            {confirmModal.isOpen && (
                <div className="fixed inset-0 bg-gray-900/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl animate-fade-in-up">
                        <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-6 mx-auto ${confirmModal.action === 'delete' ? 'bg-red-50 text-red-500' : 'bg-orange-50 text-orange-500'
                            }`}>
                            <WarningCircle size={32} weight="fill" />
                        </div>
                        <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">Are you sure?</h2>
                        <p className="text-center text-gray-500 mb-8">
                            {confirmModal.action === 'delete'
                                ? "This will permanently delete the product and its image from the server. This action cannot be undone."
                                : `This will ${confirmModal.action} the product. ${confirmModal.action === 'deactivate' ? 'Customers will not be able to see it.' : 'It will become visible to customers.'}`
                            }
                        </p>
                        <div className="flex gap-4">
                            <button
                                onClick={() => setConfirmModal({ isOpen: false, productId: null, action: null })}
                                className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleAction(confirmModal.productId, confirmModal.action)}
                                className={`flex-1 px-4 py-3 text-white font-bold rounded-xl transition-colors ${confirmModal.action === 'delete' ? 'bg-red-500 hover:bg-red-600' : 'bg-orange-500 hover:bg-orange-600'
                                    }`}
                            >
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Toast Notification */}
            {toast && (
                <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 px-6 py-3 rounded-full font-medium shadow-2xl flex items-center gap-3 z-50 animate-fade-in-up ${toast.type === 'success' ? 'bg-gray-900 text-white' : 'bg-red-500 text-white'
                    }`}>
                    {toast.type === 'success' ? <CheckCircle size={20} weight="fill" className="text-green-400" /> : <WarningCircle size={20} weight="fill" />}
                    {toast.message}
                </div>
            )}
        </div>
    );
};

export default AdminProductsPage;
