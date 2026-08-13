import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Check, CheckCircle, WarningCircle, Truck, Package, Clock, CaretDown, Receipt, FileText } from '@phosphor-icons/react';
import api from '../../services/api';
import CustomSelect from '../../components/ui/CustomSelect';
import PageHeader from '../../components/ui/PageHeader';

const STATUSES = [
    { id: 'pending', label: 'Pending' },
    { id: 'confirmed', label: 'Confirmed' },
    { id: 'packed', label: 'Packed' },
    { id: 'out_for_delivery', label: 'Out for Delivery' },
    { id: 'delivered', label: 'Delivered' },
    { id: 'cancelled', label: 'Cancelled' }
];

const AdminOrderDetailsPage = () => {
    const { id } = useParams();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [toast, setToast] = useState(null);

    useEffect(() => {
        fetchOrder();
    }, [id]);

    const fetchOrder = async () => {
        try {
            const { data } = await api.get(`/admin/orders/${id}`);
            setOrder(data.data);
        } catch (err) {
            console.error('Failed to fetch order');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (newStatus) => {
        if (newStatus === order.orderStatus) return;
        setUpdating(true);
        try {
            const { data } = await api.put(`/admin/orders/${id}/status`, { orderStatus: newStatus });
            setOrder(data.data);
            showToast('Order status updated successfully', 'success');
        } catch (err) {
            showToast('Failed to update status', 'error');
        } finally {
            setUpdating(false);
        }
    };

    const handlePaymentStatusChange = async (newPaymentStatus) => {
        if (newPaymentStatus === order.paymentStatus) return;
        setUpdating(true);
        try {
            const { data } = await api.put(`/admin/orders/${id}/status`, { paymentStatus: newPaymentStatus });
            setOrder(data.data);
            showToast('Payment status updated', 'success');
        } catch (err) {
            showToast('Failed to update payment status', 'error');
        } finally {
            setUpdating(false);
        }
    };

    const showToast = (message, type) => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    if (loading || !order) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto space-y-6 pb-24">
            <div className="flex flex-col items-start mb-2">
                <Link to="/admin/orders" className="text-sm font-bold text-gray-500 hover:text-green-600 flex items-center gap-2 mb-4 transition-colors">
                    <ArrowLeft size={16} weight="bold" /> Back to Orders
                </Link>
                <PageHeader 
                    title="Order Details" 
                    subtitle="View customer information, products, payment, and order status." 
                />
            </div>

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div>
                    <h2 className="text-2xl font-black text-gray-900 mb-1">Order #{order._id.slice(-6).toUpperCase()}</h2>
                    <p className="text-gray-500 text-sm">
                        Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true })}
                    </p>
                </div>
                
                <div className="flex items-center gap-4 w-full md:w-auto">
                    {order.orderStatus === 'cancelled' ? (
                        <div className="w-full md:w-auto px-4 py-2.5 rounded-xl font-bold border-2 bg-red-50 text-red-700 border-red-200 flex items-center gap-2 cursor-not-allowed" title="Order is cancelled and locked">
                            <WarningCircle size={20} weight="fill" /> Cancelled
                        </div>
                    ) : order.orderStatus === 'delivered' ? (
                        <div className="w-full md:w-auto px-4 py-2.5 rounded-xl font-bold border-2 bg-green-50 text-green-700 border-green-200 flex items-center gap-2 cursor-not-allowed" title="Order status is final">
                            <CheckCircle size={20} weight="fill" /> Delivered
                        </div>
                    ) : (
                        <div className="w-full md:w-48">
                            <CustomSelect
                                value={order.orderStatus}
                                onChange={(value) => handleStatusChange(value)}
                                options={STATUSES.map(s => ({ value: s.id, label: s.label }))}
                                className="[&>button]:font-bold"
                            />
                        </div>
                    )}
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Left: Customer & Items */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Items */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <h3 className="font-bold text-gray-900 mb-6 text-lg">Order Items ({order.items.length})</h3>
                        <div className="space-y-4">
                            {order.items.map(item => (
                                <div key={item._id} className="flex gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                                    <img src={item.image} className="w-20 h-20 rounded-lg object-cover bg-white" />
                                    <div className="flex-1 flex flex-col justify-center">
                                        <p className="font-bold text-gray-900">{item.name}</p>
                                        <div className="flex justify-between items-end mt-2">
                                            <p className="text-sm text-gray-500">Qty: {item.quantity} × ₹{item.price}</p>
                                            <p className="font-black text-gray-900 text-lg">₹{item.subtotal}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Customer Info */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 grid md:grid-cols-2 gap-6">
                        <div>
                            <h3 className="font-bold text-gray-900 mb-4 text-sm uppercase tracking-wider text-gray-400">Customer Details</h3>
                            <div className="space-y-2 text-sm text-gray-700 font-medium">
                                <p className="text-gray-900 text-base">{order.customer?.name}</p>
                                <p>{order.customer?.email}</p>
                                <p>{order.customer?.phone}</p>
                            </div>
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900 mb-4 text-sm uppercase tracking-wider text-gray-400">Delivery Address</h3>
                            <div className="space-y-1 text-sm text-gray-700 font-medium">
                                <p className="text-gray-900">{order.deliveryAddress.fullName}</p>
                                <p>{order.deliveryAddress.phone}</p>
                                <p>{order.deliveryAddress.address}</p>
                                <p>{order.deliveryAddress.city}, {order.deliveryAddress.state} - {order.deliveryAddress.pincode}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right: Summary & Payment */}
                <div className="space-y-6">
                    {/* Summary */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <h3 className="font-bold text-gray-900 mb-6 text-lg">Order Summary</h3>
                        <div className="space-y-4 text-sm font-medium text-gray-600">
                            <div className="flex justify-between">
                                <span>Subtotal</span>
                                <span>₹{order.subtotal}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Delivery Fee</span>
                                <span>₹{order.deliveryFee}</span>
                            </div>
                            <div className="pt-4 border-t border-gray-100 flex justify-between items-center text-gray-900">
                                <span className="font-bold">Total Amount</span>
                                <span className="text-2xl font-black">₹{order.totalAmount}</span>
                            </div>
                        </div>
                    </div>

                    {/* Payment */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <h3 className="font-bold text-gray-900 mb-6 text-lg">Payment Info</h3>
                        <div className="space-y-6">
                            <div>
                                <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Method</p>
                                <div className="inline-block px-3 py-1 bg-gray-100 rounded-lg text-sm font-bold text-gray-700">
                                    {order.paymentMethod === 'COD' ? 'Cash on Delivery' : 'Online Payment'}
                                </div>
                            </div>
                            <div>
                                <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Status</p>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handlePaymentStatusChange('pending')}
                                        disabled={updating || order.paymentStatus === 'pending' || order.orderStatus === 'delivered' || order.orderStatus === 'cancelled'}
                                        className={`flex-1 py-2 rounded-xl font-bold text-sm transition-colors border-2 ${
                                            order.paymentStatus === 'pending' 
                                            ? 'bg-amber-50 text-amber-600 border-amber-200' 
                                            : 'bg-white text-gray-500 border-gray-200 hover:border-amber-200 hover:text-amber-600 disabled:opacity-50 disabled:hover:border-gray-200 disabled:hover:text-gray-500'
                                        }`}
                                    >
                                        Pending
                                    </button>
                                    <button
                                        onClick={() => handlePaymentStatusChange('paid')}
                                        disabled={updating || order.paymentStatus === 'paid' || order.orderStatus === 'delivered' || order.orderStatus === 'cancelled'}
                                        className={`flex-1 flex items-center justify-center gap-1 py-2 rounded-xl font-bold text-sm transition-colors border-2 ${
                                            order.paymentStatus === 'paid' 
                                            ? 'bg-green-50 text-green-600 border-green-200' 
                                            : 'bg-white text-gray-500 border-gray-200 hover:border-green-200 hover:text-green-600 disabled:opacity-50 disabled:hover:border-gray-200 disabled:hover:text-gray-500'
                                        }`}
                                    >
                                        <Check weight="bold" /> Paid
                                    </button>
                                </div>
                            </div>
                            
                            {order.paymentMethod === 'ONLINE' && (
                                <div className="space-y-4 pt-4 border-t border-gray-100">
                                    {order.razorpayPaymentId && (
                                        <div>
                                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Razorpay Payment ID</p>
                                            <p className="text-sm font-medium text-gray-900 break-all">{order.razorpayPaymentId}</p>
                                        </div>
                                    )}
                                    {order.razorpayOrderId && (
                                        <div>
                                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Razorpay Order ID</p>
                                            <p className="text-sm font-medium text-gray-900 break-all">{order.razorpayOrderId}</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Toast */}
            {toast && (
                <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 px-6 py-3 rounded-full font-medium shadow-2xl flex items-center gap-3 z-50 animate-fade-in-up ${
                    toast.type === 'success' ? 'bg-gray-900 text-white' : 'bg-red-500 text-white'
                }`}>
                    {toast.type === 'success' ? <CheckCircle size={20} weight="fill" className="text-green-400" /> : <WarningCircle size={20} weight="fill" />}
                    {toast.message}
                </div>
            )}
        </div>
    );
};

export default AdminOrderDetailsPage;
