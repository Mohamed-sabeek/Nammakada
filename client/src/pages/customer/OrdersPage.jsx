import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Receipt, WarningCircle, CaretRight, MagnifyingGlass, Funnel, X } from '@phosphor-icons/react';
import api from '../../services/api';
import CustomSelect from '../../components/ui/CustomSelect';

const STATUS_COLORS = {
    pending: 'bg-yellow-50 text-yellow-600 border border-yellow-200',
    confirmed: 'bg-blue-50 text-blue-600 border border-blue-200',
    packed: 'bg-purple-50 text-purple-600 border border-purple-200',
    out_for_delivery: 'bg-orange-50 text-orange-600 border border-orange-200',
    delivered: 'bg-green-50 text-green-600 border border-green-200',
    cancelled: 'bg-red-50 text-red-600 border border-red-200'
};

const OrdersPage = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    const [orders, setOrders] = useState([]);
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Filters & Pagination
    const [page, setPage] = useState(Number(searchParams.get('page')) || 1);
    const [totalPages, setTotalPages] = useState(1);
    const [search, setSearch] = useState(searchParams.get('search') || '');
    const [debouncedSearch, setDebouncedSearch] = useState(search);
    
    // Tab Status (All, Active, Completed, Cancelled)
    const [tabStatus, setTabStatus] = useState(searchParams.get('tab') || 'all');
    
    // Detailed Status filter (within tab)
    const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'all');
    const [dateFilter, setDateFilter] = useState(searchParams.get('date') || 'all_time');
    const [sort, setSort] = useState(searchParams.get('sort') || 'newest');

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(search), 500);
        return () => clearTimeout(timer);
    }, [search]);

    // Update URL params when filters change
    useEffect(() => {
        const params = new URLSearchParams();
        if (page > 1) params.set('page', page);
        if (search) params.set('search', search);
        if (tabStatus !== 'all') params.set('tab', tabStatus);
        if (statusFilter !== 'all') params.set('status', statusFilter);
        if (dateFilter !== 'all_time') params.set('date', dateFilter);
        if (sort !== 'newest') params.set('sort', sort);
        setSearchParams(params, { replace: true });
    }, [page, search, tabStatus, statusFilter, dateFilter, sort, setSearchParams]);

    // Fetch Summary
    useEffect(() => {
        const fetchSummary = async () => {
            try {
                const { data } = await api.get('/orders/summary');
                setSummary(data.data);
            } catch (err) {
                console.error("Failed to load order summary");
            }
        };
        fetchSummary();
    }, []);

    // Fetch Orders
    useEffect(() => {
        const fetchOrders = async () => {
            setLoading(true);
            try {
                let url = `/orders?page=${page}&limit=10`;
                if (debouncedSearch) url += `&search=${debouncedSearch}`;
                
                // Combine Tab Status and Detailed Status
                let activeStatus = statusFilter !== 'all' ? statusFilter : tabStatus;
                if (activeStatus !== 'all') url += `&status=${activeStatus}`;
                
                if (dateFilter !== 'all_time') url += `&date=${dateFilter}`;
                url += `&sort=${sort}`;

                const { data } = await api.get(url);
                setOrders(data.data.orders);
                setTotalPages(data.data.totalPages);
                setError(null);
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to fetch orders');
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, [page, debouncedSearch, tabStatus, statusFilter, dateFilter, sort]);

    const handleClearFilters = () => {
        setSearch('');
        setDebouncedSearch('');
        setStatusFilter('all');
        setTabStatus('all');
        setDateFilter('all_time');
        setSort('newest');
        setPage(1);
    };

    const isFiltered = search || statusFilter !== 'all' || dateFilter !== 'all_time' || sort !== 'newest' || tabStatus !== 'all';

    return (
        <div className="p-6 md:p-8 max-w-5xl mx-auto pb-24">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">My Orders</h1>
                <p className="text-gray-500">Track your orders and view your complete purchase history.</p>
            </div>

            {/* Summary Cards */}
            {summary && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center">
                        <span className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">All Orders</span>
                        <span className="text-2xl font-black text-gray-900">{summary.all}</span>
                    </div>
                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center">
                        <span className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Pending</span>
                        <span className="text-2xl font-black text-amber-600">{summary.pending}</span>
                    </div>
                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center">
                        <span className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">In Progress</span>
                        <span className="text-2xl font-black text-blue-600">{summary.active - summary.pending}</span>
                    </div>
                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center">
                        <span className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Completed</span>
                        <span className="text-2xl font-black text-green-600">{summary.completed}</span>
                    </div>
                </div>
            )}

            {/* Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide border-b border-gray-100">
                {[
                    { id: 'all', label: 'All Orders' },
                    { id: 'active', label: 'Active' },
                    { id: 'completed', label: 'Completed' },
                    { id: 'cancelled', label: 'Cancelled' }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => { setTabStatus(tab.id); setStatusFilter('all'); setPage(1); }}
                        className={`px-5 py-2.5 font-bold rounded-t-xl transition-colors whitespace-nowrap ${
                            tabStatus === tab.id 
                            ? 'text-primary border-b-2 border-primary bg-primary-light/10' 
                            : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                        }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Filter Toolbar */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-8 flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                        <MagnifyingGlass size={20} />
                    </div>
                    <input 
                        type="text" 
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                        placeholder="Search orders..." 
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                    />
                </div>
                
                <div className="flex flex-wrap md:flex-nowrap items-center gap-3">
                    <div className="w-full md:w-36">
                        <CustomSelect 
                            value={statusFilter}
                            onChange={(value) => { setStatusFilter(value); setPage(1); }}
                            options={[
                                { value: "all", label: "Status" },
                                { value: "pending", label: "Pending" },
                                { value: "confirmed", label: "Confirmed" },
                                { value: "packed", label: "Packed" },
                                { value: "out_for_delivery", label: "Out for Delivery" },
                                { value: "delivered", label: "Delivered" },
                                { value: "cancelled", label: "Cancelled" }
                            ]}
                        />
                    </div>
                    <div className="w-full md:w-36">
                        <CustomSelect 
                            value={dateFilter}
                            onChange={(value) => { setDateFilter(value); setPage(1); }}
                            options={[
                                { value: "all_time", label: "Date" },
                                { value: "today", label: "Today" },
                                { value: "last_7_days", label: "Last 7 Days" },
                                { value: "last_30_days", label: "Last 30 Days" },
                                { value: "this_year", label: "This Year" }
                            ]}
                        />
                    </div>
                    <div className="w-full md:w-40">
                        <CustomSelect 
                            value={sort}
                            onChange={(value) => { setSort(value); setPage(1); }}
                            options={[
                                { value: "newest", label: "Newest First" },
                                { value: "oldest", label: "Oldest First" },
                                { value: "highest_amount", label: "Highest Amount" },
                                { value: "lowest_amount", label: "Lowest Amount" }
                            ]}
                        />
                    </div>
                    {isFiltered && (
                        <button 
                            onClick={handleClearFilters}
                            className="px-4 py-2.5 text-gray-500 hover:text-red-500 font-bold flex items-center gap-2 transition-colors whitespace-nowrap"
                        >
                            <X weight="bold" /> Clear
                        </button>
                    )}
                </div>
            </div>

            {/* Content Area */}
            {error ? (
                <div className="p-8 bg-red-50 rounded-2xl flex flex-col items-center justify-center text-center border border-red-100">
                    <WarningCircle size={48} className="text-red-400 mb-4" />
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Unable to load your orders.</h3>
                    <p className="text-gray-500 mb-6">{error}</p>
                    <button onClick={() => window.location.reload()} className="px-6 py-2 bg-red-600 text-white rounded-full font-bold">Retry</button>
                </div>
            ) : loading ? (
                <div className="space-y-4">
                    {[1,2,3].map(i => (
                        <div key={i} className="bg-white rounded-[2rem] p-6 border border-gray-100 animate-pulse">
                            <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
                            <div className="flex gap-4">
                                <div className="w-16 h-16 bg-gray-200 rounded-xl"></div>
                                <div className="flex-1 space-y-2 py-1">
                                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : orders.length === 0 ? (
                <div className="p-12 bg-white rounded-[2rem] shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">
                    <div className="w-20 h-20 bg-gray-50 text-gray-400 rounded-full flex items-center justify-center mb-6">
                        <Receipt size={40} />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        {isFiltered ? "No orders found" : "No orders yet"}
                    </h2>
                    <p className="text-gray-500 mb-8 max-w-md">
                        {isFiltered 
                            ? "Try changing your filters or search." 
                            : "Your orders will appear here after you place your first order."}
                    </p>
                    {isFiltered ? (
                        <button 
                            onClick={handleClearFilters}
                            className="px-6 py-3 bg-gray-900 hover:bg-gray-800 text-white rounded-xl font-bold transition-all"
                        >
                            Clear Filters
                        </button>
                    ) : (
                        <Link 
                            to="/customer/products" 
                            className="px-8 py-4 bg-primary hover:bg-primary-dark text-white rounded-2xl font-bold transition-all shadow-lg hover:shadow-xl hover:-translate-y-1"
                        >
                            Start Shopping
                        </Link>
                    )}
                </div>
            ) : (
                <div className="space-y-4">
                    {orders.map((order) => (
                        <div 
                            key={order._id}
                            onClick={() => navigate(`/customer/orders/${order._id}`)}
                            className="block bg-white rounded-3xl p-5 md:p-6 shadow-sm border border-gray-100 hover:shadow-md hover:border-primary/20 transition-all group cursor-pointer"
                        >
                            <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between mb-4">
                                <div>
                                    <div className="flex items-center gap-3 mb-1">
                                        <h3 className="font-bold text-gray-900">Order #{order._id.slice(-6).toUpperCase()}</h3>
                                        <span className={`px-3 py-1 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-wider ${STATUS_COLORS[order.orderStatus]}`}>
                                            {order.orderStatus === 'cancelled' ? '✕ Cancelled' : order.orderStatus === 'delivered' ? '✓ Delivered' : order.orderStatus.replace(/_/g, ' ')}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-500">
                                        Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                    </p>
                                </div>
                                <div className="text-left md:text-right">
                                    <span className="block font-black text-xl text-gray-900">₹{order.totalAmount}</span>
                                </div>
                            </div>

                            <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between border-t border-gray-50 pt-4">
                                <div className="flex items-center gap-3">
                                    <div className="flex -space-x-4">
                                        {order.items.slice(0, 3).map((item, idx) => (
                                            <img 
                                                key={idx} 
                                                src={item.image || '/placeholder-image.png'} 
                                                alt={item.name} 
                                                className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm bg-gray-50"
                                            />
                                        ))}
                                    </div>
                                    {order.items.length > 3 && (
                                        <div className="w-12 h-12 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center z-10 shadow-sm">
                                            <span className="font-bold text-gray-600 text-sm">+{order.items.length - 3}</span>
                                        </div>
                                    )}
                                    <span className="text-sm font-medium text-gray-600 ml-2">{order.items.length} {order.items.length === 1 ? 'item' : 'items'}</span>
                                </div>
                                
                                <div className="flex items-center gap-3">
                                    {order.orderStatus === 'pending' && (
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); navigate(`/customer/orders/${order._id}`); }}
                                            className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 font-bold rounded-xl text-sm border border-red-200 transition-colors whitespace-nowrap"
                                        >
                                            Cancel Order
                                        </button>
                                    )}
                                    <div className="flex items-center gap-1 text-primary font-bold group-hover:translate-x-1 transition-transform whitespace-nowrap">
                                        View Order <CaretRight size={20} weight="bold" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
                            <span className="text-sm font-medium text-gray-500">Showing page {page} of {totalPages}</span>
                            <div className="flex gap-2">
                                <button 
                                    disabled={page === 1}
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    className="px-4 py-2.5 bg-white border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 hover:text-primary transition-colors disabled:opacity-50 disabled:hover:bg-white disabled:hover:text-gray-700"
                                >
                                    Previous
                                </button>
                                <button 
                                    disabled={page === totalPages}
                                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                    className="px-6 py-2.5 bg-primary text-white font-bold rounded-xl hover:bg-primary-dark transition-colors shadow-sm disabled:opacity-50"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default OrdersPage;
