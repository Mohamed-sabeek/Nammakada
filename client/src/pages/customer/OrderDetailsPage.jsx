import { useState, useEffect } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { ArrowLeft, CheckCircle, Package, Truck, HouseLine, WarningCircle } from '@phosphor-icons/react';
import api from '../../services/api';

const OrderDetailsPage = () => {
    const { id } = useParams();
    const location = useLocation();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [cancelling, setCancelling] = useState(false);
    const [toast, setToast] = useState(null);

    const isNewOrder = location.state?.newOrder;

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const { data } = await api.get(`/orders/${id}`);
                setOrder(data.data);
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to fetch order details');
            } finally {
                setLoading(false);
            }
        };
        fetchOrder();
    }, [id]);

    const handleCancelOrder = async () => {
        setCancelling(true);
        try {
            const { data } = await api.put(`/orders/${id}/cancel`);
            setOrder(data.data);
            setShowCancelModal(false);
            setToast('Order cancelled successfully.');
            setTimeout(() => setToast(null), 3000);
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to cancel order.');
        } finally {
            setCancelling(false);
        }
    };

    if (loading) {
        return (
            <div className="p-8 max-w-5xl mx-auto flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (error || !order) {
        return (
            <div className="p-8 max-w-5xl mx-auto flex flex-col items-center justify-center min-h-[60vh] text-center">
                <WarningCircle size={64} className="text-red-400 mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">Oops! Something went wrong</h3>
                <p className="text-gray-500 mb-6">{error}</p>
                <Link to="/customer/orders" className="px-6 py-2 bg-primary text-white rounded-full font-medium">Back to Orders</Link>
            </div>
        );
    }

    const orderStatuses = [
        { key: 'pending', label: 'Order Placed', icon: <CheckCircle weight="fill" /> },
        { key: 'confirmed', label: 'Confirmed', icon: <CheckCircle weight="fill" /> },
        { key: 'packed', label: 'Packed', icon: <Package weight="fill" /> },
        { key: 'out_for_delivery', label: 'Out for Delivery', icon: <Truck weight="fill" /> },
        { key: 'delivered', label: 'Delivered', icon: <HouseLine weight="fill" /> }
    ];

    const currentStatusIndex = orderStatuses.findIndex(s => s.key === order.orderStatus);

    return (
        <div className="p-6 md:p-8 max-w-4xl mx-auto pb-24">
            {isNewOrder ? (
                <div className="bg-primary-light border border-primary/20 rounded-[2rem] p-8 text-center mb-8">
                    <div className="w-20 h-20 bg-primary text-white rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle size={48} weight="fill" />
                    </div>
                    <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Order Placed Successfully! 🎉</h1>
                    <p className="text-gray-600 font-medium mb-6">Thank you for shopping local. Your order has been received.</p>
                    <div className="flex items-center justify-center gap-4">
                        <Link to="/customer/products" className="px-6 py-3 bg-white text-gray-900 rounded-xl font-bold shadow-sm hover:shadow transition-shadow">Continue Shopping</Link>
                    </div>
                </div>
            ) : (
                <Link to="/customer/orders" className="flex items-center gap-2 text-gray-500 hover:text-primary transition-colors w-fit mb-8">
                    <ArrowLeft weight="bold" />
                    <span>Back to Orders</span>
                </Link>
            )}

            <div className="bg-white rounded-[2rem] p-6 md:p-8 shadow-sm border border-gray-100 mb-8">
                <div className="flex flex-col md:flex-row justify-between md:items-end mb-8 gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-1">Order #{order._id.slice(-6).toUpperCase()}</h2>
                        <p className="text-gray-500">Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true })}</p>
                    </div>
                    <div className="text-left md:text-right">
                        <p className="text-sm text-gray-500 mb-1">Total Amount</p>
                        <p className="text-3xl font-black text-gray-900">₹{order.totalAmount}</p>
                        {order.orderStatus === 'pending' && (
                            <button 
                                onClick={() => setShowCancelModal(true)}
                                className="mt-3 px-6 py-2.5 bg-red-50 text-red-600 border border-red-200 font-bold rounded-xl hover:bg-red-100 transition-colors flex items-center justify-center gap-2 w-full md:w-auto"
                            >
                                Cancel Order
                            </button>
                        )}
                    </div>
                </div>

                {/* Timeline */}
                <div className="mb-10 pt-4">
                    <h3 className="font-bold text-gray-900 mb-6">Order Status</h3>
                    {order.orderStatus === 'cancelled' ? (
                        <div className="flex items-center gap-3 text-red-500 bg-red-50 p-4 rounded-xl">
                            <WarningCircle size={24} weight="fill" />
                            <span className="font-bold text-lg">Order Cancelled</span>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-8">
                            {order.orderStatus === 'delivered' && (
                                <div className="flex items-center justify-center gap-3 text-green-700 bg-green-50 border border-green-200 p-4 rounded-2xl shadow-sm">
                                    <CheckCircle size={28} weight="fill" />
                                    <span className="font-bold text-lg">✓ Order Delivered Successfully</span>
                                </div>
                            )}
                            <div className="relative">
                                <div className="absolute left-6 top-6 bottom-6 w-1 bg-gray-100 rounded-full md:left-auto md:top-6 md:bottom-auto md:right-6 md:h-1 md:w-[calc(100%-3rem)] z-0"></div>
                            <div className="flex flex-col md:flex-row justify-between gap-6 md:gap-4 relative z-10">
                                {orderStatuses.map((status, idx) => {
                                    const isCompleted = idx <= currentStatusIndex;
                                    const isCurrent = idx === currentStatusIndex;
                                    return (
                                        <div key={status.key} className="flex md:flex-col items-center gap-4 md:gap-2 relative">
                                            <div className={`w-12 h-12 rounded-full flex items-center justify-center border-4 border-white shadow-sm shrink-0 transition-colors ${
                                                isCompleted ? 'bg-primary text-white' : 'bg-gray-100 text-gray-400'
                                            } ${isCurrent ? 'ring-4 ring-primary-light' : ''}`}>
                                                {status.icon}
                                            </div>
                                            <span className={`font-medium text-sm md:text-center ${isCompleted ? 'text-gray-900' : 'text-gray-400'}`}>
                                                {status.label}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                    {/* Order Items */}
                    <div>
                        <h3 className="font-bold text-gray-900 mb-4 border-b border-gray-100 pb-2">Items ({order.items.length})</h3>
                        <div className="space-y-4">
                            {order.items.map((item) => (
                                <div key={item._id} className="flex gap-4">
                                    <div className="w-16 h-16 bg-gray-50 rounded-lg overflow-hidden shrink-0 border border-gray-100">
                                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="flex flex-col justify-center flex-1">
                                        <Link to={`/customer/products/${item.product}`} className="font-medium text-sm text-gray-900 hover:text-primary transition-colors line-clamp-1">{item.name}</Link>
                                        <div className="flex justify-between mt-1">
                                            <span className="text-xs text-gray-500">Qty: {item.quantity} x ₹{item.price}</span>
                                            <span className="font-bold text-sm text-gray-900">₹{item.subtotal}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Summary & Details */}
                    <div>
                        <h3 className="font-bold text-gray-900 mb-4 border-b border-gray-100 pb-2">Order Summary</h3>
                        <div className="space-y-3 mb-8 text-sm">
                            <div className="flex justify-between text-gray-600">
                                <span>Subtotal</span>
                                <span>₹{order.subtotal}</span>
                            </div>
                            <div className="flex justify-between text-gray-600">
                                <span>Delivery Fee</span>
                                <span>₹{order.deliveryFee}</span>
                            </div>
                            <div className="flex justify-between text-gray-900 font-bold pt-3 border-t border-gray-100">
                                <span>Total</span>
                                <span>₹{order.totalAmount}</span>
                            </div>
                        </div>

                        <h3 className="font-bold text-gray-900 mb-4 border-b border-gray-100 pb-2">Delivery Details</h3>
                        <div className="text-sm text-gray-600 space-y-1 mb-8">
                            <p className="font-bold text-gray-900">{order.deliveryAddress.fullName}</p>
                            <p>{order.deliveryAddress.phone}</p>
                            <p>{order.deliveryAddress.address}</p>
                            <p>{order.deliveryAddress.city}, {order.deliveryAddress.state} - {order.deliveryAddress.pincode}</p>
                        </div>

                        <h3 className="font-bold text-gray-900 mb-4 border-b border-gray-100 pb-2">Payment Details</h3>
                        <div className="text-sm text-gray-600 space-y-2">
                            <div className="flex justify-between">
                                <span>Method</span>
                                <span className="font-medium text-gray-900">{order.paymentMethod === 'COD' ? 'Cash on Delivery' : 'Online Payment'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Status</span>
                                <span className={`font-bold uppercase ${order.paymentStatus === 'paid' ? 'text-green-500' : 'text-yellow-500'}`}>
                                    {order.paymentStatus}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Cancel Modal */}
            {showCancelModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl p-6 md:p-8 max-w-sm w-full shadow-2xl animate-fade-in-up">
                        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <WarningCircle size={32} weight="fill" />
                        </div>
                        <h3 className="text-xl font-black text-gray-900 text-center mb-2">Cancel Order?</h3>
                        <p className="text-gray-500 text-center mb-8">
                            Are you sure you want to cancel order #{order._id.slice(-6).toUpperCase()}?<br/><br/>This action cannot be undone.
                        </p>
                        <div className="flex flex-col gap-3">
                            <button 
                                onClick={handleCancelOrder}
                                disabled={cancelling}
                                className="w-full py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {cancelling ? (
                                    <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Cancelling...</>
                                ) : 'Cancel Order'}
                            </button>
                            <button 
                                onClick={() => setShowCancelModal(false)}
                                disabled={cancelling}
                                className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-colors disabled:opacity-50"
                            >
                                Keep Order
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Toast */}
            {toast && (
                <div className="fixed bottom-8 left-1/2 -translate-x-1/2 px-6 py-3 bg-gray-900 text-white rounded-full font-medium shadow-2xl flex items-center gap-3 z-50 animate-fade-in-up">
                    <CheckCircle size={20} weight="fill" className="text-green-400" />
                    {toast}
                </div>
            )}
        </div>
    );
};

export default OrderDetailsPage;
