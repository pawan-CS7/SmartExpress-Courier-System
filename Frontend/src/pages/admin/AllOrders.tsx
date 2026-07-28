import { useEffect, useMemo, useState } from "react";
import { getAllOrders } from "../../services/orderService";
import { getTrackingInfo, updateTrackingStatus } from "../../services/trackingService";
import type { OrderTracking } from "../../services/trackingService";
import type { Order } from "../../types/Order";

import {
    Package,
    Clock,
    CheckCircle,
    Search,
    MapPin,
    X,
    Activity,
    Printer
} from "lucide-react";
import WaybillModal from "../../components/WaybillModal";

function AllOrders() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    // Tracking Modal State
    const [showTrackingModal, setShowTrackingModal] = useState(false);
    const [selectedTracking, setSelectedTracking] = useState<OrderTracking | null>(null);
    const [trackingLoading, setTrackingLoading] = useState(false);

    // Waybill Modal State
    const [waybillOrder, setWaybillOrder] = useState<Order | null>(null);
    
    // Update Tracking State
    const [newStatus, setNewStatus] = useState("Picked Up");
    const [newLocation, setNewLocation] = useState("");
    const [newRemarks, setNewRemarks] = useState("");
    const [updateLoading, setUpdateLoading] = useState(false);

    useEffect(() => {
        loadOrders();
    }, []);

    const loadOrders = async () => {
        try {
            const data = await getAllOrders();
            if (Array.isArray(data)) setOrders(data);
            else if (Array.isArray(data.orders)) setOrders(data.orders);
            else if (Array.isArray(data.data)) setOrders(data.data);
            else setOrders([]);
        } catch {
            setOrders([]);
        } finally {
            setLoading(false);
        }
    };

    const handleTrackClick = async (trackingNo: string) => {
        setTrackingLoading(true);
        setShowTrackingModal(true);
        setSelectedTracking(null);
        try {
            const data = await getTrackingInfo(trackingNo);
            setSelectedTracking(data);
        } catch (error) {
            console.error("Failed to load tracking info", error);
        } finally {
            setTrackingLoading(false);
        }
    };

    const handleUpdateTracking = async () => {
        if (!selectedTracking) return;
        setUpdateLoading(true);
        try {
            await updateTrackingStatus(selectedTracking.orderId, newStatus, newLocation, newRemarks);
            // Refresh tracking info
            const data = await getTrackingInfo(selectedTracking.waybillId || selectedTracking.orderNo);
            setSelectedTracking(data);
            setNewRemarks("");
            setNewLocation("");
            // Refresh main order list
            loadOrders();
        } catch (error) {
            console.error("Failed to update tracking", error);
        } finally {
            setUpdateLoading(false);
        }
    };

    const filteredOrders = useMemo(() => {
        return orders.filter(x =>
            x.orderNo?.toLowerCase().includes(search.toLowerCase())
        );
    }, [orders, search]);

    const totalOrders = orders.length;
    const delivered = orders.filter(x => x.status === "Delivered").length;
    const pending = orders.filter(x => x.status === "Pending").length;

    if (loading) {
        return <div className="p-8 text-indigo-600 font-semibold animate-pulse">Loading orders...</div>;
    }

    return (
        <div className="min-h-screen p-8 bg-gradient-to-br from-slate-50 to-indigo-50 relative">
            <h1 className="text-4xl font-bold mb-2 text-slate-800">Orders Management</h1>
            <p className="text-gray-500 mb-8">Manage courier deliveries and track statuses</p>

            {/* KPI */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-3xl p-6 shadow-lg transform transition hover:scale-105">
                    <Package size={32} />
                    <h2 className="mt-3 font-medium opacity-90">Total Orders</h2>
                    <p className="text-4xl font-bold tracking-tight">{totalOrders}</p>
                </div>
                <div className="bg-gradient-to-r from-orange-400 to-red-500 text-white rounded-3xl p-6 shadow-lg transform transition hover:scale-105">
                    <Clock size={32} />
                    <h2 className="mt-3 font-medium opacity-90">Pending</h2>
                    <p className="text-4xl font-bold tracking-tight">{pending}</p>
                </div>
                <div className="bg-gradient-to-r from-emerald-400 to-teal-500 text-white rounded-3xl p-6 shadow-lg transform transition hover:scale-105">
                    <CheckCircle size={32} />
                    <h2 className="mt-3 font-medium opacity-90">Delivered</h2>
                    <p className="text-4xl font-bold tracking-tight">{delivered}</p>
                </div>
            </div>

            {/* SEARCH */}
            <div className="bg-white rounded-3xl shadow-sm p-5 mb-8 border border-slate-100">
                <div className="flex items-center gap-3 text-slate-400">
                    <Search />
                    <input
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search tracking no..."
                        className="w-full outline-none text-slate-700 placeholder-slate-400"
                    />
                </div>
            </div>

            {/* TABLE */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-slate-50/80 border-b border-slate-100 text-slate-500 text-sm font-semibold uppercase tracking-wider">
                        <tr>
                            <th className="p-5">ID</th>
                            <th>Tracking No</th>
                            <th>Client</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-600">
                        {filteredOrders.length > 0 ? (
                            filteredOrders.map(order => (
                                <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="p-5 font-medium text-slate-900">{order.id}</td>
                                    <td className="font-mono text-indigo-600">{order.orderNo}</td>
                                    <td className="font-medium text-slate-700">
                                        {order.client?.businessName || order.client?.ownerName || 'N/A'}
                                    </td>
                                    <td>
                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold
                                            ${order.status === "Delivered" ? "bg-emerald-100 text-emerald-700" :
                                              order.status === "Pending" ? "bg-orange-100 text-orange-700" :
                                              "bg-blue-100 text-blue-700"}`}>
                                            {order.status || 'Pending'}
                                        </span>
                                    </td>
                                     <td>
                                        <div className="flex items-center gap-2">
                                            <button 
                                                onClick={() => handleTrackClick(order.orderNo || order.id.toString())}
                                                className="bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white px-3.5 py-2 rounded-xl transition-all font-medium text-sm flex items-center gap-1.5 shadow-sm">
                                                <Activity size={16} /> Track
                                            </button>
                                            <button 
                                                onClick={() => setWaybillOrder(order)}
                                                title="Print Waybill / Shipping Label"
                                                className="bg-slate-100 text-slate-700 hover:bg-slate-900 hover:text-white px-3.5 py-2 rounded-xl transition-all font-medium text-sm flex items-center gap-1.5 shadow-sm">
                                                <Printer size={16} /> Print
                                            </button>
                                        </div>
                                     </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={5} className="p-8 text-center text-slate-400">
                                    No orders found
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* TRACKING MODAL */}
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
                                    <p className="font-medium animate-pulse">Fetching tracking details...</p>
                                </div>
                            ) : selectedTracking ? (
                                <div>
                                    <div className="bg-indigo-50/50 rounded-2xl p-5 mb-6 border border-indigo-100/50">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-xs text-indigo-400 font-semibold uppercase tracking-wider mb-1">Waybill No</p>
                                                <p className="font-mono text-lg font-bold text-indigo-900">{selectedTracking.waybillId}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-indigo-400 font-semibold uppercase tracking-wider mb-1">Current Status</p>
                                                <p className="text-lg font-bold text-indigo-900">{selectedTracking.status}</p>
                                            </div>
                                            <div className="col-span-2">
                                                <p className="text-xs text-indigo-400 font-semibold uppercase tracking-wider mb-1">Customer</p>
                                                <p className="font-medium text-indigo-900">{selectedTracking.customerName || 'N/A'}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Timeline */}
                                    <div className="mb-8">
                                        <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-6">Tracking Timeline</h4>
                                        <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
                                            {selectedTracking.history?.length > 0 ? (
                                                selectedTracking.history.map((h, i) => (
                                                    <div key={h.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                                                        <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-indigo-500 text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                                                            <MapPin size={16} />
                                                        </div>
                                                        <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-slate-50 p-4 rounded-2xl border border-slate-100 shadow-sm">
                                                            <div className="flex items-center justify-between mb-1">
                                                                <h5 className="font-bold text-slate-800">{h.status}</h5>
                                                                <time className="text-xs font-medium text-slate-400">{new Date(h.updatedAt).toLocaleString()}</time>
                                                            </div>
                                                            {h.location && (
                                                                <p className="text-sm font-semibold text-indigo-600 mb-1 flex items-center gap-1">
                                                                    <MapPin size={12} /> {h.location}
                                                                </p>
                                                            )}
                                                            <p className="text-sm text-slate-600">{h.remarks || 'No remarks'}</p>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="text-center py-8 text-slate-500">No tracking history available yet.</div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Update Form */}
                                    <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 mt-4">
                                        <h4 className="font-bold text-slate-800 mb-5 flex items-center gap-2">
                                            <Activity size={18} className="text-indigo-500" /> Post Status Update
                                        </h4>
                                        <div className="grid gap-5 md:grid-cols-2 mb-5">
                                            <div className="md:col-span-1">
                                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">New Status</label>
                                                <select 
                                                    value={newStatus}
                                                    onChange={e => setNewStatus(e.target.value)}
                                                    className="w-full bg-white border border-slate-300 text-slate-700 rounded-xl px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all font-medium shadow-sm">
                                                    <option value="Picked Up">Picked Up</option>
                                                    <option value="In Transit">In Transit</option>
                                                    <option value="Arrived at Hub">Arrived at Hub</option>
                                                    <option value="Out for Delivery">Out for Delivery</option>
                                                    <option value="Delivered">Delivered</option>
                                                    <option value="Cancelled">Cancelled</option>
                                                </select>
                                            </div>
                                            <div className="md:col-span-1">
                                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Current Location</label>
                                                <input 
                                                    type="text" 
                                                    value={newLocation}
                                                    onChange={e => setNewLocation(e.target.value)}
                                                    placeholder="e.g., Colombo Sort Facility"
                                                    className="w-full bg-white border border-slate-300 text-slate-700 rounded-xl px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all shadow-sm"
                                                />
                                            </div>
                                            <div className="md:col-span-2">
                                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Additional Remarks</label>
                                                <textarea 
                                                    value={newRemarks}
                                                    onChange={e => setNewRemarks(e.target.value)}
                                                    placeholder="Optional notes regarding the package..."
                                                    rows={2}
                                                    className="w-full bg-white border border-slate-300 text-slate-700 rounded-xl px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all resize-none shadow-sm"
                                                />
                                            </div>
                                        </div>
                                        <button 
                                            onClick={handleUpdateTracking}
                                            disabled={updateLoading}
                                            className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-md disabled:opacity-50 hover:shadow-lg flex items-center justify-center gap-2">
                                            {updateLoading ? <Activity size={18} className="animate-spin" /> : <MapPin size={18} />} 
                                            {updateLoading ? 'Updating Timeline...' : 'Submit Update'}
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-8 text-red-500 font-semibold">Failed to load tracking data.</div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* WAYBILL PRINT MODAL */}
            <WaybillModal 
                order={waybillOrder} 
                isOpen={!!waybillOrder} 
                onClose={() => setWaybillOrder(null)} 
            />
        </div>
    );
}

export default AllOrders;