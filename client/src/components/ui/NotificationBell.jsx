import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
import { useNotifications } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';

const NotificationBell = ({ placement = 'right' }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();
    
    const { user } = useAuth();
    const { 
        notifications, 
        unreadCount, 
        fetchNotifications, 
        markAsRead, 
        markAllAsRead,
        loading
    } = useNotifications();

    const isAdmin = user?.role === 'admin';
    const basePath = isAdmin ? '/admin' : '/customer';

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        const handleEscape = (e) => {
            if (e.key === 'Escape') setIsOpen(false);
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            document.addEventListener('keydown', handleEscape);
            // Fetch latest when opened
            fetchNotifications(1, 5); 
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleEscape);
        };
    }, [isOpen, fetchNotifications]);

    const getIconConfig = (type) => {
        switch(type) {
            case 'order_placed': return { icon: <ShoppingBag size={22} weight="fill" />, bg: 'bg-[#EFF6FF]', color: 'text-[#3B82F6]' };
            case 'order_confirmed': return { icon: <CheckCircle size={22} weight="fill" />, bg: 'bg-[#F0FDF4]', color: 'text-[#16A34A]' };
            case 'order_packed': return { icon: <Package size={22} weight="fill" />, bg: 'bg-[#FAF5FF]', color: 'text-[#9333EA]' };
            case 'order_out_for_delivery': return { icon: <Truck size={22} weight="fill" />, bg: 'bg-[#FFF7ED]', color: 'text-[#EA580C]' };
            case 'order_delivered': return { icon: <CheckCircle size={22} weight="fill" />, bg: 'bg-[#F0FDF4]', color: 'text-[#16A34A]' };
            case 'order_cancelled': return { icon: <XCircle size={22} weight="fill" />, bg: 'bg-[#FEF2F2]', color: 'text-[#EF4444]' };
            case 'low_stock_alert':
            case 'product_out_of_stock': return { icon: <Warning size={22} weight="fill" />, bg: 'bg-[#FFF7ED]', color: 'text-[#F97316]' };
            case 'payment_received': return { icon: <CurrencyInr size={22} weight="bold" />, bg: 'bg-[#F0FDF4]', color: 'text-[#16A34A]' };
            default: return { icon: <Bell size={22} weight="fill" />, bg: 'bg-gray-100', color: 'text-gray-500' };
        }
    };

    const handleNotificationClick = async (notification) => {
        if (!notification.isRead) {
            await markAsRead(notification._id);
        }
        setIsOpen(false);

        // Navigate based on type and role
        if (notification.type.includes('stock')) {
            navigate(`${basePath}/products`);
        } else if (notification.order) {
            // order is populated or just an ID
            const orderId = typeof notification.order === 'object' ? notification.order._id : notification.order;
            navigate(`${basePath}/orders/${orderId}`);
        }
    };

    const formatTimeAgo = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);
        
        if (diffInSeconds < 60) return 'Just now';
        const diffInMinutes = Math.floor(diffInSeconds / 60);
        if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) return `${diffInHours}h ago`;
        const diffInDays = Math.floor(diffInHours / 24);
        if (diffInDays === 1) return 'Yesterday';
        if (diffInDays < 7) return `${diffInDays}d ago`;
        
        return date.toLocaleDateString();
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                aria-label="Notifications"
            >
                <Bell size={24} weight={unreadCount > 0 ? "fill" : "regular"} className={unreadCount > 0 ? "text-primary" : ""} />
                
                {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 flex h-4 w-4">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 text-[9px] font-bold text-white items-center justify-center">
                            {unreadCount > 99 ? '99+' : unreadCount}
                        </span>
                    </span>
                )}
            </button>

            {isOpen && (
                <div className={`absolute ${placement === 'right' ? 'right-0 -mr-2 sm:mr-0' : 'left-0'} mt-3 w-[calc(100vw-32px)] sm:w-[400px] max-w-[420px] bg-white rounded-2xl shadow-[0_12px_35px_rgba(0,0,0,0.08)] border border-gray-200 z-50 overflow-hidden flex flex-col max-h-[85vh]`}>
                    <div className="p-5 border-b border-[#F1F5F3] flex items-center justify-between bg-white shrink-0">
                        <h3 className="font-bold text-[#17201B] text-[20px]">Notifications</h3>
                        {unreadCount > 0 && (
                            <button 
                                onClick={markAllAsRead}
                                className="text-[14.5px] font-medium text-[#16A34A] hover:text-[#15803D] transition-colors"
                            >
                                Mark all as read
                            </button>
                        )}
                    </div>
                    
                    <div className="overflow-y-auto flex-1 bg-gray-50/50">
                        {loading && notifications.length === 0 ? (
                            <div className="p-8 text-center text-gray-500">
                                <div className="w-6 h-6 border-2 border-[#16A34A] border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                                Loading...
                            </div>
                        ) : notifications.length > 0 ? (
                            <div className="flex flex-col">
                                {notifications.slice(0, 5).map((notification) => {
                                    const iconConfig = getIconConfig(notification.type);
                                    return (
                                        <div 
                                            key={notification._id}
                                            onClick={() => handleNotificationClick(notification)}
                                            className={`py-[18px] px-5 cursor-pointer flex items-start gap-[14px] border-b border-[#F1F5F3] last:border-0 transition-colors ${!notification.isRead ? 'bg-[#F0FDF4] hover:bg-[#E8F8EE]' : 'bg-white hover:bg-[#F8FAF9]'}`}
                                        >
                                            <div className={`w-[48px] h-[48px] min-w-[48px] min-h-[48px] flex-shrink-0 flex items-center justify-center rounded-[14px] ${iconConfig.bg} ${iconConfig.color}`}>
                                                {iconConfig.icon}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-start gap-2">
                                                    <p className="text-[15px] font-[700] text-[#17201B] leading-tight pt-[2px]">
                                                        {notification.title}
                                                    </p>
                                                    {!notification.isRead && (
                                                        <span className="w-[9px] h-[9px] rounded-full bg-[#16A34A] shrink-0 mt-[3px]"></span>
                                                    )}
                                                </div>
                                                <p className="text-[14px] leading-[1.45] text-[#475569] mt-[5px] break-words">
                                                    {notification.message}
                                                </p>
                                                <p className="text-[12.5px] font-medium text-[#94A3B8] mt-[7px]">
                                                    {formatTimeAgo(notification.createdAt)}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="p-10 flex flex-col items-center justify-center text-center bg-white h-full">
                                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                                    <Bell size={32} className="text-gray-400" />
                                </div>
                                <h4 className="font-bold text-gray-900 mb-1">No notifications yet</h4>
                                <p className="text-sm text-gray-500">You're all caught up!</p>
                            </div>
                        )}
                    </div>
                    
                    <div className="border-t border-[#F1F5F3] bg-white shrink-0">
                        <Link 
                            to={`${basePath}/notifications`}
                            onClick={() => setIsOpen(false)}
                            className="flex items-center justify-center w-full h-[54px] text-[14.5px] font-[600] text-[#15803D] hover:text-[#16A34A] transition-colors hover:bg-[#F8FAF9]"
                        >
                            View all notifications →
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationBell;
