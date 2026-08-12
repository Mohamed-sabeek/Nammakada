import { useState, useEffect } from 'react';
import { Users, MagnifyingGlass, WarningCircle, CheckCircle } from '@phosphor-icons/react';
import api from '../../services/api';
import PageHeader from '../../components/ui/PageHeader';

const CustomersPage = () => {
    const [customers, setCustomers] = useState([]);
    const [filteredCustomers, setFilteredCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    
    const [search, setSearch] = useState('');
    const [toast, setToast] = useState(null);

    useEffect(() => {
        const fetchCustomers = async () => {
            try {
                const { data } = await api.get('/admin/customers');
                setCustomers(data.data);
                setFilteredCustomers(data.data);
            } catch (err) {
                console.error('Failed to fetch customers');
            } finally {
                setLoading(false);
            }
        };
        fetchCustomers();
    }, []);

    useEffect(() => {
        if (!search) {
            setFilteredCustomers(customers);
            return;
        }
        const s = search.toLowerCase();
        const filtered = customers.filter(c => 
            (c.name && c.name.toLowerCase().includes(s)) ||
            (c.email && c.email.toLowerCase().includes(s)) ||
            (c.phone && c.phone.includes(s))
        );
        setFilteredCustomers(filtered);
    }, [search, customers]);

    const handleToggleStatus = async (id, currentStatus) => {
        try {
            await api.put(`/admin/customers/${id}/status`, { isActive: !currentStatus });
            
            setCustomers(prev => prev.map(c => 
                c._id === id ? { ...c, isActive: !currentStatus } : c
            ));
            
            showToast(`Customer account ${!currentStatus ? 'activated' : 'deactivated'}`, 'success');
        } catch (err) {
            showToast('Failed to update customer status', 'error');
        }
    };

    const showToast = (message, type) => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    return (
        <div className="space-y-6 pb-24">
            <PageHeader 
                title="Customers" 
                subtitle="View and manage NammaKada customers." 
            />

            {/* Filters */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex gap-4">
                <div className="flex-1 relative max-w-md">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                        <MagnifyingGlass size={20} />
                    </div>
                    <input 
                        type="text" 
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search by name, email or phone..." 
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-600 focus:border-transparent outline-none transition-all"
                    />
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left whitespace-nowrap">
                        <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-bold">
                            <tr>
                                <th className="px-6 py-4">Customer Info</th>
                                <th className="px-6 py-4">Contact</th>
                                <th className="px-6 py-4">Joined Date</th>
                                <th className="px-6 py-4">Account Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
                                    </td>
                                </tr>
                            ) : filteredCustomers.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center">
                                        <div className="text-gray-400 mb-2 flex justify-center"><Users size={48} /></div>
                                        <p className="text-gray-500 font-medium">No customers found</p>
                                    </td>
                                </tr>
                            ) : filteredCustomers.map(customer => (
                                <tr key={customer._id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-green-100 text-green-700 font-bold rounded-full flex items-center justify-center">
                                                {customer.name?.charAt(0).toUpperCase()}
                                            </div>
                                            <span className="font-bold text-gray-900">{customer.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">
                                        <p>{customer.email || 'N/A'}</p>
                                        <p className="text-gray-500">{customer.phone}</p>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        {new Date(customer.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${customer.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                            {customer.isActive ? 'Active' : 'Deactivated'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button 
                                            onClick={() => handleToggleStatus(customer._id, customer.isActive)}
                                            className={`px-4 py-2 rounded-lg font-bold text-sm transition-colors ${
                                                customer.isActive 
                                                ? 'bg-red-50 hover:bg-red-100 text-red-600' 
                                                : 'bg-green-50 hover:bg-green-100 text-green-600'
                                            }`}
                                        >
                                            {customer.isActive ? 'Deactivate' : 'Activate'}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
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

export default CustomersPage;
