import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { Trash, ArrowRight, ShoppingCart, Info } from '@phosphor-icons/react';

const CartPage = () => {
    const { cart, isLoading, itemCount, subtotal, deliveryFee, total, updateQuantity, removeItem } = useCart();
    const navigate = useNavigate();

    if (isLoading) {
        return (
            <div className="p-8 max-w-5xl mx-auto flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!cart || cart.items.length === 0) {
        return (
            <div className="p-8 max-w-3xl mx-auto flex flex-col items-center justify-center min-h-[60vh] text-center">
                <div className="w-24 h-24 bg-primary-light text-primary rounded-full flex items-center justify-center mb-6">
                    <ShoppingCart size={48} weight="fill" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
                <p className="text-gray-500 mb-8 max-w-md">Looks like you haven't added anything to your cart yet. Discover great local products and start shopping!</p>
                <Link 
                    to="/customer/products" 
                    className="px-8 py-4 bg-primary hover:bg-primary-dark text-white rounded-2xl font-bold transition-all shadow-lg hover:shadow-xl hover:-translate-y-1"
                >
                    Start Shopping
                </Link>
            </div>
        );
    }

    return (
        <div className="p-6 md:p-8 max-w-6xl mx-auto pb-24">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart <span className="text-gray-400 text-2xl font-normal">({itemCount} items)</span></h1>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Cart Items */}
                <div className="flex-1 space-y-4">
                    {cart.items.map((item) => (
                        <div key={item.product._id} className="bg-white rounded-[2rem] p-4 shadow-sm border border-gray-100 flex flex-col sm:flex-row gap-6">
                            <div className="w-full sm:w-32 h-32 bg-gray-50 rounded-2xl overflow-hidden shrink-0 border border-gray-100">
                                <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1 flex flex-col justify-center">
                                <div className="flex justify-between items-start gap-4 mb-2">
                                    <Link to={`/customer/products/${item.product._id}`} className="font-bold text-lg text-gray-900 hover:text-primary transition-colors line-clamp-1">
                                        {item.product.name}
                                    </Link>
                                    <button 
                                        onClick={() => removeItem(item.product._id)}
                                        className="text-gray-400 hover:text-red-500 transition-colors p-2 -mr-2"
                                    >
                                        <Trash size={20} />
                                    </button>
                                </div>
                                <div className="text-sm font-bold text-primary uppercase tracking-wider mb-4">
                                    {item.product.category}
                                </div>
                                
                                <div className="flex items-center justify-between mt-auto">
                                    <span className="text-lg font-black text-gray-900">₹{item.price}</span>
                                    
                                    <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl p-1">
                                        <button 
                                            onClick={() => updateQuantity(item.product._id, item.quantity - 1)}
                                            disabled={item.quantity <= 1}
                                            className="w-8 h-8 flex items-center justify-center bg-white rounded-lg shadow-sm text-gray-600 hover:text-primary disabled:opacity-50"
                                        >-</button>
                                        <span className="font-bold text-gray-900 w-8 text-center">{item.quantity}</span>
                                        <button 
                                            onClick={() => updateQuantity(item.product._id, item.quantity + 1)}
                                            disabled={item.quantity >= item.product.stock}
                                            className="w-8 h-8 flex items-center justify-center bg-white rounded-lg shadow-sm text-gray-600 hover:text-primary disabled:opacity-50"
                                        >+</button>
                                    </div>
                                </div>
                                {item.quantity >= item.product.stock && (
                                    <p className="text-xs text-red-500 mt-2">Maximum available stock reached</p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Summary */}
                <div className="w-full lg:w-[400px]">
                    <div className="bg-white rounded-[2rem] p-6 md:p-8 shadow-sm border border-gray-100 sticky top-24">
                        <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>
                        
                        <div className="space-y-4 mb-6 text-gray-600">
                            <div className="flex justify-between">
                                <span>Subtotal</span>
                                <span className="font-medium text-gray-900">₹{subtotal}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Delivery Fee</span>
                                <span className="font-medium text-gray-900">₹{deliveryFee}</span>
                            </div>
                            <div className="border-t border-gray-100 pt-4 flex justify-between items-center">
                                <span className="text-lg font-bold text-gray-900">Total</span>
                                <span className="text-2xl font-black text-primary">₹{total}</span>
                            </div>
                        </div>

                        <div className="bg-blue-50 text-blue-700 p-4 rounded-xl text-sm flex gap-3 mb-6">
                            <Info size={24} weight="fill" className="shrink-0 text-blue-500" />
                            <p>Taxes are included. Shipping is calculated at checkout.</p>
                        </div>

                        <button 
                            onClick={() => navigate('/customer/checkout')}
                            className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-xl hover:-translate-y-1"
                        >
                            Proceed to Checkout <ArrowRight size={20} weight="bold" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CartPage;
