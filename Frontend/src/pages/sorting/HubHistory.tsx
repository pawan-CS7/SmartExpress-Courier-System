import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAllOrders } from "../../services/orderService";
import type { Order } from "../../types/Order";
import { branchService } from "../../services/branchService";
import type { Branch } from "../../types/branch";
import {
    Clock,
    Search,
    MapPin,
    X,
    FileText,
    PackageOpen
} from "lucide-react";

function HubHistory() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [branches, setBranches] = useState<Branch[]>([]);
    const navigate = useNavigate();
    const [search, setSearch] = useState("");

    useEffect(() => {
        loadOrders();
        branchService.getBranches().then(data => setBranches(data)).catch(console.error);
        
        const interval = setInterval(() => {
            loadOrders(false);
        }, 15000);

        return () => clearInterval(interval);
    }, []);

    const loadOrders = async (showSpinner = true) => {
        if (showSpinner) setLoading(true);
        try {
            const data = await getAllOrders();
            if (Array.isArray(data)) setOrders(data);
            else if (data && Array.isArray(data.orders)) setOrders(data.orders);
            else if (data && Array.isArray(data.data)) setOrders(data.data);
            else setOrders([]);
        } catch {
            setOrders([]);
        } finally {
            if (showSpinner) setLoading(false);
        }
    };

    const filteredOrders = useMemo(() => {
        const dispatchStatuses = [
            "Dispatched to Destination Branch",
            "Collected at Destination Branch",
            "Received at Destination Branch",
            "Out for Delivery",
            "Delivered",
            "Delivery Failed",
            "Returned"
        ];
        return orders.filter(x => {
            const matchSearch = x.trackingNumber?.toLowerCase().includes(search.toLowerCase()) || 
                                x.customerName?.toLowerCase().includes(search.toLowerCase());
            
            if (!matchSearch) return false;
            
            return dispatchStatuses.includes(x.status || "");
        });
    }, [orders, search]);

    const getBranchName = (id?: number) => {
        if (!id) return "N/A";
        const b = branches.find(b => b.id === id);
        return b ? b.name : `Branch ${id}`;
    };

    const historyCount = filteredOrders.length;

    // Build the grouped history: Date -> Branch -> Orders
    const groupedHistory = useMemo(() => {
        const groups: Record<string, Record<string, Order[]>> = {};
        
        // Sort by date descending
        const sorted = [...filteredOrders].sort((a, b) => {
            const dateA = a.statusChangedAt ? new Date(a.statusChangedAt).getTime() : 0;
            const dateB = b.statusChangedAt ? new Date(b.statusChangedAt).getTime() : 0;
            return dateB - dateA;
        });

        sorted.forEach(o => {
            const destName = getBranchName(o.destinationBranchId);
            const dateStr = o.statusChangedAt ? new Date(o.statusChangedAt).toLocaleDateString('en-GB', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' }) : 'Unknown Date';
            
            if (!groups[dateStr]) groups[dateStr] = {};
            if (!groups[dateStr][destName]) groups[dateStr][destName] = [];
            
            groups[dateStr][destName].push(o);
        });
        return groups;
    }, [filteredOrders, branches]);

    if (loading) {
        return <div className="p-8 text-orange-600 font-semibold animate-pulse">Loading history...</div>;
    }

    return (
        <div className="min-h-screen p-8 bg-gradient-to-br from-slate-50 to-orange-50 relative">
            <h1 className="text-4xl font-bold mb-2 text-slate-800">Dispatch History</h1>
            <p className="text-gray-500 mb-8">Parcels dispatched from the warehouse to destination branches.</p>

            {/* KPI */}
            <div className="grid md:grid-cols-1 gap-6 mb-8 max-w-sm">
                <div className="bg-gradient-to-r from-orange-400 to-red-500 text-white rounded-3xl p-6 shadow-lg transform transition hover:scale-105">
                    <PackageOpen size={32} />
                    <h2 className="mt-3 font-medium opacity-90">Dispatched History</h2>
                    <p className="text-4xl font-bold tracking-tight">{historyCount}</p>
                </div>
            </div>

            {/* SEARCH */}
            <div className="bg-white rounded-3xl shadow-sm p-5 mb-8 border border-slate-100">
                <div className="flex items-center gap-4 bg-slate-50 p-2 rounded-xl">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                        <input 
                            type="text"
                            placeholder="Search by Tracking No..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-lg outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all text-slate-700 shadow-sm"
                        />
                    </div>
                    {search && (
                        <button 
                            onClick={() => setSearch('')}
                            className="bg-red-50 border border-red-100 hover:bg-red-100 text-red-600 px-4 py-3 rounded-lg font-bold transition-all shadow-sm flex items-center gap-2"
                        >
                            <X size={18} /> Clear
                        </button>
                    )}
                    <button 
                        onClick={() => loadOrders()}
                        className="bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 px-6 py-3 rounded-lg font-bold transition-all shadow-sm"
                    >
                        Refresh
                    </button>
                </div>
            </div>

            {/* TABLE */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-6">
                    {Object.keys(groupedHistory).length > 0 ? (
                        Object.entries(groupedHistory).map(([dateStr, branches]) => (
                            <div key={dateStr} className="mb-10 last:mb-0">
                                {/* Date Header */}
                                <h2 className="font-bold text-xl text-slate-800 mb-6 flex items-center gap-3">
                                    <div className="bg-orange-100 text-orange-600 p-2.5 rounded-xl shadow-sm">
                                        <Clock size={20} />
                                    </div>
                                    {dateStr}
                                </h2>
                                
                                {/* Branch Groups under Date */}
                                <div className="space-y-6">
                                    {Object.entries(branches).map(([destName, groupOrders]) => (
                                        <div key={destName} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden ml-2 md:ml-12 relative transition-all hover:shadow-md">
                                            <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-orange-400 to-red-500"></div>
                                            
                                            <div className="p-4 bg-slate-50 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 pl-6">
                                                <h3 className="font-bold text-[17px] text-slate-800 flex items-center gap-2">
                                                    <MapPin className="text-orange-500" size={20} />
                                                    Destination: <span className="text-orange-700">{destName}</span>
                                                </h3>
                                                <div className="text-xs font-bold bg-white border border-slate-200 px-4 py-1.5 rounded-full text-slate-600 shadow-sm inline-flex items-center gap-2 uppercase tracking-wider">
                                                    <PackageOpen size={14} className="text-slate-400" />
                                                    {groupOrders.length} Parcels Dispatched
                                                </div>
                                            </div>
                                            
                                            <div className="overflow-x-auto p-2">
                                                <table className="w-full text-left whitespace-nowrap">
                                                    <thead className="text-slate-400 text-xs font-bold uppercase tracking-wider bg-white">
                                                        <tr>
                                                            <th className="p-3 pl-6">Tracking No</th>
                                                            <th className="p-3">Origin Branch</th>
                                                            <th className="p-3">Current Status</th>
                                                            <th className="p-3 text-right pr-6">Actions</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-slate-50">
                                                        {groupOrders.map(order => (
                                                            <tr key={order.id} className="hover:bg-orange-50/40 transition-colors group">
                                                                <td className="p-3 pl-6 font-mono text-orange-600 font-bold text-sm group-hover:text-orange-700">{order.trackingNumber}</td>
                                                                <td className="p-3 text-sm font-medium text-slate-600 flex items-center gap-2">
                                                                    <div className="w-2 h-2 rounded-full bg-slate-300"></div>
                                                                    {getBranchName(order.originBranchId)}
                                                                </td>
                                                                <td className="p-3">
                                                                    <span className="px-3 py-1.5 rounded-lg text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200 uppercase tracking-widest shadow-sm">
                                                                        {order.status || 'Unknown'}
                                                                    </span>
                                                                </td>
                                                                <td className="p-3 text-right pr-6">
                                                                    <button 
                                                                        onClick={() => navigate(`/sorting/order-details/${order.trackingNumber}`)}
                                                                        className="text-orange-600 hover:text-white font-bold text-xs bg-orange-50 hover:bg-orange-500 px-4 py-2 rounded-lg transition-all inline-flex items-center gap-2 shadow-sm"
                                                                    >
                                                                        <FileText size={14} /> View Details
                                                                    </button>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="flex flex-col items-center justify-center p-12 text-slate-400">
                            <Clock size={48} className="text-slate-300 mb-4" />
                            <p className="text-lg font-medium">No dispatch history found.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default HubHistory;
