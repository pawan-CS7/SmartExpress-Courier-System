import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { getAllOrders, assignRider } from "../../services/orderService";
import { getTrackingInfo, updateTrackingStatus } from "../../services/trackingService";
import type { OrderTracking } from "../../services/trackingService";
import { getRiders } from "../../services/riderService";
import type { Rider } from "../../services/riderService";
import type { Order } from "../../types/Order";

import {
    Package,
    Clock,
    CheckCircle,
    Search,
    MapPin,
    X,
    Activity,
    Printer,
    Filter,
    FileText,
    Inbox,
    Truck,
    ScanBarcode,
    ListOrdered,
    AlertCircle,
    RefreshCw
} from "lucide-react";
import WaybillModal from "../../components/WaybillModal";
import FilterSidebar, { type FilterState } from "../../components/FilterSidebar";
import { branchService } from "../../services/branchService";
import type { Branch } from "../../types/branch";
import { getCurrentUser } from "../../utils/auth";
import TrackingTimeline from "../../components/TrackingTimeline";

function BranchOrders() {
    const user = getCurrentUser();
    const isAdmin = user.role === "Admin" || user.role === "Owner";
    
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const location = useLocation();
    const navigate = useNavigate();
    const { branchId } = useParams<{ branchId?: string }>();
    const [searchParams, setSearchParams] = useSearchParams();
    
    const [highlightId, setHighlightId] = useState<number | null>(null);
    const [branchRiders, setBranchRiders] = useState<Rider[]>([]);

    // Determine the branch context
    const effectiveBranchId = isAdmin ? (branchId ? Number(branchId) : null) : (user.branchId ? Number(user.branchId) : null);

    // Handle Admin Redirection if no branch selected
    useEffect(() => {
        if (isAdmin && !effectiveBranchId) {
            const currentTab = searchParams.get("tab") || "all";
            navigate(`/admin/branch-orders-select?redirectTo=${currentTab}`, { replace: true });
        }
    }, [isAdmin, effectiveBranchId, navigate, searchParams]);

    // Active Tab from URL
    const activeTab = searchParams.get("tab") || "all";

    const handleTabChange = (tab: string) => {
        setSearchParams(prev => {
            prev.set("tab", tab);
            return prev;
        });
    };

    const [receiveBarcode, setReceiveBarcode] = useState("");
    const [receiveLoading, setReceiveLoading] = useState(false);

    const [dispatchBarcode, setDispatchBarcode] = useState("");
    const [dispatchLoading, setDispatchLoading] = useState(false);

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
            branchId: "",
            originBranchId: queryParams.get("originBranchId") || "",
            destinationBranchId: queryParams.get("destinationBranchId") || ""
        };
    });

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
        loadRiders();

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
        
        if (searchParam && searchParam !== filters.search) {
            setFilters(prev => ({ ...prev, search: searchParam }));
        }

        const hId = queryParams.get("highlightId");
        if (hId) {
            const id = Number(hId);
            setHighlightId(id);
            setTimeout(() => {
                const element = document.getElementById(`order-row-${id}`);
                if (element) {
                    element.scrollIntoView({ behavior: "smooth", block: "center" });
                }
            }, 500);
            setTimeout(() => {
                setHighlightId(null);
            }, 3500);
        }

        // Fetch branches for filter
        branchService.getBranches().then(data => setBranches(data)).catch(console.error);
    }, [location.search]);

    const loadRiders = async () => {
        try {
            const riders = await getRiders();
            const activeRiders = riders.filter(r => r.isActive && r.branchId === effectiveBranchId);
            setBranchRiders(activeRiders);
        } catch (error) {
            console.error("Failed to fetch riders", error);
        }
    };

    const loadOrders = async (showSpinner = true) => {
        if (showSpinner) setLoading(true);
        try {
            // Only fetch if we have an effective branch context
            if (effectiveBranchId) {
                const data = await getAllOrders(effectiveBranchId, undefined, undefined);
                if (Array.isArray(data)) setOrders(data);
                else if (data && Array.isArray(data.orders)) setOrders(data.orders);
                else if (data && Array.isArray(data.data)) setOrders(data.data);
                else setOrders([]);
            }
        } catch {
            setOrders([]);
        } finally {
            if (showSpinner) setLoading(false);
        }
    };

    // Reload orders when branch filter changes or effective branch changes
    useEffect(() => {
        loadOrders();
        loadRiders();
    }, [filters.originBranchId, filters.destinationBranchId, effectiveBranchId]);

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
            const data = await getTrackingInfo(selectedTracking.trackingNumber);
            setSelectedTracking(data);
            setNewRemarks("");
            setNewLocation("");
            loadOrders();
        } catch (error) {
            console.error("Failed to update tracking", error);
        } finally {
            setUpdateLoading(false);
        }
    };

    const handleReceiveIncoming = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!receiveBarcode) return;
        
        // Find order
        const targetOrder = orders.find(o => o.trackingNumber === receiveBarcode);
        if (!targetOrder) {
            alert("Tracking number not found in incoming shipments");
            setReceiveBarcode("");
            return;
        }

        setReceiveLoading(true);
        try {
            await updateTrackingStatus(
                targetOrder.id,
                "Collected at Destination Branch",
                "Local Branch",
                "Received via Barcode Scanner"
            );
            setReceiveBarcode("");
            loadOrders();
        } catch (error) {
            console.error("Failed to receive order", error);
            alert("Failed to receive order");
            setReceiveBarcode("");
        } finally {
            setReceiveLoading(false);
        }
    };

    const handleDispatchToHub = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!dispatchBarcode) return;
        
        // Find order
        const targetOrder = orders.find(o => o.trackingNumber === dispatchBarcode);
        if (!targetOrder) {
            alert("Tracking number not found in orders");
            setDispatchBarcode("");
            return;
        }

        if (targetOrder.status !== "Collected at Branch" && targetOrder.status !== "Collected" && targetOrder.status !== "Processing" && targetOrder.status !== "Pending") {
            alert("Only Pending/Processing/Collected packages can be dispatched to Warehouse");
            setDispatchBarcode("");
            return;
        }

        setDispatchLoading(true);
        try {
            await updateTrackingStatus(
                targetOrder.id,
                "Dispatched to Warehouse",
                "En Route",
                "Dispatched to Warehouse"
            );
            setDispatchBarcode("");
            loadOrders();
        } catch (error) {
            console.error("Failed to dispatch order", error);
            alert("Failed to dispatch order");
            setDispatchBarcode("");
        } finally {
            setDispatchLoading(false);
        }
    };

    const handleMarkCollected = async (orderId: number) => {
        try {
            await updateTrackingStatus(
                orderId,
                "Collected at Branch",
                "Local Branch",
                "Collected from sender"
            );
            loadOrders();
        } catch (error) {
            console.error("Failed to mark as collected", error);
            alert("Failed to mark as collected");
        }
    };

    const handleMarkReturned = async (orderId: number) => {
        if (!window.confirm("Are you sure you want to mark this package as Returned?")) return;
        try {
            await updateTrackingStatus(
                orderId,
                "Returned",
                "Local Branch",
                "Maximum delivery attempts reached / Customer rejected"
            );
            loadOrders();
        } catch (error: any) {
            console.error("Failed to mark as returned", error);
            alert(error.response?.data?.message || "Failed to mark as returned");
        }
    };

    const [assignBarcode, setAssignBarcode] = useState("");
    const [selectedRiderId, setSelectedRiderId] = useState("");
    const [assignLoading, setAssignLoading] = useState(false);

    const handleAssignToRider = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!assignBarcode || !selectedRiderId) return;

        setAssignLoading(true);
        try {
            await assignRider(assignBarcode, parseInt(selectedRiderId));
            setAssignBarcode("");
            loadOrders();
        } catch (error: any) {
            console.error("Failed to assign rider", error);
            alert(error.response?.data?.message || "Failed to assign rider");
            setAssignBarcode("");
        } finally {
            setAssignLoading(false);
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

            if (!matchSearch || !matchStatus || !matchStartDate || !matchEndDate) {
                return false;
            }

            // Branch Manager / Admin Queue Filtering based on Tab
            if (activeTab === "collection") {
                return x.originBranchId === effectiveBranchId && (x.status === "Pending" || x.status === "Processing");
            }
            if (activeTab === "collected") {
                return x.originBranchId === effectiveBranchId && (x.status === "Collected at Branch" || x.status === "Collected");
            }
            if (activeTab === "outbound") {
                return x.originBranchId === effectiveBranchId && x.status === "Dispatched to Warehouse";
            }
            if (activeTab === "incoming") {
                return x.destinationBranchId === effectiveBranchId && x.status === "Dispatched to Destination Branch";
            }
            if (activeTab === "delivery") {
                return x.destinationBranchId === effectiveBranchId && x.currentBranchId === effectiveBranchId && (x.status === "Received at Destination Branch" || x.status === "Collected at Destination Branch");
            }
            if (activeTab === "out-for-delivery") {
                return x.destinationBranchId === effectiveBranchId && x.status === "Out for Delivery";
            }
            if (activeTab === "delivered") {
                return (x.originBranchId === effectiveBranchId || x.destinationBranchId === effectiveBranchId) && x.status === "Delivered";
            }
            if (activeTab === "issues") {
                return x.destinationBranchId === effectiveBranchId && x.status === "Failed to Deliver";
            }
            if (activeTab === "returned") {
                return (x.originBranchId === effectiveBranchId || x.destinationBranchId === effectiveBranchId) && x.status === "Returned";
            }
            
            // "all" tab or other
            return x.originBranchId === effectiveBranchId || x.destinationBranchId === effectiveBranchId;
        });
    }, [orders, filters, activeTab, effectiveBranchId]);

    const hasActiveFilters = filters.search !== '' || filters.statuses.length > 0 || filters.startDate !== '' || filters.endDate !== '' || (filters.originBranchId && filters.originBranchId !== '') || (filters.destinationBranchId && filters.destinationBranchId !== '');

    const clearFilters = () => {
        setFilters({
            search: '',
            statuses: [],
            startDate: '',
            endDate: '',
            branchId: '',
            originBranchId: '',
            destinationBranchId: ''
        });
    };

    const totalOrders = orders.length;
    const delivered = orders.filter(x => x.status === "Delivered").length;
    const pending = orders.filter(x => x.status === "Pending").length;

    if (loading) {
        return <div className="p-8 text-indigo-600 font-semibold animate-pulse">Loading orders...</div>;
    }

    const getBranchName = (id?: number) => {
        if (!id) return "N/A";
        const b = branches.find(b => b.id === id);
        return b ? b.name : `Branch ${id}`;
    };

    return (
        <div className="min-h-screen p-8 bg-gradient-to-br from-slate-50 to-indigo-50 relative">
            <h1 className="text-4xl font-bold mb-2 text-slate-800">Branch Orders</h1>
            <p className="text-gray-500 mb-8">Manage courier deliveries and track statuses for your branch</p>

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

            {/* QUEUE TABS */}
            <div className="flex gap-4 mb-6 overflow-x-auto pb-2">
                <button 
                    onClick={() => handleTabChange("all")}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold whitespace-nowrap transition-all shadow-sm ${activeTab === "all" ? "bg-slate-800 text-white" : "bg-white text-slate-600 hover:bg-slate-100"}`}
                >
                    <ListOrdered size={18} /> All Orders
                </button>
                <button 
                    onClick={() => handleTabChange("collection")}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold whitespace-nowrap transition-all shadow-sm ${activeTab === "collection" ? "bg-indigo-600 text-white" : "bg-white text-slate-600 hover:bg-slate-100"}`}
                >
                    <Package size={18} /> Collection Queue
                </button>
                <button 
                    onClick={() => handleTabChange("collected")}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold whitespace-nowrap transition-all shadow-sm ${activeTab === "collected" ? "bg-emerald-600 text-white" : "bg-white text-slate-600 hover:bg-slate-100"}`}
                >
                    <CheckCircle size={18} /> Collected
                </button>
                <button 
                    onClick={() => handleTabChange("outbound")}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold whitespace-nowrap transition-all shadow-sm ${activeTab === "outbound" ? "bg-indigo-600 text-white" : "bg-white text-slate-600 hover:bg-slate-100"}`}
                >
                    <Package size={18} /> Dispatched to Warehouse
                </button>
                <button 
                    onClick={() => handleTabChange("incoming")}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold whitespace-nowrap transition-all shadow-sm ${activeTab === "incoming" ? "bg-indigo-600 text-white" : "bg-white text-slate-600 hover:bg-slate-100"}`}
                >
                    <Inbox size={18} /> Incoming Shipments
                </button>
                <button 
                    onClick={() => handleTabChange("delivery")}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold whitespace-nowrap transition-all shadow-sm ${activeTab === "delivery" ? "bg-indigo-600 text-white" : "bg-white text-slate-600 hover:bg-slate-100"}`}
                >
                    <Truck size={18} /> Delivery Queue
                </button>
                <button 
                    onClick={() => handleTabChange("out-for-delivery")}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold whitespace-nowrap transition-all shadow-sm ${activeTab === "out-for-delivery" ? "bg-blue-600 text-white" : "bg-white text-slate-600 hover:bg-slate-100"}`}
                >
                    <Truck size={18} /> Out for Delivery
                </button>
                <button 
                    onClick={() => handleTabChange("delivered")}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold whitespace-nowrap transition-all shadow-sm ${activeTab === "delivered" ? "bg-emerald-600 text-white" : "bg-white text-slate-600 hover:bg-slate-100"}`}
                >
                    <CheckCircle size={18} /> Delivered
                </button>
                <button 
                    onClick={() => handleTabChange("issues")}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold whitespace-nowrap transition-all shadow-sm ${activeTab === "issues" ? "bg-red-600 text-white" : "bg-white text-slate-600 hover:bg-slate-100"}`}
                >
                    <AlertCircle size={18} /> Delivery Issues
                </button>
                <button 
                    onClick={() => handleTabChange("returned")}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold whitespace-nowrap transition-all shadow-sm ${activeTab === "returned" ? "bg-slate-800 text-white" : "bg-white text-slate-600 hover:bg-slate-100"}`}
                >
                    <RefreshCw size={18} /> Returned
                </button>
            </div>

            {/* OUTBOUND SHIPMENTS SCANNER */}
            {activeTab === "outbound" && (
                <div className="bg-white rounded-3xl shadow-sm p-6 mb-8 border border-slate-100 bg-gradient-to-r from-orange-50 to-white">
                    <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <ScanBarcode className="text-orange-600" /> Scanner: Dispatch to Warehouse
                    </h3>
                    <form onSubmit={handleDispatchToHub} className="flex gap-4">
                        <input 
                            type="text"
                            placeholder="Scan or type Waybill Barcode..."
                            value={dispatchBarcode}
                            onChange={(e) => setDispatchBarcode(e.target.value)}
                            className="flex-1 px-4 py-3 bg-white border border-slate-300 rounded-lg outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all text-slate-700 shadow-sm uppercase"
                            autoFocus
                        />
                        <button 
                            type="submit"
                            disabled={!dispatchBarcode || dispatchLoading}
                            className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-3 rounded-lg font-bold transition-all shadow-sm disabled:opacity-50"
                        >
                            {dispatchLoading ? 'Processing...' : 'Dispatch'}
                        </button>
                    </form>
                </div>
            )}

            {/* INCOMING SHIPMENTS SCANNER */}
            {activeTab === "incoming" && (
                <div className="bg-white rounded-3xl shadow-sm p-6 mb-8 border border-slate-100 bg-gradient-to-r from-indigo-50 to-white">
                    <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <ScanBarcode className="text-indigo-600" /> Scanner: Receive Incoming Shipment
                    </h3>
                    <form onSubmit={handleReceiveIncoming} className="flex gap-4">
                        <input 
                            type="text"
                            placeholder="Scan or type Waybill Barcode..."
                            value={receiveBarcode}
                            onChange={(e) => setReceiveBarcode(e.target.value)}
                            className="flex-1 px-4 py-3 bg-white border border-slate-300 rounded-lg outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all text-slate-700 shadow-sm uppercase"
                            autoFocus
                        />
                        <button 
                            type="submit"
                            disabled={!receiveBarcode || receiveLoading}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-lg font-bold transition-all shadow-sm disabled:opacity-50"
                        >
                            {receiveLoading ? 'Processing...' : 'Receive Package'}
                        </button>
                    </form>
                </div>
            )}

            {/* RIDER ASSIGNMENT SCANNER */}
            {(activeTab === "delivery" || activeTab === "issues") && (
                <div className="bg-white rounded-3xl shadow-sm p-6 mb-8 border border-slate-100 bg-gradient-to-r from-blue-50 to-white">
                    <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <ScanBarcode className="text-blue-600" /> Scanner: Assign to Rider
                    </h3>
                    <form onSubmit={handleAssignToRider} className="flex gap-4">
                        <select
                            value={selectedRiderId}
                            onChange={(e) => setSelectedRiderId(e.target.value)}
                            className="w-48 px-4 py-3 bg-white border border-slate-300 rounded-lg outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all text-slate-700 shadow-sm"
                            required
                        >
                            <option value="" disabled>Select Rider...</option>
                            {branchRiders.map(rider => (
                                <option key={rider.id} value={rider.id}>{rider.name} ({rider.riderId})</option>
                            ))}
                        </select>
                        <input 
                            type="text"
                            placeholder="Scan Waybill Barcode..."
                            value={assignBarcode}
                            onChange={(e) => setAssignBarcode(e.target.value)}
                            className="flex-1 px-4 py-3 bg-white border border-slate-300 rounded-lg outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all text-slate-700 shadow-sm uppercase"
                            autoFocus
                        />
                        <button 
                            type="submit"
                            disabled={!assignBarcode || !selectedRiderId || assignLoading}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-bold transition-all shadow-sm disabled:opacity-50"
                        >
                            {assignLoading ? 'Assigning...' : 'Assign'}
                        </button>
                    </form>
                </div>
            )}

            {/* SEARCH & FILTERS */}
            <div className="bg-white rounded-3xl shadow-sm p-5 mb-8 border border-slate-100">
                <div className="flex items-center gap-4 bg-slate-50 p-2 rounded-xl">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                        <input 
                            type="text"
                            placeholder="Search by Tracking No, Name..."
                            value={filters.search}
                            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-lg outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all text-slate-700 shadow-sm"
                        />
                    </div>
                    <button 
                        onClick={() => setIsFilterOpen(true)}
                        className={`relative bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 px-6 py-3 rounded-lg font-bold transition-all shadow-sm flex items-center gap-2 ${hasActiveFilters ? 'ring-2 ring-indigo-500' : ''}`}
                    >
                        <Filter size={18} /> Filters
                        {hasActiveFilters && <span className="w-2 h-2 rounded-full bg-indigo-500 absolute top-2 right-2"></span>}
                    </button>
                    {hasActiveFilters && (
                        <button 
                            onClick={clearFilters}
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
                                <th>Client / Customer</th>
                                {isAdmin && <th>Origin / Dest.</th>}
                                {isAdmin && <th>Current Location</th>}
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-slate-600">
                            {filteredOrders.length > 0 ? (
                                filteredOrders.map(order => (
                                    <tr 
                                        id={`order-row-${order.id}`}
                                        key={order.id} 
                                        className={`transition-colors duration-700 ${highlightId === order.id ? 'bg-amber-100' : 'hover:bg-slate-50/50'}`}
                                    >
                                        <td className="p-5 font-mono text-indigo-600 font-bold">{order.trackingNumber}</td>
                                        <td className="font-medium text-slate-700">
                                            <div className="text-sm">{order.client?.businessName || order.client?.ownerName || 'N/A'}</div>
                                            <div className="text-xs text-slate-400">To: {order.customerName}</div>
                                        </td>
                                        {isAdmin && (
                                            <td>
                                                <div className="text-sm font-medium">{getBranchName(order.originBranchId)}</div>
                                                <div className="text-xs text-slate-400">→ {getBranchName(order.destinationBranchId)}</div>
                                            </td>
                                        )}
                                        {isAdmin && (
                                            <td>
                                                <div className="inline-flex items-center gap-1 text-sm bg-slate-100 px-2 py-1 rounded-md text-slate-700">
                                                    <MapPin size={12} className="text-indigo-500" />
                                                    {getBranchName(order.currentBranchId)}
                                                </div>
                                            </td>
                                        )}
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
                                                    onClick={() => handleTrackClick(order.trackingNumber || order.id.toString())}
                                                    className="bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white px-3.5 py-2 rounded-xl transition-all font-medium text-sm flex items-center gap-1.5 shadow-sm">
                                                    <Activity size={16} /> Track
                                                </button>
                                                <button 
                                                    onClick={() => navigate(`/admin/order-details/${order.trackingNumber}`)}
                                                    className="bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white px-3.5 py-2 rounded-xl transition-all font-medium text-sm flex items-center gap-1.5 shadow-sm">
                                                    <FileText size={16} /> Details
                                                </button>
                                                {activeTab === "collection" && order.status === "Processing" && (
                                                    <button 
                                                        onClick={() => handleMarkCollected(order.id)}
                                                        className="bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white px-3.5 py-2 rounded-xl transition-all font-medium text-sm flex items-center gap-1.5 shadow-sm">
                                                        <CheckCircle size={16} /> Mark Collected
                                                    </button>
                                                )}
                                                {activeTab === "issues" && (
                                                    <button 
                                                        onClick={() => handleMarkReturned(order.id)}
                                                        className="bg-red-50 text-red-600 hover:bg-red-600 hover:text-white px-3.5 py-2 rounded-xl transition-all font-medium text-sm flex items-center gap-1.5 shadow-sm">
                                                        <RefreshCw size={16} /> Mark Returned
                                                    </button>
                                                )}
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
                                    <td colSpan={isAdmin ? 6 : 4} className="p-12 text-center text-slate-400 bg-slate-50/50">
                                        <div className="flex flex-col items-center justify-center">
                                            <Package size={48} className="text-slate-300 mb-4" />
                                            <p className="text-lg font-medium">No orders found in this queue.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
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
                                                    <option value="Processing">Processing</option>
                                                    <option value="Collected">Collected</option>
                                                    <option value="In Transit">In Transit</option>
                                                    <option value="Dispatched to Warehouse">Dispatched to Warehouse</option>
                                                    <option value="Received at Destination Branch">Received at Destination Branch</option>
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

            {/* FILTER SIDEBAR */}
            <FilterSidebar
                isOpen={isFilterOpen}
                onClose={() => setIsFilterOpen(false)}
                filters={filters}
                setFilters={setFilters}
                showBranchFilter={isAdmin}
                branches={branches}
                statusOptions={[
                    { label: "Pending", value: "Pending" },
                    { label: "Processing", value: "Processing" },
                    { label: "Collected", value: "Collected" },
                    { label: "Collected at Branch", value: "Collected at Branch" },
                    { label: "Dispatched to Warehouse", value: "Dispatched to Warehouse" },
                    { label: "Collected at Warehouse", value: "Collected at Warehouse" },
                    { label: "Dispatched to Destination Branch", value: "Dispatched to Destination Branch" },
                    { label: "Received at Destination Branch", value: "Received at Destination Branch" },
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

export default BranchOrders;