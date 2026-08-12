import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';
import { 
    Bell, 
    ShoppingBag, 
    CheckCircle, 
    Package, 
    Truck, 
    XCircle, 
    Warning, 
    CurrencyInr 
} from '@phosphor-icons/react';
import PageHeader from '../../components/ui/PageHeader';

const NotificationsPage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { 
        notifications, 
        fetchNotifications, 
        markAsRead, 
        markAllAsRead, 
        loading 
    } = useNotifications();

    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    const isAdmin = user?.role === 'admin';
    const basePath = isAdmin ? '/admin' : '/customer';

    useEffect(() => {
        // Fetch first page on mount
        loadMore(1);
    }, []);

    const loadMore = async (pageNum) => {
        const data = await fetchNotifications(pageNum, 10);
        if (data && data.notifications.length < 10) {
            setHasMore(false);
        }
        if (pageNum > 1) {
            setPage(pageNum);
        }
    };

    const getIconConfig = (type) => {
        switch(type) {
            case 'order_placed': return { icon: <ShoppingBag size={26} weight="fill" />, bg: 'bg-[#EFF6FF]', color: 'text-[#3B82F6]' };
            case 'order_confirmed': return { icon: <CheckCircle size={26} weight="fill" />, bg: 'bg-[#F0FDF4]', color: 'text-[#16A34A]' };
            case 'order_packed': return { icon: <Package size={26} weight="fill" />, bg: 'bg-[#FAF5FF]', color: 'text-[#9333EA]' };
            case 'order_out_for_delivery': return { icon: <Truck size={26} weight="fill" />, bg: 'bg-[#FFF7ED]', color: 'text-[#EA580C]' };
            case 'order_delivered': return { icon: <CheckCircle size={26} weight="fill" />, bg: 'bg-[#F0FDF4]', color: 'text-[#16A34A]' };
            case 'order_cancelled': return { icon: <XCircle size={26} weight="fill" />, bg: 'bg-[#FEF2F2]', color: 'text-[#EF4444]' };
            case 'low_stock_alert':
            case 'product_out_of_stock': return { icon: <Warning size={26} weight="fill" />, bg: 'bg-[#FFF7ED]', color: 'text-[#F97316]' };
            case 'payment_received': return { icon: <CurrencyInr size={26} weight="bold" />, bg: 'bg-[#F0FDF4]', color: 'text-[#16A34A]' };
            default: return { icon: <Bell size={26} weight="fill" />, bg: 'bg-gray-100', color: 'text-gray-500' };
        }
    };

    const handleNotificationClick = async (notification) => {
        if (!notification.isRead) {
            await markAsRead(notification._id);
        }
        if (notification.type.includes('stock')) {
            navigate(`${basePath}/products`);
        } else if (notification.order) {
            const orderId = typeof notification.order === 'object' ? notification.order._id : notification.order;
            navigate(`${basePath}/orders/${orderId}`);
        }
    };

    return (
        <div className="p-6 md:p-8 max-w-4xl mx-auto pb-24">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-8 gap-4">
                <div className="flex-1">
                    <PageHeader 
                        title="Notifications" 
                        subtitle="Stay updated with orders, inventory, and store activity." 
                    />
                </div>
                <button 
                    onClick={markAllAsRead}
                    className="px-4 py-2 bg-green-50 text-green-700 font-bold rounded-xl hover:bg-green-100 transition-colors"
                >
                    Mark all as read
                </button>
            </div>

            <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
                {notifications.length > 0 ? (
                    <div className="flex flex-col">
                        {notifications.map((notification) => {
                            const iconConfig = getIconConfig(notification.type);
                            return (
                                <div 
                                    key={notification._id}
                                    onClick={() => handleNotificationClick(notification)}
                                    className={`p-6 cursor-pointer flex items-start gap-5 border-b border-[#F1F5F3] last:border-0 transition-colors ${!notification.isRead ? 'bg-[#F0FDF4] hover:bg-[#E8F8EE]' : 'bg-white hover:bg-[#F8FAF9]'}`}
                                >
                                    <div className={`w-[56px] h-[56px] min-w-[56px] min-h-[56px] flex-shrink-0 flex items-center justify-center rounded-[16px] ${iconConfig.bg} ${iconConfig.color}`}>
                                        {iconConfig.icon}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start gap-4 mb-2">
                                            <h3 className={`text-[17px] font-[700] leading-tight pt-[2px] ${!notification.isRead ? 'text-[#17201B]' : 'text-gray-700'}`}>
                                                {notification.title}
                                            </h3>
                                            <div className="flex flex-col items-end gap-2 shrink-0">
                                                <span className="text-[13.5px] font-medium text-[#94A3B8]">
                                                    {new Date(notification.createdAt).toLocaleDateString()} at {new Date(notification.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
                                                </span>
                                                {!notification.isRead && (
                                                    <span className="px-2.5 py-1 bg-[#16A34A] text-white text-[11px] font-bold rounded-md tracking-wide">
                                                        NEW
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <p className={`text-[15px] leading-[1.5] break-words ${!notification.isRead ? 'text-[#475569]' : 'text-gray-500'}`}>
                                            {notification.message}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="p-16 flex flex-col items-center justify-center text-center">
                        <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                            <Bell size={48} className="text-gray-400" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 mb-2">No notifications yet</h2>
                        <p className="text-gray-500">When you get updates, they'll show up here.</p>
                    </div>
                )}
            </div>

            {hasMore && notifications.length > 0 && (
                <div className="mt-8 flex justify-center">
                    <button 
                        onClick={() => loadMore(page + 1)}
                        disabled={loading}
                        className="px-6 py-3 bg-white border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-colors shadow-sm disabled:opacity-50"
                    >
                        {loading ? 'Loading...' : 'Load More'}
                    </button>
                </div>
            )}
        </div>
    );
};

export default NotificationsPage;
