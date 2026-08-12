import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, MagnifyingGlass, Funnel, Faders, WarningCircle } from '@phosphor-icons/react';
import api from '../../services/api';
import { useCart } from '../../context/CartContext';
import CustomSelect from '../../components/ui/CustomSelect';

const CATEGORIES = [
    'All', 'Groceries', 'Food', 'Fashion', 'Electronics', 'Beauty', 'Home & Kitchen', 'Books', 'Sports'
];

const ProductsPage = () => {
    const { addToCart } = useCart();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // Filters
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [category, setCategory] = useState('All');
    const [sort, setSort] = useState('createdAt');

    // Toast
    const [toast, setToast] = useState(null);

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(search), 500);
        return () => clearTimeout(timer);
    }, [search]);

    const fetchProducts = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            let url = `/products?page=1&limit=50`;
            if (debouncedSearch) url += `&search=${debouncedSearch}`;
            if (category !== 'All') url += `&category=${category}`;
            if (sort) url += `&sort=${sort}`;

            const { data } = await api.get(url);
            setProducts(data.data.products);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch products');
        } finally {
            setLoading(false);
        }
    }, [debouncedSearch, category, sort]);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    const handleAddToCart = async (product, e) => {
        e.preventDefault();
        e.stopPropagation();
        
        if (product.stock === 0) return;

        const res = await addToCart(product._id, 1);
        
        if (res.success) {
            setToast(`Added ${product.name} to cart`);
            setTimeout(() => setToast(null), 3000);
        } else {
            setToast(`Error: ${res.message}`);
            setTimeout(() => setToast(null), 3000);
        }
    };

    return (
        <div className="p-6 md:p-8 max-w-[1400px] mx-auto relative min-h-screen">
            {/* Header */}
            <div className="mb-12">
                <h1 className="text-[32px] font-bold text-gray-900 mb-2 tracking-tight">Shop Local</h1>
                <p className="text-[15px] text-gray-500">Discover products from trusted local sellers.</p>
            </div>

            {/* Filters & Search */}
            <div className="flex flex-col lg:flex-row gap-6 mb-10">
                <div className="flex-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                        <MagnifyingGlass size={20} />
                    </div>
                    <input 
                        type="text" 
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search products..." 
                        className="w-full pl-12 pr-12 py-4 bg-white border border-gray-200 rounded-2xl shadow-sm focus:outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600 transition-all text-gray-900 placeholder-gray-400"
                    />
                    {search && (
                        <button 
                            onClick={() => setSearch('')}
                            className="absolute inset-y-0 right-4 flex items-center text-gray-400 hover:text-gray-600"
                            aria-label="Clear search"
                        >
                            <div className="bg-gray-100 rounded-full p-1"><ShoppingCart size={0} className="hidden"/>✕</div>
                        </button>
                    )}
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="w-full sm:w-56 shrink-0">
                        <CustomSelect 
                            value={category}
                            onChange={(value) => setCategory(value)}
                            options={CATEGORIES.map(c => ({ value: c, label: c === 'All' ? 'All Categories' : c }))}
                            icon={<Funnel size={20} />}
                        />
                    </div>
                    <div className="w-full sm:w-56 shrink-0">
                        <CustomSelect 
                            value={sort}
                            onChange={(value) => setSort(value)}
                            options={[
                                { value: "createdAt", label: "Newest" },
                                { value: "price_asc", label: "Price: Low to High" },
                                { value: "price_desc", label: "Price: High to Low" },
                                { value: "rating", label: "Top Rated" }
                            ]}
                            icon={<Faders size={20} />}
                        />
                    </div>
                </div>
            </div>

            {/* Grid Header */}
            {!loading && !error && (
                <div className="mb-6 flex justify-between items-end">
                    <p className="text-sm font-medium text-gray-500">
                        {products.length} {products.length === 1 ? 'product' : 'products'}
                    </p>
                </div>
            )}

            {/* Content States */}
            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(n => (
                        <div key={n} className="bg-white rounded-[18px] p-3 shadow-sm border border-gray-100 animate-pulse flex flex-col h-[380px]">
                            <div className="bg-gray-100 aspect-square rounded-xl mb-4 w-full"></div>
                            <div className="px-2 flex flex-col flex-1">
                                <div className="bg-gray-100 h-3 w-1/3 mb-2 rounded"></div>
                                <div className="bg-gray-100 h-5 w-3/4 mb-4 rounded"></div>
                                <div className="flex justify-between items-end mt-auto pt-4">
                                    <div className="bg-gray-100 h-6 w-1/3 rounded"></div>
                                    <div className="bg-gray-100 h-10 w-10 rounded-xl"></div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : error ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mb-6 text-red-500">
                        <WarningCircle size={48} weight="fill" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Unable to load products</h3>
                    <p className="text-gray-500 mb-6">Please try again.</p>
                    <button onClick={fetchProducts} className="px-6 py-2 bg-gray-900 hover:bg-black text-white rounded-full font-medium transition-colors">Retry</button>
                </div>
            ) : products.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6 text-gray-400">
                        <div className="text-4xl">🛍</div>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">No products found</h3>
                    <p className="text-gray-500 mb-6">Try changing your search or category filter.</p>
                    <button 
                        onClick={() => { setSearch(''); setCategory('All'); setSort('createdAt'); }}
                        className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-full font-medium transition-colors"
                    >
                        Clear Filters
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-20">
                    {products.map((product) => {
                        const hasDiscount = product.discountPrice && product.discountPrice < product.price;
                        const discountPercent = hasDiscount 
                            ? Math.round(((product.price - product.discountPrice) / product.price) * 100) 
                            : 0;

                        return (
                            <Link 
                                to={`/customer/products/${product._id}`} 
                                key={product._id}
                                className="bg-white rounded-[18px] p-3 shadow-sm border border-gray-100 hover:shadow-md transition-all group flex flex-col relative"
                            >
                                <div className="relative aspect-square rounded-xl overflow-hidden mb-4 bg-gray-50 flex items-center justify-center">
                                    <img 
                                        src={product.image} 
                                        alt={product.name} 
                                        className="w-full h-full object-contain group-hover:scale-[1.03] transition-transform duration-300 ease-out"
                                    />
                                    {hasDiscount && (
                                        <div className="absolute top-2 left-2 bg-red-500 text-white text-[10px] uppercase font-black px-2 py-1 rounded-full shadow-sm tracking-wide">
                                            {discountPercent}% OFF
                                        </div>
                                    )}
                                    <div className="absolute top-2 right-2 bg-white/95 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-bold text-gray-800 shadow-sm flex items-center gap-1">
                                        <span className="text-yellow-400 text-[10px]">★</span> {product.rating || 'New'}
                                    </div>
                                    
                                    {product.stock === 0 && (
                                        <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex items-center justify-center">
                                            <span className="bg-gray-900 text-white px-4 py-2 rounded-full font-bold text-sm shadow-xl">OUT OF STOCK</span>
                                        </div>
                                    )}
                                </div>
                                
                                <div className="px-2 flex flex-col flex-1">
                                    <span className="text-[11px] font-bold text-green-600 uppercase tracking-widest mb-1.5">{product.category}</span>
                                    <h3 className="font-bold text-gray-900 text-[15px] leading-snug mb-1 line-clamp-2 group-hover:text-green-600 transition-colors">{product.name}</h3>
                                    
                                    <div className="mt-auto pt-4 flex items-end justify-between">
                                        <div>
                                            {hasDiscount ? (
                                                <div className="flex flex-col">
                                                    <span className="text-xs text-gray-400 line-through mb-0.5">₹{product.price}</span>
                                                    <span className="text-lg font-black text-gray-900 leading-none">₹{product.discountPrice}</span>
                                                </div>
                                            ) : (
                                                <div className="flex flex-col justify-end h-full">
                                                    <span className="text-lg font-black text-gray-900 leading-none">₹{product.price}</span>
                                                </div>
                                            )}
                                        </div>
                                        
                                        <button 
                                            onClick={(e) => handleAddToCart(product, e)}
                                            disabled={product.stock === 0}
                                            aria-label="Add to cart"
                                            title="Add to cart"
                                            className={`h-10 w-10 rounded-xl flex items-center justify-center transition-all shrink-0 ${
                                                product.stock === 0 
                                                    ? 'bg-gray-100 text-gray-300 cursor-not-allowed' 
                                                    : 'bg-green-50 text-green-600 hover:bg-green-600 hover:text-white'
                                            }`}
                                        >
                                            <ShoppingCart size={20} weight="fill" />
                                        </button>
                                    </div>
                                    
                                    {product.stock > 0 && product.stock <= 5 && (
                                        <div className="text-[11px] text-orange-500 font-bold mt-3">
                                            Only {product.stock} left
                                        </div>
                                    )}
                                </div>
                            </Link>
                        );
                    })}
                </div>
            )}

            {/* Toast Notification */}
            {toast && (
                <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-6 py-3 rounded-full font-medium shadow-2xl flex items-center gap-3 z-50 animate-fade-in-up">
                    <div className="bg-primary text-white p-1 rounded-full"><ShoppingCart size={16} weight="fill" /></div>
                    {toast}
                </div>
            )}
        </div>
    );
};

export default ProductsPage;
