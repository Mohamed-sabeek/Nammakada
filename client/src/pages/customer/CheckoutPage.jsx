import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { CheckCircle, ShieldCheck, MapPin, Truck, Receipt } from '@phosphor-icons/react';
import api from '../../services/api';

const CheckoutPage = () => {
    const { cart, subtotal, deliveryFee, total, clearCart } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();

    const [isPlacingOrder, setIsPlacingOrder] = useState(false);
    const [orderSuccessData, setOrderSuccessData] = useState(null);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        fullName: user?.name || '',
        phone: user?.phone || '',
        address: '',
        city: '',
        state: '',
        pincode: ''
    });

    if (!cart || (cart.items.length === 0 && !orderSuccessData)) {
        navigate('/customer/cart');
        return null;
    }

    const handleInputChange = (e) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handlePlaceOrder = async (e) => {
        e.preventDefault();
        setError('');
        setIsPlacingOrder(true);
        try {
            const { data } = await api.post('/orders', {
                deliveryAddress: formData,
                paymentMethod: 'cod'
            });
            await clearCart();
            // Show Success Animation
            setOrderSuccessData(data.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to place order');
            setIsPlacingOrder(false);
        }
    };

    if (orderSuccessData) {
        const shortId = `NK-${orderSuccessData._id.toString().slice(-4).toUpperCase()}`;
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 bg-bg">
                <div className="bg-white rounded-[2rem] p-8 md:p-12 shadow-xl border border-gray-100 max-w-md w-full text-center animate-fade-up">
                    <div className="flex justify-center mb-6">
                        <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center animate-scale-in">
                            <svg className="w-12 h-12 animate-draw-check stroke-current" style={{ strokeDasharray: 100, strokeDashoffset: 100 }} fill="none" viewBox="0 0 24 24" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                        </div>
                    </div>
                    
                    <h2 className="text-3xl font-black text-gray-900 mb-2">
                        Order Placed Successfully!
                    </h2>
                    <p className="text-gray-500 mb-8">
                        Your order has been placed and will be processed shortly.
                    </p>
                    
                    <div className="bg-gray-50 rounded-2xl p-6 mb-8 text-left space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="text-gray-500 text-sm">Order ID</span>
                            <span className="font-bold text-gray-900">#{shortId}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-500 text-sm">Payment Method</span>
                            <span className="font-bold text-gray-900">
                                {orderSuccessData.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online'}
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-500 text-sm">Payment Status</span>
                            <span className="font-bold text-orange-500 capitalize">
                                {orderSuccessData.paymentStatus}
                            </span>
                        </div>
                        <div className="border-t border-gray-200 pt-3 flex justify-between items-center mt-2">
                            <span className="text-gray-900 font-bold">Total Amount</span>
                            <span className="font-black text-primary text-xl">₹{orderSuccessData.totalAmount}</span>
                        </div>
                    </div>
                    
                    <div className="flex flex-col gap-3">
                        <Link 
                            to={`/customer/orders/${orderSuccessData._id}`}
                            className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3.5 rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                        >
                            <Receipt size={20} weight="bold" /> View Order Details
                        </Link>
                        <Link 
                            to="/customer/products"
                            className="w-full bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2"
                        >
                            Continue Shopping
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 md:p-8 max-w-6xl mx-auto pb-24">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Left: Form */}
                <div className="flex-1">
                    {error && (
                        <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm mb-6 border border-red-100 flex items-center gap-2">
                            <ShieldCheck size={20} /> {error}
                        </div>
                    )}
                    
                    <form id="checkout-form" onSubmit={handlePlaceOrder} className="bg-white rounded-[2rem] p-6 md:p-8 shadow-sm border border-gray-100 mb-6">
                        <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-4">
                            <MapPin size={24} className="text-primary" weight="fill" />
                            <h2 className="text-xl font-bold text-gray-900">Delivery Address</h2>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Full Name</label>
                                <input required type="text" name="fullName" value={formData.fullName} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Phone Number</label>
                                <input required type="tel" name="phone" value={formData.phone} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all" />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-bold text-gray-700 mb-2">Street Address</label>
                                <textarea required name="address" value={formData.address} onChange={handleInputChange} rows="2" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all resize-none"></textarea>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">City</label>
                                <input required type="text" name="city" value={formData.city} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">State</label>
                                <input required type="text" name="state" value={formData.state} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">PIN Code</label>
                                <input required type="text" name="pincode" value={formData.pincode} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all" />
                            </div>
                        </div>
                    </form>

                    <div className="bg-white rounded-[2rem] p-6 md:p-8 shadow-sm border border-gray-100">
                        <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-4">
                            <ShieldCheck size={24} className="text-primary" weight="fill" />
                            <h2 className="text-xl font-bold text-gray-900">Payment Method</h2>
                        </div>
                        <label className="flex items-center gap-4 p-4 border-2 border-primary rounded-xl cursor-pointer bg-primary-light">
                            <input type="radio" name="payment" value="cod" defaultChecked className="w-5 h-5 text-primary focus:ring-primary" />
                            <div className="flex flex-col">
                                <span className="font-bold text-gray-900 text-lg">Cash on Delivery</span>
                                <span className="text-sm text-gray-600">Pay when you receive the order</span>
                            </div>
                        </label>
                    </div>
                </div>

                {/* Right: Summary */}
                <div className="w-full lg:w-[400px]">
                    <div className="bg-white rounded-[2rem] p-6 md:p-8 shadow-sm border border-gray-100 sticky top-24">
                        <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>
                        
                        <div className="space-y-4 mb-6 max-h-60 overflow-y-auto pr-2 scrollbar-hide">
                            {cart.items.map(item => (
                                <div key={item.product._id} className="flex gap-4">
                                    <div className="w-16 h-16 bg-gray-50 rounded-lg overflow-hidden shrink-0 border border-gray-100">
                                        <img src={item.product.image} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="flex flex-col justify-center flex-1">
                                        <span className="font-medium text-sm text-gray-900 line-clamp-1">{item.product.name}</span>
                                        <span className="text-xs text-gray-500">Qty: {item.quantity}</span>
                                        <span className="font-bold text-sm text-gray-900 mt-1">₹{item.price * item.quantity}</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="space-y-4 mb-6 text-gray-600 border-t border-gray-100 pt-6">
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

                        <button 
                            type="submit"
                            form="checkout-form"
                            disabled={isPlacingOrder}
                            className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isPlacingOrder ? (
                                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                                <>Place Order <CheckCircle size={20} weight="bold" /></>
                            )}
                        </button>
                        
                        <div className="mt-4 flex items-center justify-center gap-2 text-xs font-medium text-gray-500">
                            <Truck size={16} /> Fast Local Delivery
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CheckoutPage;
