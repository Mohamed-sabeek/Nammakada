import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
    Package, 
    Receipt, 
    Users, 
    CurrencyInr,
    WarningCircle,
    ArrowRight,
    CheckCircle,
    Plus,
    ChartBar
} from '@phosphor-icons/react';
import api from '../../services/api';
import PageHeader from '../../components/ui/PageHeader';

const DashboardPage = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [recentOrders, setRecentOrders] = useState([]);
    const [lowStock, setLowStock] = useState([]);
    const [orderOverview, setOrderOverview] = useState({
        pending: 0,
        confirmed: 0,
        packed: 0,
        out_for_delivery: 0,
        delivered: 0,
        cancelled: 0
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // Fetch stats
                const statsRes = await api.get('/admin/dashboard/stats');
                setStats(statsRes.data.data);

                // Fetch recent orders (limit=100 for overview approximation)
                const ordersRes = await api.get('/admin/orders?limit=100');
                const fetchedOrders = ordersRes.data.data.orders || [];
                setRecentOrders(fetchedOrders.slice(0, 5));

                // Calculate order overview from the fetched orders
                const overview = { pending: 0, confirmed: 0, packed: 0, out_for_delivery: 0, delivered: 0, cancelled: 0 };
                fetchedOrders.forEach(o => {
                    if (overview[o.orderStatus] !== undefined) {
                        overview[o.orderStatus]++;
                    }
                });
                setOrderOverview(overview);

                // Fetch low stock products
                const lowStockRes = await api.get('/products/admin/all?status=low_stock&limit=5');
                setLowStock(lowStockRes.data.data.products || []);
                
            } catch (error) {
                console.error("Failed to fetch dashboard data");
                setError(true);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center max-w-sm">
                    <WarningCircle size={48} className="text-red-500 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Unable to load dashboard data.</h3>
                    <button 
                        onClick={() => window.location.reload()}
                        className="px-6 py-2 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="space-y-8 animate-pulse bg-[#F8FAF8] -m-6 p-6 md:-m-8 md:p-8 min-h-full">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[1,2,3,4].map(i => <div key={i} className="bg-gray-200 h-28 rounded-2xl"></div>)}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[1,2,3].map(i => <div key={i} className="bg-gray-200 h-24 rounded-2xl"></div>)}
                </div>
                <div className="grid lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 bg-gray-200 h-[400px] rounded-2xl"></div>
                    <div className="bg-gray-200 h-[400px] rounded-2xl"></div>
                </div>
            </div>
        );
    }

    const StatCard = ({ title, value, icon, color, bgColor }) => (
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
            <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${bgColor} ${color}`}>
                {icon}
            </div>
            <div>
                <p className="text-[13px] font-medium text-gray-500 mb-1">{title}</p>
                <h3 className={`text-2xl lg:text-[28px] font-black ${title === 'Total Sales' ? 'text-[#16A34A]' : 'text-gray-900'}`}>{value}</h3>
            </div>
        </div>
    );

    const getStatusBadge = (status) => {
        const styles = {
            pending: 'bg-amber-50 text-amber-600 border border-amber-200',
            confirmed: 'bg-indigo-50 text-indigo-600 border border-indigo-200',
            packed: 'bg-purple-50 text-purple-600 border border-purple-200',
            out_for_delivery: 'bg-orange-50 text-orange-600 border border-orange-200',
            delivered: 'bg-green-50 text-green-600 border border-green-200',
            cancelled: 'bg-red-50 text-red-600 border border-red-200'
        };
        const labels = {
            pending: 'Pending',
            confirmed: 'Confirmed',
            packed: 'Packed',
            out_for_delivery: 'Out for Delivery',
            delivered: 'Delivered',
            cancelled: 'Cancelled'
        };
        return (
            <span className={`px-2.5 py-1 rounded-full text-xs font-bold tracking-wide ${styles[status] || 'bg-gray-100 text-gray-600 border border-gray-200'}`}>
                {labels[status] || status}
            </span>
        );
    };

    return (
        <div className="space-y-6 bg-[#F8FAF8] -m-6 p-6 md:-m-8 md:p-8 min-h-[calc(100vh-80px)]">
            <PageHeader 
                title="Dashboard" 
                subtitle="Get a quick overview of your NammaKada store." 
            />
            {/* ROW 1: Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard 
                    title="Total Sales" 
                    value={`₹${stats?.totalSales?.toLocaleString() || 0}`} 
                    icon={<CurrencyInr size={28} weight="fill" />} 
                    bgColor="bg-[#DCFCE7]" 
                    color="text-[#15803D]" 
                />
                <StatCard 
                    title="Total Orders" 
                    value={stats?.totalOrders || 0} 
                    icon={<Receipt size={28} weight="fill" />} 
                    bgColor="bg-gray-50" 
                    color="text-gray-600" 
                />
                <StatCard 
                    title="Total Products" 
                    value={stats?.totalProducts || 0} 
                    icon={<Package size={28} weight="fill" />} 
                    bgColor="bg-gray-50" 
                    color="text-gray-600" 
                />
                <StatCard 
                    title="Total Customers" 
                    value={stats?.totalCustomers || 0} 
                    icon={<Users size={28} weight="fill" />} 
                    bgColor="bg-gray-50" 
                    color="text-gray-600" 
                />
            </div>

            {/* ROW 2: Secondary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white border border-[#E5E7EB] p-5 rounded-[16px] flex justify-between items-center shadow-sm">
                    <div>
                        <p className="text-[#647067] font-medium text-[13px] mb-1">Pending Orders</p>
                        <p className="text-2xl font-black text-amber-600">{stats?.pendingOrders || 0}</p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center">
                        <Receipt size={20} className="text-amber-500" weight="fill" />
                    </div>
                </div>
                <div className="bg-white border border-[#E5E7EB] p-5 rounded-[16px] flex justify-between items-center shadow-sm">
                    <div>
                        <p className="text-[#647067] font-medium text-[13px] mb-1">Out of Stock</p>
                        <p className="text-2xl font-black text-red-600">{stats?.outOfStockProducts || 0}</p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center">
                        <WarningCircle size={20} className="text-red-500" weight="fill" />
                    </div>
                </div>
                <div className="bg-white border border-[#E5E7EB] p-5 rounded-[16px] flex justify-between items-center shadow-sm">
                    <div>
                        <p className="text-[#647067] font-medium text-[13px] mb-1">Low Stock</p>
                        <p className="text-2xl font-black text-orange-500">{stats?.lowStockProducts || 0}</p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center">
                        <Package size={20} className="text-orange-500" weight="fill" />
                    </div>
                </div>
            </div>

            {/* ROW 3: Recent Orders & Order Status */}
            <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white rounded-[16px] shadow-sm border border-[#E5E7EB] flex flex-col">
                    <div className="p-5 lg:p-6 border-b border-gray-100 flex justify-between items-center">
                        <h2 className="text-[18px] lg:text-[20px] font-semibold text-[#17201B]">Recent Orders</h2>
                        <Link to="/admin/orders" className="text-[#16A34A] font-medium text-sm hover:text-[#15803D] flex items-center gap-1 group transition-all">
                            <span className="group-hover:underline">View All</span> <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>
                    <div className="overflow-x-auto flex-1 pb-4">
                        <table className="w-full text-left whitespace-nowrap">
                            <thead className="bg-[#F8FAF8] text-[#647067] text-xs uppercase font-bold">
                                <tr>
                                    <th className="px-5 lg:px-6 py-4 rounded-tl-lg">Order ID</th>
                                    <th className="px-5 lg:px-6 py-4">Customer</th>
                                    <th className="px-5 lg:px-6 py-4">Total</th>
                                    <th className="px-5 lg:px-6 py-4">Payment</th>
                                    <th className="px-5 lg:px-6 py-4">Status</th>
                                    <th className="px-5 lg:px-6 py-4">Date</th>
                                    <th className="px-5 lg:px-6 py-4 text-right rounded-tr-lg">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {recentOrders.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="px-6 py-12 text-center text-gray-500 font-medium">No orders yet</td>
                                    </tr>
                                ) : recentOrders.map(order => (
                                    <tr key={order._id} className="hover:bg-[#F8FAF8] transition-colors group">
                                        <td className="px-5 lg:px-6 py-4 font-bold text-[#17201B] text-[14px]">#{order._id.slice(-6).toUpperCase()}</td>
                                        <td className="px-5 lg:px-6 py-4 text-[#647067] text-[14px]">{order.customer?.name || 'Unknown'}</td>
                                        <td className="px-5 lg:px-6 py-4 font-bold text-[#17201B] text-[14px]">₹{order.totalAmount}</td>
                                        <td className="px-5 lg:px-6 py-4 text-[13px] text-[#647067] font-medium">{order.paymentMethod === 'cod' ? 'COD' : order.paymentMethod}</td>
                                        <td className="px-5 lg:px-6 py-4">
                                            {getStatusBadge(order.orderStatus)}
                                        </td>
                                        <td className="px-5 lg:px-6 py-4 text-[13px] text-[#647067]">
                                            {new Date(order.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                                        </td>
                                        <td className="px-5 lg:px-6 py-4 text-right">
                                            <Link to={`/admin/orders/${order._id}`} className="text-[#16A34A] font-medium text-sm hover:text-[#15803D] opacity-0 group-hover:opacity-100 transition-opacity">
                                                View &rarr;
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Order Status Overview */}
                <div className="bg-white rounded-[16px] shadow-sm border border-[#E5E7EB] flex flex-col">
                    <div className="p-5 lg:p-6 border-b border-gray-100">
                        <h2 className="text-[18px] lg:text-[20px] font-semibold text-[#17201B] flex items-center gap-2">
                            <ChartBar size={20} className="text-[#647067]" />
                            Order Status
                        </h2>
                    </div>
                    <div className="p-5 lg:p-6 space-y-4 flex-1">
                        <div className="flex justify-between items-center text-[14px]">
                            <span className="font-medium text-[#647067] flex items-center gap-2">
                                <div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div> Pending
                            </span>
                            <span className="font-bold text-[#17201B]">{orderOverview.pending}</span>
                        </div>
                        <div className="flex justify-between items-center text-[14px]">
                            <span className="font-medium text-[#647067] flex items-center gap-2">
                                <div className="w-2.5 h-2.5 rounded-full bg-indigo-500"></div> Confirmed
                            </span>
                            <span className="font-bold text-[#17201B]">{orderOverview.confirmed}</span>
                        </div>
                        <div className="flex justify-between items-center text-[14px]">
                            <span className="font-medium text-[#647067] flex items-center gap-2">
                                <div className="w-2.5 h-2.5 rounded-full bg-purple-500"></div> Packed
                            </span>
                            <span className="font-bold text-[#17201B]">{orderOverview.packed}</span>
                        </div>
                        <div className="flex justify-between items-center text-[14px]">
                            <span className="font-medium text-[#647067] flex items-center gap-2">
                                <div className="w-2.5 h-2.5 rounded-full bg-orange-500"></div> Out for Delivery
                            </span>
                            <span className="font-bold text-[#17201B]">{orderOverview.out_for_delivery}</span>
                        </div>
                        <div className="flex justify-between items-center text-[14px]">
                            <span className="font-medium text-[#647067] flex items-center gap-2">
                                <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div> Delivered
                            </span>
                            <span className="font-bold text-[#17201B]">{orderOverview.delivered}</span>
                        </div>
                        <div className="flex justify-between items-center text-[14px]">
                            <span className="font-medium text-[#647067] flex items-center gap-2">
                                <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div> Cancelled
                            </span>
                            <span className="font-bold text-[#17201B]">{orderOverview.cancelled}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* ROW 4: Low Stock & Quick Actions */}
            <div className="grid lg:grid-cols-3 gap-6">
                {/* Low Stock Items */}
                <div className="lg:col-span-2 bg-white rounded-[16px] shadow-sm border border-[#E5E7EB] flex flex-col">
                    <div className="p-5 lg:p-6 border-b border-gray-100 flex justify-between items-center">
                        <h2 className="text-[18px] lg:text-[20px] font-semibold text-[#17201B] flex items-center gap-2">
                            <WarningCircle size={20} className="text-orange-500" />
                            Low Stock Products
                        </h2>
                        <Link to="/admin/products?status=low_stock" className="text-[#16A34A] font-medium text-sm hover:text-[#15803D] flex items-center gap-1 group transition-all">
                            <span className="group-hover:underline">View All</span> <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>
                    <div className="p-5 lg:p-6 space-y-4 flex-1">
                        {lowStock.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-6 text-center">
                                <div className="w-14 h-14 bg-green-50 rounded-full flex items-center justify-center mb-3">
                                    <CheckCircle size={28} className="text-green-500" weight="fill" />
                                </div>
                                <p className="font-bold text-[#17201B]">All products are sufficiently stocked.</p>
                                <p className="text-[13px] text-[#647067] mt-1">No low-stock products.</p>
                            </div>
                        ) : lowStock.map(product => (
                            <div key={product._id} className="flex items-center gap-4 p-4 rounded-[12px] border border-gray-100 hover:bg-[#F8FAF8] transition-colors">
                                <img src={product.image} className="w-12 h-12 rounded-lg object-cover bg-white border border-gray-100" />
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-[#17201B] text-[14px] truncate">{product.name}</p>
                                    <p className="text-[13px] font-bold text-[#647067] mt-0.5">₹{product.price}</p>
                                </div>
                                <div className="text-right flex items-center gap-3">
                                    <span className="inline-block px-3 py-1 bg-red-50 text-red-700 rounded-full text-xs font-bold border border-red-100">
                                        {product.stock} left
                                    </span>
                                    <button 
                                        onClick={() => navigate(`/admin/products/edit/${product._id}`)}
                                        className="px-4 py-2 text-[13px] font-medium text-[#17201B] bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                                    >
                                        View
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white rounded-[16px] shadow-sm border border-[#E5E7EB] flex flex-col">
                    <div className="p-5 lg:p-6 border-b border-gray-100">
                        <h2 className="text-[18px] lg:text-[20px] font-semibold text-[#17201B]">Quick Actions</h2>
                    </div>
                    <div className="p-5 lg:p-6 space-y-3 flex-1 flex flex-col justify-center">
                        <button 
                            onClick={() => navigate('/admin/products/new')}
                            className="w-full flex items-center justify-center gap-2 py-3 bg-[#16A34A] text-white rounded-[12px] font-bold hover:bg-[#15803D] transition-colors shadow-sm"
                        >
                            <Plus size={20} weight="bold" />
                            Add Product
                        </button>
                        <button 
                            onClick={() => navigate('/admin/orders')}
                            className="w-full flex items-center justify-center gap-2 py-3 bg-white border border-gray-200 text-[#17201B] rounded-[12px] font-bold hover:bg-gray-50 transition-colors"
                        >
                            <Receipt size={20} />
                            View Orders
                        </button>
                        <button 
                            onClick={() => navigate('/admin/customers')}
                            className="w-full flex items-center justify-center gap-2 py-3 bg-white border border-gray-200 text-[#17201B] rounded-[12px] font-bold hover:bg-gray-50 transition-colors"
                        >
                            <Users size={20} />
                            View Customers
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;
