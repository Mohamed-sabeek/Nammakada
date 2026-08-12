import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, WarningCircle, CheckCircle, Storefront, Package } from '@phosphor-icons/react';
import api from '../../services/api';
import { useCart } from '../../context/CartContext';

const ProductDetailsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToCart } = useCart();
    
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [toast, setToast] = useState(null);
    const [activeImage, setActiveImage] = useState('');

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const { data } = await api.get(`/products/${id}`);
                setProduct(data.data);
                setActiveImage(data.data.image);
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to fetch product details');
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
    }, [id]);

    const handleQuantityChange = (type) => {
        if (type === 'inc' && quantity < product.stock) {
            setQuantity(prev => prev + 1);
        } else if (type === 'dec' && quantity > 1) {
            setQuantity(prev => prev - 1);
        }
    };

    const handleAddToCart = async () => {
        const res = await addToCart(product._id, quantity);
        if (res.success) {
            setToast('Added to cart successfully!');
            setTimeout(() => setToast(null), 3000);
        } else {
            setToast(`Error: ${res.message}`);
            setTimeout(() => setToast(null), 3000);
        }
    };

    const handleBuyNow = async () => {
        const res = await addToCart(product._id, quantity);
        if (res.success) {
            navigate('/customer/checkout');
        } else {
            setToast(`Error: ${res.message}`);
            setTimeout(() => setToast(null), 3000);
        }
    };

    if (loading) return (
        <div className="p-8 max-w-7xl mx-auto flex items-center justify-center min-h-[60vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
    );

    if (error) return (
        <div className="p-8 max-w-7xl mx-auto flex flex-col items-center justify-center min-h-[60vh] text-center">
            <WarningCircle size={64} className="text-red-400 mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">Oops! Something went wrong</h3>
            <p className="text-gray-500 mb-6">{error}</p>
            <button onClick={() => navigate('/customer/products')} className="px-6 py-2 bg-primary text-white rounded-full font-medium">Back to Products</button>
        </div>
    );

    if (!product) return null;

    return (
        <div className="p-6 md:p-8 max-w-7xl mx-auto relative pb-24">
            <button 
                onClick={() => navigate('/customer/products')}
                className="flex items-center gap-2 text-gray-500 hover:text-primary transition-colors w-fit mb-8"
            >
                <ArrowLeft weight="bold" />
                <span>Back to Products</span>
            </button>

            <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-6 md:p-10">
                <div className="grid md:grid-cols-2 gap-12">
                    {/* Left: Images */}
                    <div className="flex flex-col gap-4">
                        <div className="aspect-square bg-gray-50 rounded-3xl overflow-hidden border border-gray-100">
                            <img src={activeImage} alt={product.name} className="w-full h-full object-cover" />
                        </div>
                        {product.images && product.images.length > 0 && (
                            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                                <button onClick={() => setActiveImage(product.image)} className={`w-20 h-20 rounded-xl overflow-hidden border-2 flex-shrink-0 ${activeImage === product.image ? 'border-primary' : 'border-transparent'}`}>
                                    <img src={product.image} className="w-full h-full object-cover" />
                                </button>
                                {product.images.map((img, idx) => (
                                    <button key={idx} onClick={() => setActiveImage(img)} className={`w-20 h-20 rounded-xl overflow-hidden border-2 flex-shrink-0 ${activeImage === img ? 'border-primary' : 'border-transparent'}`}>
                                        <img src={img} className="w-full h-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Right: Details */}
                    <div className="flex flex-col">
                        <div className="mb-6">
                            <span className="inline-block px-3 py-1 bg-primary-light text-primary-dark font-bold text-xs rounded-full uppercase tracking-wider mb-4">
                                {product.category}
                            </span>
                            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">{product.name}</h1>
                            
                            <div className="flex items-center gap-4 text-sm text-gray-500 font-medium">
                                <div className="flex items-center gap-1 text-yellow-500">
                                    ⭐ <span className="text-gray-800">{product.rating || 'New'}</span>
                                    {product.reviewCount > 0 && <span className="text-gray-400">({product.reviewCount} reviews)</span>}
                                </div>
                                <span>•</span>
                                <div className="flex items-center gap-1">
                                    <Storefront size={18} /> Verified Local Seller
                                </div>
                                {product.quality && (
                                    <>
                                        <span>•</span>
                                        <div className="flex items-center gap-1 text-gray-600 font-medium">
                                            Quality: {product.quality}
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="mb-8">
                            {product.discountPrice ? (
                                <div className="flex items-end gap-4">
                                    <span className="text-4xl font-black text-gray-900">₹{product.discountPrice}</span>
                                    <span className="text-xl text-gray-400 line-through mb-1">₹{product.price}</span>
                                    <span className="text-sm font-bold text-red-500 bg-red-50 px-2 py-1 rounded-lg mb-1">
                                        {Math.round(((product.price - product.discountPrice)/product.price)*100)}% OFF
                                    </span>
                                </div>
                            ) : (
                                <span className="text-4xl font-black text-gray-900">₹{product.price}</span>
                            )}
                            <p className="text-sm text-gray-500 mt-2 flex items-center gap-1">
                                <CheckCircle size={16} className="text-primary" weight="fill" /> 
                                Inclusive of all taxes
                            </p>
                        </div>

                        <div className="mb-8 border-t border-b border-gray-100 py-6">
                            <h3 className="font-bold text-gray-900 mb-3">Description</h3>
                            <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{product.description}</p>
                        </div>

                        <div className="mt-auto">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="font-bold text-gray-900">Availability</h3>
                                {product.stock > 0 ? (
                                    <div className="flex items-center gap-1.5 text-primary font-medium bg-primary-light px-3 py-1 rounded-full text-sm">
                                        <Package size={18} /> In Stock ({product.stock})
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-1.5 text-red-500 font-medium bg-red-50 px-3 py-1 rounded-full text-sm">
                                        <WarningCircle size={18} /> Out of Stock
                                    </div>
                                )}
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4">
                                <div className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-2xl p-2 w-full sm:w-1/3">
                                    <button 
                                        onClick={() => handleQuantityChange('dec')}
                                        disabled={quantity <= 1 || product.stock === 0}
                                        className="w-10 h-10 flex items-center justify-center bg-white rounded-xl shadow-sm text-gray-600 hover:text-primary disabled:opacity-50"
                                    >-</button>
                                    <span className="font-bold text-gray-900 w-10 text-center">{quantity}</span>
                                    <button 
                                        onClick={() => handleQuantityChange('inc')}
                                        disabled={quantity >= product.stock || product.stock === 0}
                                        className="w-10 h-10 flex items-center justify-center bg-white rounded-xl shadow-sm text-gray-600 hover:text-primary disabled:opacity-50"
                                    >+</button>
                                </div>
                                <button 
                                    onClick={handleAddToCart}
                                    disabled={product.stock === 0}
                                    className="flex-1 bg-primary-light hover:bg-primary-dark text-primary hover:text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <ShoppingCart size={24} weight="fill" /> Add to Cart
                                </button>
                                <button 
                                    onClick={handleBuyNow}
                                    disabled={product.stock === 0}
                                    className="flex-1 bg-primary hover:bg-primary-dark text-white font-bold py-4 rounded-2xl transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                                >
                                    Buy Now
                                </button>
                            </div>
                        </div>

                    </div>
                </div>
            </div>

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

export default ProductDetailsPage;
