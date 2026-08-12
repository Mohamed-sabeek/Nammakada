import { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { ShoppingBag, ShoppingCart, Receipt, User as UserIcon, SignOut, List, X, Bell, CaretLeft, CaretRight } from '@phosphor-icons/react';
import logo from '../assets/logo.png';
import smallLogo from '../assets/small-logo.png';
import NotificationBell from './ui/NotificationBell';
import ProfileAvatar from './ui/ProfileAvatar';
import { useNotifications } from '../context/NotificationContext';

const CustomerLayout = () => {
    const { user, logout } = useAuth();
    const { itemCount } = useCart();
    const { unreadCount } = useNotifications();
    const navigate = useNavigate();
    
    // Desktop Collapse State
    const [isCollapsed, setIsCollapsed] = useState(() => {
        const saved = localStorage.getItem('nammaKada_sidebar_collapsed');
        return saved === 'true';
    });

    // Mobile Menu State
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        localStorage.setItem('nammaKada_sidebar_collapsed', isCollapsed);
    }, [isCollapsed]);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navItems = [
        { path: '/customer/products', name: 'Products', icon: <ShoppingBag size={22} weight="fill" /> },
        { path: '/customer/cart', name: 'Cart', icon: <ShoppingCart size={22} weight="fill" />, badge: itemCount },
        { path: '/customer/orders', name: 'Orders', icon: <Receipt size={22} weight="fill" /> },
        { path: '/customer/notifications', name: 'Notifications', icon: <Bell size={22} weight="fill" />, badge: unreadCount },
        { path: '/customer/profile', name: 'Profile', icon: <UserIcon size={22} weight="fill" /> },
    ];

    const getBadgeDisplay = (count) => {
        if (!count || count <= 0) return null;
        return count > 99 ? '99+' : count;
    };

    return (
        <div className="min-h-screen bg-bg flex">
            {/* Desktop Sidebar */}
            <aside 
                className={`hidden md:flex flex-col bg-white border-r border-gray-200 sticky top-0 h-screen transition-all duration-200 ease-in-out z-20 ${
                    isCollapsed ? 'w-[76px]' : 'w-[260px]'
                }`}
            >
                {/* Header / Logo Area */}
                <div className={`px-4 py-1 flex items-center border-b border-gray-100 ${isCollapsed ? 'justify-center' : 'justify-between'} h-[72px]`}>
                    {!isCollapsed ? (
                        <div className="flex items-center overflow-hidden">
                            <img src={logo} alt="NammaKada Logo" className="w-[240px] h-[64px] object-contain" />
                        </div>
                    ) : (
                        <div className="flex items-center justify-center shrink-0">
                            <img src={smallLogo} alt="N" className="w-[40px] h-[40px] object-contain" />
                        </div>
                    )}
                    
                    <button 
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className={`text-gray-400 hover:text-primary transition-colors p-1 rounded-lg hover:bg-gray-50 ${isCollapsed ? 'absolute -right-3 bg-white border border-gray-200 shadow-sm rounded-full w-6 h-6 flex items-center justify-center hover:scale-110 z-50' : ''}`}
                        title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                    >
                        {isCollapsed ? <CaretRight size={16} weight="bold" /> : <CaretLeft size={20} weight="bold" />}
                    </button>
                </div>
                
                {/* Navigation Items */}
                <nav className="flex-1 py-6 px-3 space-y-2 overflow-y-auto overflow-x-hidden scrollbar-hide">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.name}
                            to={item.path}
                            title={isCollapsed ? item.name : undefined}
                            className={({ isActive }) => 
                                `flex items-center px-[14px] py-[12px] h-[48px] rounded-xl font-semibold text-[15px] transition-all duration-150 ${
                                    isActive 
                                        ? 'bg-[#DCFCE7] text-[#15803D]' 
                                        : 'text-gray-600 hover:bg-[#F8FAFC] hover:text-gray-900'
                                } ${isCollapsed ? 'justify-center' : 'justify-between'}`
                            }
                        >
                            {({ isActive }) => (
                                <>
                                    <div className="flex items-center gap-3">
                                        <div className={`w-[22px] flex items-center justify-center ${isActive ? 'text-[#16A34A]' : ''}`}>
                                            {item.icon}
                                        </div>
                                        {!isCollapsed && <span className="whitespace-nowrap">{item.name}</span>}
                                    </div>
                                    
                                    {/* Badges */}
                                    {getBadgeDisplay(item.badge) && (
                                        isCollapsed ? (
                                            <div className="absolute top-2 right-2 w-2 h-2 bg-[#16A34A] rounded-full ring-2 ring-white"></div>
                                        ) : (
                                            <span className="bg-[#16A34A] text-white text-[11px] font-bold h-6 min-w-[24px] px-1.5 flex items-center justify-center rounded-full">
                                                {getBadgeDisplay(item.badge)}
                                            </span>
                                        )
                                    )}
                                </>
                            )}
                        </NavLink>
                    ))}
                </nav>

                {/* Bottom Profile / Logout Area */}
                <div className="p-3 border-t border-gray-100 mt-auto flex flex-col gap-2">
                    <Link 
                        to="/customer/profile"
                        title={isCollapsed ? (user?.name || 'Profile') : undefined}
                        className={`flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-gray-50 transition-colors ${isCollapsed ? 'justify-center' : ''}`}
                    >
                        <ProfileAvatar user={user} size={isCollapsed ? 'medium' : 'small'} />
                        {!isCollapsed && (
                            <div className="flex flex-col overflow-hidden">
                                <span className="text-[14px] font-bold text-gray-900 truncate leading-tight">{user?.name}</span>
                                <span className="text-[12px] text-gray-500 font-medium">Customer</span>
                            </div>
                        )}
                    </Link>
                    
                    <button 
                        onClick={handleLogout}
                        title={isCollapsed ? "Logout" : undefined}
                        className={`flex items-center gap-3 px-[14px] py-[10px] h-[44px] rounded-xl font-semibold text-red-500 hover:bg-red-50 transition-colors ${isCollapsed ? 'justify-center' : ''}`}
                    >
                        <div className="w-[22px] flex items-center justify-center">
                            <SignOut size={22} weight="bold" />
                        </div>
                        {!isCollapsed && <span>Logout</span>}
                    </button>
                </div>
            </aside>

            {/* Main Content & Mobile Header Wrapper */}
            <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto overflow-x-hidden relative">
                
                {/* Mobile Header */}
                <header className="md:hidden bg-white border-b border-gray-100 p-4 flex items-center justify-between sticky top-0 z-40">
                    <div className="flex items-center">
                        <img src={logo} alt="NammaKada Logo" className="h-8 w-auto object-contain" />
                    </div>
                    <div className="flex items-center gap-2">
                        <NotificationBell placement="right" />
                        <Link to="/customer/cart" className="relative text-gray-700 p-2">
                            <ShoppingCart size={28} />
                            {itemCount > 0 && (
                                <span className="absolute -top-1 -right-1 bg-primary text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center">
                                    {getBadgeDisplay(itemCount)}
                                </span>
                            )}
                        </Link>
                        <button onClick={() => setIsMobileMenuOpen(true)} className="text-gray-700 ml-2">
                            <List size={28} weight="bold" />
                        </button>
                    </div>
                </header>

                {/* Mobile Drawer Overlay */}
                {isMobileMenuOpen && (
                    <div className="md:hidden fixed inset-0 z-50 flex">
                        {/* Backdrop */}
                        <div 
                            className="absolute inset-0 bg-black/50 transition-opacity" 
                            onClick={() => setIsMobileMenuOpen(false)}
                        ></div>
                        
                        {/* Drawer */}
                        <aside className="w-[280px] bg-white h-full flex flex-col relative z-10 animate-slide-right">
                            <div className="p-4 flex items-center justify-between border-b border-gray-100 h-[72px]">
                                <img src={logo} alt="NammaKada Logo" className="w-[120px] h-auto object-contain ml-2" />
                                <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg">
                                    <X size={24} weight="bold" />
                                </button>
                            </div>

                            <nav className="flex-1 py-6 px-4 space-y-2 overflow-y-auto">
                                {navItems.map((item) => (
                                    <NavLink
                                        key={item.name}
                                        to={item.path}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className={({ isActive }) => 
                                            `flex items-center justify-between px-4 py-3.5 h-[52px] rounded-xl font-semibold text-[16px] transition-colors ${
                                                isActive 
                                                    ? 'bg-[#DCFCE7] text-[#15803D]' 
                                                    : 'text-gray-700 hover:bg-[#F8FAFC]'
                                            }`
                                        }
                                    >
                                        {({ isActive }) => (
                                            <>
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-[24px] flex items-center justify-center ${isActive ? 'text-[#16A34A]' : ''}`}>
                                                        {item.icon}
                                                    </div>
                                                    <span>{item.name}</span>
                                                </div>
                                                {getBadgeDisplay(item.badge) && (
                                                    <span className="bg-[#16A34A] text-white text-[11px] font-bold h-6 min-w-[24px] px-1.5 flex items-center justify-center rounded-full">
                                                        {getBadgeDisplay(item.badge)}
                                                    </span>
                                                )}
                                            </>
                                        )}
                                    </NavLink>
                                ))}
                            </nav>

                            <div className="p-4 border-t border-gray-100 mt-auto flex flex-col gap-2">
                                <Link 
                                    to="/customer/profile"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-gray-50 transition-colors"
                                >
                                    <ProfileAvatar user={user} size="medium" />
                                    <div className="flex flex-col overflow-hidden">
                                        <span className="text-[15px] font-bold text-gray-900 truncate leading-tight">{user?.name}</span>
                                        <span className="text-[13px] text-gray-500 font-medium">Customer</span>
                                    </div>
                                </Link>
                                <button 
                                    onClick={handleLogout}
                                    className="flex items-center justify-center gap-3 w-full px-4 py-3.5 h-[52px] rounded-xl font-bold text-red-600 bg-red-50 hover:bg-red-100 transition-colors"
                                >
                                    <SignOut size={24} weight="bold" />
                                    <span>Logout</span>
                                </button>
                            </div>
                        </aside>
                    </div>
                )}

                {/* Main Content */}
                <main className="flex-1 w-full relative z-10">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default CustomerLayout;
