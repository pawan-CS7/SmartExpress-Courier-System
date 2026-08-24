import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getAllOrders } from "../../services/orderService";
import { getTrackingInfo, updateTrackingStatus } from "../../services/trackingService";
import type { OrderTracking } from "../../services/trackingService";
import type { Order } from "../../types/Order";

import {
    Clock,
    Search,
    MapPin,
    X,
    Activity,
    Filter,
    LayoutGrid,
    Eye,
    RotateCcw,
    ChevronDown,
    ChevronUp,
    FileText
} from "lucide-react";
import FilterSidebar, { type FilterState } from "../../components/FilterSidebar";
import { branchService } from "../../services/branchService";
import type { Branch } from "../../types/branch";
import TrackingTimeline from "../../components/TrackingTimeline";

function AllOrders() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const location = useLocation();
    const navigate = useNavigate();

    // Filter State
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [branches, setBranches] = useState<Branch[]>([]);
    const [filters, setFilters] = useState<FilterState>(() => {
        const queryParams = new URLSearchParams(window.location.search);
        return {
            search: queryParams.get("search") || "",
            statuses: [],
            startDate: "",
            endDate: "",
            branchId: queryParams.get("branchId") || "",
            originBranchId: "",
            destinationBranchId: ""
        };
    });

    // Tracking Modal State
    const [showTrackingModal, setShowTrackingModal] = useState(false);
    const [selectedTracking, setSelectedTracking] = useState<OrderTracking | null>(null);
    const [trackingLoading, setTrackingLoading] = useState(false);

    // Update Tracking State
    const [newStatus, setNewStatus] = useState("Picked Up");
    const [newLocation, setNewLocation] = useState("");
    const [newRemarks, setNewRemarks] = useState("");
    const [updateLoading, setUpdateLoading] = useState(false);

    useEffect(() => {
        loadOrders();

        // Real-time synchronization: poll every 10 seconds and listen for custom events
        const interval = setInterval(() => {
            loadOrders(false);
        }, 10000);

        const handleOrdersUpdated = () => {
            loadOrders(false);
        };

        window.addEventListener("ordersUpdated", handleOrdersUpdated);

        return () => {
            clearInterval(interval);
            window.removeEventListener("ordersUpdated", handleOrdersUpdated);
        };
    }, []);

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const searchParam = queryParams.get("search");
        const branchIdParam = queryParams.get("branchId");
        if (searchParam && searchParam !== filters.search) {
            setFilters(prev => ({ ...prev, search: searchParam }));
        }
        if (branchIdParam && branchIdParam !== filters.branchId) {
            setFilters(prev => ({ ...prev, branchId: branchIdParam }));
        }

        // Fetch branches for filter
        branchService.getBranches().then(data => setBranches(data)).catch(console.error);
    }, [location.search]);

    const loadOrders = async (showSpinner = true) => {
        if (showSpinner) setLoading(true);
        try {
            const data = await getAllOrders(filters.branchId || undefined);
            if (Array.isArray(data)) setOrders(data);
            else if (Array.isArray(data.orders)) setOrders(data.orders);
            else if (Array.isArray(data.data)) setOrders(data.data);
            else setOrders([]);
        } catch {
            setOrders([]);
        } finally {
            if (showSpinner) setLoading(false);
        }
    };

    // Reload orders when branch filter changes
    useEffect(() => {
        loadOrders();
    }, [filters.branchId]);

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

    const handleUpdateTracking = async () => {
        if (!selectedTracking) return;
        setUpdateLoading(true);
        try {
            await updateTrackingStatus(selectedTracking.orderId, newStatus, newLocation, newRemarks);
            // Refresh tracking info
            const data = await getTrackingInfo(selectedTracking.trackingNumber);
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
        return orders.filter(x => {
            const matchSearch = x.trackingNumber?.toLowerCase().includes(filters.search.toLowerCase()) || 
                                x.customerName?.toLowerCase().includes(filters.search.toLowerCase());
            
            const matchStatus = filters.statuses.length === 0 || filters.statuses.includes(x.status || '');
            
            const orderDate = new Date(x.createdAt || '');
            const matchStartDate = !filters.startDate || orderDate >= new Date(filters.startDate);
            
            let matchEndDate = true;
            if (filters.endDate) {
                const endDate = new Date(filters.endDate);
                endDate.setHours(23, 59, 59, 999);
                matchEndDate = orderDate <= endDate;
            }

            return matchSearch && matchStatus && matchStartDate && matchEndDate;
        });
    }, [orders, filters]);

    const hasActiveFilters = filters.search !== '' || filters.statuses.length > 0 || filters.startDate !== '' || filters.endDate !== '' || (filters.branchId && filters.branchId !== '');

    const clearFilters = () => {
        setFilters({
            search: '',
            statuses: [],
            startDate: '',
            endDate: '',
            branchId: '',
            originBranchId: "",
            destinationBranchId: ""
        });
    };

    if (loading) {
        return <div className="p-8 text-indigo-600 font-semibold animate-pulse">Loading orders...</div>;
    }

    return (
        <div className="min-h-screen bg-[#F5F7FA] text-slate-800 font-sans">
            {/* Main Content Area */}
            <div className="pt-6 px-6">
                
                {/* Info Banner */}
                <div className="bg-[#FFF8E1] border border-[#FFE082] rounded-md p-3 flex items-center text-[#8D6E26] text-sm font-medium shadow-sm mb-4">
                    <Clock size={16} className="text-[#FF8F00] mr-2" />
                    If you need to check more than 100 rows, please use the Excel export option. Export All functions are available under the Export As menu. 
                    <a href="#" className="ml-1 text-blue-600 hover:underline cursor-pointer ml-1">Video Guide</a>
                </div>

                {/* Toolbar */}
                <div className="flex items-center justify-between bg-transparent mb-4">
                    {/* Left Controls */}
                    <div className="flex items-center gap-2">
                        <select className="border border-gray-200 text-gray-500 text-sm rounded-md px-3 py-2 outline-none bg-white min-w-[120px] shadow-sm cursor-pointer hover:border-gray-300">
                            <option>Waybill ID</option>
                        </select>
                        
                        <div className="relative flex items-center">
                            <input 
                                type="text"
                                placeholder="Search..."
                                value={filters.search}
                                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                                className="border border-gray-200 text-gray-700 text-sm rounded-md px-3 py-2 w-64 outline-none bg-white shadow-sm placeholder-gray-300 focus:border-red-400 focus:ring-1 focus:ring-red-400"
                            />
                        </div>

                        <button className="bg-[#E74C3C] hover:bg-[#D35400] text-white p-2 rounded-md shadow-sm transition-colors cursor-pointer">
                            <Search size={18} />
                        </button>
                        
                        <button onClick={clearFilters} className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-500 p-2 rounded-md shadow-sm transition-colors cursor-pointer ml-1">
                            <RotateCcw size={18} />
                        </button>
                    </div>

                    {/* Right Controls */}
                    <div className="flex items-center gap-3">
                        <div className="flex items-center bg-white border border-gray-200 rounded-md shadow-sm">
                            <select className="px-3 py-1.5 text-sm text-gray-600 outline-none bg-transparent cursor-pointer hover:bg-gray-50 rounded-md">
                                <option>10</option>
                                <option>25</option>
                                <option>50</option>
                                <option>100</option>
                            </select>
                        </div>
                        
                        <div className="flex items-center bg-white border border-gray-200 rounded-md shadow-sm">
                            <select className="px-3 py-1.5 text-sm text-gray-600 outline-none bg-transparent cursor-pointer hover:bg-gray-50 rounded-md">
                                <option>Export as</option>
                                <option>Excel</option>
                                <option>PDF</option>
                            </select>
                        </div>

                        <button className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-500 p-2 rounded-md shadow-sm transition-colors cursor-pointer">
                            <LayoutGrid size={18} />
                        </button>

                        <button 
                            onClick={() => setIsFilterOpen(true)}
                            className="bg-[#E74C3C] hover:bg-[#D35400] text-white p-2 rounded-md shadow-sm transition-colors cursor-pointer relative"
                        >
                            <Filter size={18} />
                            {hasActiveFilters && (
                                <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                            )}
                        </button>
                    </div>
                </div>

                {/* Table Section */}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden mb-8">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-max">
                            <thead>
                                <tr className="bg-white border-b border-gray-100">
                                    <th className="py-4 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center cursor-pointer hover:bg-gray-50">
                                        <div className="flex items-center justify-center gap-1">
                                            <ChevronUp size={14} className="text-gray-300" /> 
                                            ORDER DATE 
                                            <ChevronDown size={14} className="text-gray-300" />
                                        </div>
                                    </th>
                                    <th className="py-4 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">WAYBILL ID</th>
                                    <th className="py-4 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">ORDER ID</th>
                                    <th className="py-4 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">REMARK</th>
                                    <th className="py-4 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">DELIVERY ATTEMPT</th>
                                    <th className="py-4 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center cursor-pointer hover:bg-gray-50">
                                        <div className="flex items-center justify-center gap-1">
                                            <ChevronUp size={14} className="text-gray-300" /> 
                                            CLIENT ID 
                                            <ChevronDown size={14} className="text-gray-300" />
                                        </div>
                                    </th>
                                    <th className="py-4 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center cursor-pointer hover:bg-gray-50">
                                        <div className="flex items-center justify-center gap-1">
                                            <ChevronUp size={14} className="text-gray-300" /> 
                                            CLIENT NAME 
                                            <ChevronDown size={14} className="text-gray-300" />
                                        </div>
                                    </th>
                                    <th className="py-4 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">STATUS</th>
                                    <th className="py-4 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">DELIVERY</th>
                                    <th className="py-4 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">ACTIONS</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filteredOrders.length > 0 ? (
                                    filteredOrders.map(order => (
                                        <tr key={order.id} className="hover:bg-[#F8FAFC] transition-colors bg-white group">
                                            {/* Order Date */}
                                            <td className="py-3 px-4 text-center">
                                                <div className="text-gray-500 text-[13px] font-medium tracking-tight">
                                                    {order.createdAt ? new Date(order.createdAt).toISOString().split('T')[0] : 'N/A'}
                                                </div>
                                                <div className="text-gray-400 text-xs">
                                                    {order.createdAt ? new Date(order.createdAt).toTimeString().split(' ')[0] : ''}
                                                </div>
                                            </td>
                                            
                                            {/* Waybill ID */}
                                            <td className="py-3 px-4 text-center">
                                                <span className="text-[#3498DB] font-semibold text-[13px] cursor-pointer hover:underline">
                                                    {order.trackingNumber}
                                                </span>
                                            </td>
                                            
                                            {/* Order ID */}
                                            <td className="py-3 px-4 text-center text-gray-600 text-[13px] font-medium">
                                                {order.id}
                                            </td>
                                            
                                            {/* Remark */}
                                            <td className="py-3 px-4 text-center text-gray-400 text-xs font-medium">
                                                {order.remarks || '-'}
                                            </td>
                                            
                                            {/* Delivery Attempt */}
                                            <td className="py-3 px-4 text-center">
                                                <div className="inline-flex items-center justify-center border-2 border-[#2ECC71] rounded text-[#2ECC71] font-bold text-xs px-2 py-0.5 min-w-[28px]">
                                                    0
                                                </div>
                                            </td>
                                            
                                            {/* Client ID */}
                                            <td className="py-3 px-4">
                                                <div className="flex items-center justify-center gap-2">
                                                    <div className="w-5 h-5 rounded-full bg-[#EBF5FB] text-[#3498DB] flex items-center justify-center text-[10px] font-bold">
                                                        A
                                                    </div>
                                                    <span className="text-[#3498DB] text-[13px] font-medium">
                                                        CLI{(order.clientId || 0).toString().padStart(6, '0')}
                                                    </span>
                                                </div>
                                            </td>
                                            
                                            {/* Client Name */}
                                            <td className="py-3 px-4 text-center text-gray-600 text-[13px] font-medium truncate max-w-[200px]">
                                                {order.clientName || order.client?.businessName || order.client?.ownerName || 'N/A'}
                                            </td>
                                            
                                            {/* Status */}
                                            <td className="py-3 px-4 text-center">
                                                <span className="bg-[#3498DB] text-white text-[12px] font-medium px-4 py-1.5 rounded-full inline-block shadow-sm w-28 text-center">
                                                    {order.status || 'Processing'}
                                                </span>
                                            </td>
                                            
                                            {/* Delivery */}
                                            <td className="py-3 px-4 text-center">
                                                <div className="inline-flex items-center justify-center w-8 h-8 rounded-full border-2 border-gray-200 text-gray-500 font-bold text-[10px]">
                                                    0%
                                                </div>
                                            </td>
                                            
                                            {/* Actions */}
                                            <td className="py-3 px-4 text-center">
                                                <div className="flex items-center justify-center gap-2">
                                                    <button 
                                                        onClick={() => handleTrackClick(order.trackingNumber || order.id.toString())}
                                                        title="Track Order"
                                                        className="text-[#1ABC9C] hover:text-[#16A085] transition-colors p-1.5 rounded bg-[#E8F8F5] hover:bg-[#D1F2EB] inline-flex items-center justify-center"
                                                    >
                                                        <Eye size={16} strokeWidth={2.5} />
                                                    </button>
                                                    <button 
                                                        onClick={() => navigate(`/admin/order-details/${order.trackingNumber}`)}
                                                        title="More Details"
                                                        className="flex items-center gap-1 text-[#3498DB] hover:text-[#2980B9] transition-colors p-1.5 px-3 rounded bg-[#EBF5FB] hover:bg-[#D6EAF8] text-xs font-bold"
                                                    >
                                                        <FileText size={14} /> More Details
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={10} className="py-12 text-center text-gray-400 font-medium">
                                            No orders found matching your criteria
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
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
                                                <p className="font-mono text-lg font-bold text-indigo-900">{selectedTracking.trackingNumber}</p>
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
                                        <TrackingTimeline 
                                            history={selectedTracking.history} 
                                            createdAt={selectedTracking.createdAt}
                                            draftStatus={newStatus}
                                            draftLocation={newLocation}
                                            draftRemarks={newRemarks}
                                        />
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
                                                    <option value="Arrived at Warehouse">Arrived at Warehouse</option>
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

            {/* FILTER SIDEBAR */}
            <FilterSidebar
                isOpen={isFilterOpen}
                onClose={() => setIsFilterOpen(false)}
                filters={filters}
                setFilters={setFilters}
                showBranchFilter={true}
                branches={branches}
                statusOptions={[
                    { label: "Pending", value: "Pending" },
                    { label: "Picked Up", value: "Picked Up" },
                    { label: "In Transit", value: "In Transit" },
                    { label: "Arrived at Warehouse", value: "Arrived at Warehouse" },
                    { label: "Out for Delivery", value: "Out for Delivery" },
                    { label: "Delivered", value: "Delivered" },
                    { label: "Failed to Deliver", value: "Failed to Deliver" },
                    { label: "Returned", value: "Returned" },
                    { label: "Cancelled", value: "Cancelled" }
                ]}
            />
        </div>
    );
}

export default AllOrders;