import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { MagnifyingGlass, Funnel, Eye, Receipt, X } from '@phosphor-icons/react';
import api from '../../services/api';
import PageHeader from '../../components/ui/PageHeader';
import CustomSelect from '../../components/ui/CustomSelect';

const STATUS_COLORS = {
    pending: 'bg-amber-50 text-amber-600 border-amber-200',
    confirmed: 'bg-blue-50 text-blue-600 border-blue-200',
    packed: 'bg-purple-50 text-purple-600 border-purple-200',
    out_for_delivery: 'bg-orange-50 text-orange-600 border-orange-200',
    delivered: 'bg-green-50 text-green-600 border-green-200',
    cancelled: 'bg-red-50 text-red-600 border-red-200'
};

const AdminOrdersPage = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    
    const [orders, setOrders] = useState([]);
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    
    // Filters & Pagination
    const [page, setPage] = useState(Number(searchParams.get('page')) || 1);
    const [totalPages, setTotalPages] = useState(1);
    
    const [search, setSearch] = useState(searchParams.get('search') || '');
    const [debouncedSearch, setDebouncedSearch] = useState(search);
    
    const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'all');
    const [paymentFilter, setPaymentFilter] = useState(searchParams.get('paymentStatus') || 'all');
    const [dateFilter, setDateFilter] = useState(searchParams.get('date') || 'all_time');
    const [sort, setSort] = useState(searchParams.get('sort') || 'newest');

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(search), 500);
        return () => clearTimeout(timer);
    }, [search]);

    // Sync filters to URL
    useEffect(() => {
        const params = new URLSearchParams();
        if (page > 1) params.set('page', page);
        if (search) params.set('search', search);
        if (statusFilter !== 'all') params.set('status', statusFilter);
        if (paymentFilter !== 'all') params.set('paymentStatus', paymentFilter);
        if (dateFilter !== 'all_time') params.set('date', dateFilter);
        if (sort !== 'newest') params.set('sort', sort);
        setSearchParams(params, { replace: true });
    }, [page, search, statusFilter, paymentFilter, dateFilter, sort, setSearchParams]);

    // Fetch Summary
    useEffect(() => {
        const fetchSummary = async () => {
            try {
                const { data } = await api.get('/orders/admin/summary');
                setSummary(data.data);
            } catch (err) {
                console.error("Failed to load admin order summary");
            }
        };
        fetchSummary();
    }, []);

    // Fetch Orders
    useEffect(() => {
        const fetchOrders = async () => {
            setLoading(true);
            try {
                let url = `/orders/admin/all?page=${page}&limit=20`;
                if (debouncedSearch) url += `&search=${debouncedSearch}`;
                if (statusFilter !== 'all') url += `&status=${statusFilter}`;
                if (paymentFilter !== 'all') url += `&paymentStatus=${paymentFilter}`;
                if (dateFilter !== 'all_time') url += `&date=${dateFilter}`;
                url += `&sort=${sort}`;

                const { data } = await api.get(url);
                setOrders(data.data.orders);
                setTotalPages(data.data.totalPages);
            } catch (err) {
                console.error('Failed to fetch orders');
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, [page, debouncedSearch, statusFilter, paymentFilter, dateFilter, sort]);

    const handleClearFilters = () => {
        setSearch('');
        setDebouncedSearch('');
        setStatusFilter('all');
        setPaymentFilter('all');
        setDateFilter('all_time');
        setSort('newest');
        setPage(1);
    };

    const isFiltered = search || statusFilter !== 'all' || paymentFilter !== 'all' || dateFilter !== 'all_time' || sort !== 'newest';

    return (
        <div className="space-y-6 pb-24">
            <PageHeader 
                title="Orders" 
                subtitle="Manage customer orders and track order fulfillment." 
            />

            {/* Summary Cards */}
            {summary && (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-4">
                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Total</span>
                        <span className="text-xl font-black text-gray-900">{summary.all}</span>
                    </div>
                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Pending</span>
                        <span className="text-xl font-black text-amber-600">{summary.pending}</span>
                    </div>
                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Confirmed</span>
                        <span className="text-xl font-black text-blue-600">{summary.confirmed}</span>
                    </div>
                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Out Delivery</span>
                        <span className="text-xl font-black text-orange-600">{summary.out_for_delivery}</span>
                    </div>
                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Completed</span>
                        <span className="text-xl font-black text-green-600">{summary.completed}</span>
                    </div>
                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Cancelled</span>
                        <span className="text-xl font-black text-red-600">{summary.cancelled}</span>
                    </div>
                </div>
            )}

            {/* Quick Filter Chips */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {[
                    { id: 'all', label: 'All' },
                    { id: 'pending', label: 'Pending' },
                    { id: 'confirmed', label: 'Confirmed' },
                    { id: 'packed', label: 'Packed' },
                    { id: 'out_for_delivery', label: 'Out Delivery' },
                    { id: 'completed', label: 'Completed' },
                    { id: 'cancelled', label: 'Cancelled' }
                ].map(chip => (
                    <button
                        key={chip.id}
                        onClick={() => { setStatusFilter(chip.id); setPage(1); }}
                        className={`px-4 py-1.5 rounded-full text-sm font-bold whitespace-nowrap transition-colors border ${
                            statusFilter === chip.id
                            ? 'bg-primary text-white border-primary'
                            : 'bg-white text-gray-600 border-gray-200 hover:border-primary/50 hover:bg-gray-50'
                        }`}
                    >
                        {chip.label}
                    </button>
                ))}
            </div>

            {/* Filters Toolbar */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col lg:flex-row gap-4">
                <div className="flex-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                        <MagnifyingGlass size={20} />
                    </div>
                    <input 
                        type="text" 
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                        placeholder="Search by Order ID, Customer Name, Phone, Email..." 
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                    />
                </div>
                <div className="flex flex-wrap lg:flex-nowrap items-center gap-3">
                    <div className="w-full md:w-36">
                        <CustomSelect 
                            value={statusFilter}
                            onChange={(value) => { setStatusFilter(value); setPage(1); }}
                            options={[
                                { value: "all", label: "Status" },
                                { value: "pending", label: "Pending" },
                                { value: "confirmed", label: "Confirmed" },
                                { value: "packed", label: "Packed" },
                                { value: "out_for_delivery", label: "Out Delivery" },
                                { value: "completed", label: "Completed" },
                                { value: "cancelled", label: "Cancelled" }
                            ]}
                        />
                    </div>
                    <div className="w-full md:w-36">
                        <CustomSelect 
                            value={paymentFilter}
                            onChange={(value) => { setPaymentFilter(value); setPage(1); }}
                            options={[
                                { value: "all", label: "Payment" },
                                { value: "pending", label: "Pending" },
                                { value: "paid", label: "Paid" }
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
                    <div className="w-full md:w-36">
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
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left whitespace-nowrap">
                        <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-bold border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4">Order ID</th>
                                <th className="px-6 py-4">Customer</th>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4">Total</th>
                                <th className="px-6 py-4">Payment</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                                        <p>Loading orders...</p>
                                    </td>
                                </tr>
                            ) : orders.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="px-6 py-16 text-center">
                                        <div className="text-gray-300 mb-4 flex justify-center"><Receipt size={48} /></div>
                                        <p className="text-gray-900 font-bold mb-1">No orders found</p>
                                        <p className="text-gray-500 text-sm">Try adjusting your filters or search query.</p>
                                    </td>
                                </tr>
                            ) : orders.map(order => (
                                <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 font-bold text-gray-900">
                                        #{order._id.slice(-6).toUpperCase()}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-gray-900 text-sm">{order.customer?.name || 'Unknown User'}</span>
                                            <span className="text-xs text-gray-500">{order.customer?.phone || order.customer?.email || 'No contact info'}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500 font-medium">
                                        {new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                    </td>
                                    <td className="px-6 py-4 font-black text-gray-900">
                                        ₹{order.totalAmount}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold text-gray-900 uppercase">{order.paymentMethod === 'cod' ? 'COD' : order.paymentMethod}</span>
                                            <span className={`text-[10px] font-black uppercase tracking-wider ${order.paymentStatus === 'paid' ? 'text-green-500' : 'text-amber-500'}`}>
                                                {order.paymentStatus}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${STATUS_COLORS[order.orderStatus]}`}>
                                            {order.orderStatus === 'delivered' ? '✓ DELIVERED' : order.orderStatus === 'cancelled' ? '✕ CANCELLED' : order.orderStatus.replace(/_/g, ' ')}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <Link 
                                            to={`/admin/orders/${order._id}`}
                                            className="inline-flex items-center gap-1.5 px-4 py-2 bg-white border border-gray-200 hover:border-primary hover:text-primary hover:shadow-sm text-gray-700 font-bold rounded-xl transition-all text-sm"
                                        >
                                            <Eye size={18} /> View
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden divide-y divide-gray-100">
                    {loading ? (
                        <div className="px-6 py-12 text-center text-gray-500">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                            <p>Loading orders...</p>
                        </div>
                    ) : orders.length === 0 ? (
                        <div className="px-6 py-12 text-center">
                            <div className="text-gray-300 mb-4 flex justify-center"><Receipt size={48} /></div>
                            <p className="text-gray-900 font-bold mb-1">No orders found</p>
                            <p className="text-gray-500 text-sm">Try adjusting your filters.</p>
                        </div>
                    ) : (
                        orders.map(order => (
                            <div key={order._id} className="p-4 space-y-4">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-bold text-gray-900">#{order._id.slice(-6).toUpperCase()}</span>
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${STATUS_COLORS[order.orderStatus]}`}>
                                                {order.orderStatus === 'delivered' ? '✓ DELIVERED' : order.orderStatus === 'cancelled' ? '✕ CANCELLED' : order.orderStatus.replace(/_/g, ' ')}
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                                    </div>
                                    <span className="font-black text-lg text-gray-900">₹{order.totalAmount}</span>
                                </div>
                                <div className="bg-gray-50 p-3 rounded-xl">
                                    <p className="font-bold text-sm text-gray-900">{order.customer?.name || 'Unknown User'}</p>
                                    <p className="text-xs text-gray-500">{order.customer?.phone || order.customer?.email}</p>
                                </div>
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-bold uppercase text-gray-600 border border-gray-200 px-2 py-1 rounded bg-white">{order.paymentMethod === 'cod' ? 'COD' : order.paymentMethod}</span>
                                        <span className={`text-[10px] font-black uppercase tracking-wider ${order.paymentStatus === 'paid' ? 'text-green-500' : 'text-amber-500'}`}>
                                            {order.paymentStatus}
                                        </span>
                                    </div>
                                    <Link 
                                        to={`/admin/orders/${order._id}`}
                                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-white font-bold rounded-xl text-sm"
                                    >
                                        View
                                    </Link>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-gray-50">
                        <button 
                            disabled={page === 1}
                            onClick={() => setPage(p => p - 1)}
                            className="px-4 py-2 bg-white border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 disabled:opacity-50 transition-colors"
                        >
                            Previous
                        </button>
                        <span className="text-sm font-medium text-gray-500">Page {page} of {totalPages}</span>
                        <button 
                            disabled={page === totalPages}
                            onClick={() => setPage(p => p + 1)}
                            className="px-6 py-2 bg-primary text-white font-bold rounded-xl hover:bg-primary-dark disabled:opacity-50 transition-colors"
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminOrdersPage;
