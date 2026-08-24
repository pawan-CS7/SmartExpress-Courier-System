import { useEffect, useState } from "react";
import api from "../../services/api";
import { getTrackingInfo } from "../../services/trackingService";
import type { OrderTracking } from "../../services/trackingService";
import { Activity, X, Search } from "lucide-react";
import TrackingTimeline from "../../components/TrackingTimeline";

function ProcessingOrders() {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");

    // Tracking Modal State
    const [showTrackingModal, setShowTrackingModal] = useState(false);
    const [selectedTracking, setSelectedTracking] = useState<OrderTracking | null>(null);
    const [trackingLoading, setTrackingLoading] = useState(false);

    useEffect(() => {
        loadOrders();
    }, []);

    const loadOrders = async () => {
        try {
            const res = await api.get("/orders/processing");
            setOrders(res.data);
        } catch {
            setOrders([]);
        } finally {
            setLoading(false);
        }
    };

    const handleTrackClick = async (trackingNumber: string) => {
        setTrackingLoading(true);
        setShowTrackingModal(true);
        setSelectedTracking(null);
        try {
            const data = await getTrackingInfo(trackingNumber);
            setSelectedTracking(data);
        } catch (error) {
            console.error("Failed to load tracking info", error);
        } finally {
            setTrackingLoading(false);
        }
    };

    const filtered = orders.filter(x => {
        const matchSearch = x.trackingNumber?.toLowerCase().includes(search.toLowerCase());
        const matchStatus = statusFilter === "All" || x.status === statusFilter;
        return matchSearch && matchStatus;
    });

    return (
        <div className="p-8 bg-slate-50 min-h-screen relative">
            <h1 className="text-4xl font-bold mb-8 text-slate-800 flex items-center gap-3">
                🚚 Processing Orders
            </h1>

            {/* SUMMARY */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-3xl p-6 shadow-md hover:shadow-lg transition">
                    <h2 className="text-lg font-medium opacity-90">Processing</h2>
                    <p className="text-4xl font-bold mt-2">{orders.filter(x => x.status === "Processing").length}</p>
                </div>
                <div className="bg-gradient-to-br from-orange-400 to-orange-500 text-white rounded-3xl p-6 shadow-md hover:shadow-lg transition">
                    <h2 className="text-lg font-medium opacity-90">Out For Delivery</h2>
                    <p className="text-4xl font-bold mt-2">{orders.filter(x => x.status === "Out").length}</p>
                </div>
                <div className="bg-gradient-to-br from-red-500 to-rose-600 text-white rounded-3xl p-6 shadow-md hover:shadow-lg transition">
                    <h2 className="text-lg font-medium opacity-90">Delayed</h2>
                    <p className="text-4xl font-bold mt-2">{orders.filter(x => x.status === "Delayed").length}</p>
                </div>
            </div>

            {/* FILTERS */}
            <div className="flex gap-4 mb-8 bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                <div className="flex-1 flex items-center gap-3 bg-slate-50 px-4 py-3 rounded-xl border border-slate-200">
                    <Search className="text-slate-400" size={20} />
                    <input
                        placeholder="Search tracking no..."
                        className="bg-transparent outline-none w-full text-slate-700"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <select
                    className="border border-slate-200 bg-slate-50 rounded-xl px-4 py-3 outline-none text-slate-700 font-medium cursor-pointer"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                >
                    <option value="All">All Statuses</option>
                    <option value="Processing">Processing</option>
                    <option value="Out">Out for Delivery</option>
                    <option value="Delayed">Delayed</option>
                </select>
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 text-sm font-semibold uppercase tracking-wider">
                        <tr>
                            <th className="p-5">Tracking</th>
                            <th>Receiver</th>
                            <th>Status</th>
                            <th>Expected Date</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-600">
                        {loading ? (
                            <tr>
                                <td colSpan={5} className="p-10 text-center text-slate-400 animate-pulse">Loading orders...</td>
                            </tr>
                        ) : filtered.length > 0 ? (
                            filtered.map(order => (
                                <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="p-5 font-mono text-indigo-600 font-medium">{order.trackingNumber}</td>
                                    <td className="font-medium text-slate-800">{order.receiverName}</td>
                                    <td>
                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold
                                            ${order.status === "Processing" ? "bg-blue-100 text-blue-700" :
                                                order.status === "Out" ? "bg-orange-100 text-orange-700" :
                                                    "bg-red-100 text-red-700"}`}>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td className="text-slate-500 text-sm">
                                        {order.expectedDate ? new Date(order.expectedDate).toLocaleDateString() : 'N/A'}
                                    </td>
                                    <td>
                                        <button 
                                            onClick={() => handleTrackClick(order.trackingNumber || order.id.toString())}
                                            className="bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white px-4 py-2 rounded-xl transition-all font-medium text-sm flex items-center gap-2">
                                            <Activity size={16} /> Track Order
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={5} className="p-10 text-center text-slate-400">No processing orders found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* TRACKING MODAL (Read-Only) */}
            {showTrackingModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                        {/* Header */}
                        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                                <Activity className="text-indigo-600" /> Order Tracking
                            </h3>
                            <button onClick={() => setShowTrackingModal(false)} className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 transition">
                                <X size={20} />
                            </button>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto p-6">
                            {trackingLoading ? (
                                <div className="flex flex-col items-center justify-center py-12 text-indigo-600">
                                    <Activity className="animate-spin mb-4" size={32} />
                                    <p className="font-medium animate-pulse">Loading timeline...</p>
                                </div>
                            ) : selectedTracking ? (
                                <div>
                                    <div className="bg-indigo-50 rounded-2xl p-5 mb-8 border border-indigo-100">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-xs text-indigo-400 font-semibold uppercase tracking-wider mb-1">Waybill No</p>
                                                <p className="font-mono text-lg font-bold text-indigo-900">{selectedTracking.trackingNumber}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-indigo-400 font-semibold uppercase tracking-wider mb-1">Current Status</p>
                                                <p className="text-lg font-bold text-indigo-900">{selectedTracking.status}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Timeline */}
                                    <div>
                                        <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-6">Tracking Timeline</h4>
                                        <TrackingTimeline 
                                            history={selectedTracking.history} 
                                            createdAt={selectedTracking.createdAt}
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-8 text-red-500 font-semibold">Failed to load tracking data.</div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ProcessingOrders;