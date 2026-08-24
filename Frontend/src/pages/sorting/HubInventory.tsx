import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAllOrders } from "../../services/orderService";
import type { Order } from "../../types/Order";
import { branchService } from "../../services/branchService";
import type { Branch } from "../../types/branch";
import {
    Package,
    Search,
    MapPin,
    X,
    FileText
} from "lucide-react";

function HubInventory() {
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
        return orders.filter(x => {
            const matchSearch = x.trackingNumber?.toLowerCase().includes(search.toLowerCase()) || 
                                x.customerName?.toLowerCase().includes(search.toLowerCase());
            
            if (!matchSearch) return false;
            
            // Only Currently in Warehouse
            return x.status === "Collected at Warehouse";
        });
    }, [orders, search]);

    const getBranchName = (id?: number) => {
        if (!id) return "N/A";
        const b = branches.find(b => b.id === id);
        return b ? b.name : `Branch ${id}`;
    };

    const inventoryCount = filteredOrders.length;

    if (loading) {
        return <div className="p-8 text-purple-600 font-semibold animate-pulse">Loading inventory...</div>;
    }

    return (
        <div className="min-h-screen p-8 bg-gradient-to-br from-slate-50 to-purple-50 relative">
            <h1 className="text-4xl font-bold mb-2 text-slate-800">Currently in Warehouse</h1>
            <p className="text-gray-500 mb-8">Parcels currently sitting in the warehouse ready for dispatch.</p>

            {/* KPI */}
            <div className="grid md:grid-cols-1 gap-6 mb-8 max-w-sm">
                <div className="bg-gradient-to-r from-purple-500 to-fuchsia-600 text-white rounded-3xl p-6 shadow-lg transform transition hover:scale-105">
                    <Package size={32} />
                    <h2 className="mt-3 font-medium opacity-90">Currently in Warehouse</h2>
                    <p className="text-4xl font-bold tracking-tight">{inventoryCount}</p>
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
                            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-lg outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all text-slate-700 shadow-sm"
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
                <div className="overflow-x-auto">
                    <table className="w-full text-left whitespace-nowrap">
                        <thead className="bg-slate-50/80 border-b border-slate-100 text-slate-500 text-sm font-semibold uppercase tracking-wider">
                            <tr>
                                <th className="p-5">Tracking No</th>
                                <th>Route</th>
                                <th>Current Location</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-slate-600">
                            {filteredOrders.length > 0 ? (
                                filteredOrders.map(order => (
                                    <tr 
                                        key={order.id} 
                                        className="hover:bg-slate-50/50 transition-colors duration-200"
                                    >
                                        <td className="p-5 font-mono text-purple-600 font-bold">{order.trackingNumber}</td>
                                        <td>
                                            <div className="text-sm font-medium">{getBranchName(order.originBranchId)}</div>
                                            <div className="text-xs text-slate-400">→ {getBranchName(order.destinationBranchId)}</div>
                                        </td>
                                        <td>
                                            <div className="inline-flex items-center gap-1 text-sm bg-slate-100 px-2 py-1 rounded-md text-slate-700">
                                                <MapPin size={12} className="text-purple-500" />
                                                {getBranchName(order.currentBranchId)}
                                            </div>
                                        </td>
                                        <td>
                                            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-700">
                                                {order.status || 'Unknown'}
                                            </span>
                                        </td>
                                        <td>
                                            <button 
                                                onClick={() => navigate(`/sorting/order-details/${order.trackingNumber}`)}
                                                className="bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white px-3.5 py-2 rounded-xl transition-all font-medium text-sm flex items-center gap-1.5 shadow-sm">
                                                <FileText size={16} /> Details
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="p-12 text-center text-slate-400 bg-slate-50/50">
                                        <div className="flex flex-col items-center justify-center">
                                            <Package size={48} className="text-slate-300 mb-4" />
                                            <p className="text-lg font-medium">No parcels currently in warehouse.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default HubInventory;
