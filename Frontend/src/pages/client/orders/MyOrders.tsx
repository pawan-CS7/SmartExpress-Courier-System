import { useEffect, useMemo, useState } from "react";
import { getMyOrders } from "../../../services/orderService";
import { Package, Clock, CheckCircle, Search, Activity, MapPin, X, Printer, Edit } from "lucide-react";
import { getTrackingInfo } from "../../../services/trackingService";
import type { OrderTracking } from "../../../services/trackingService";
import WaybillModal from "../../../components/WaybillModal";
import EditOrderModal from "../../../components/EditOrderModal";

function MyOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Tracking Modal State
  const [showTrackingModal, setShowTrackingModal] = useState(false);
  const [selectedTracking, setSelectedTracking] = useState<OrderTracking | null>(null);
  const [trackingLoading, setTrackingLoading] = useState(false);

  // Waybill Modal State
  const [waybillOrder, setWaybillOrder] = useState<any | null>(null);

  // Edit Order Modal State
  const [editingOrder, setEditingOrder] = useState<any | null>(null);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const data = await getMyOrders();
      setOrders(data);
    } catch (error) {
      console.log(error);
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

  const filtered = useMemo(() => {
    return orders.filter(
      x =>
        x.orderNo?.toLowerCase().includes(search.toLowerCase()) ||
        x.customerName?.toLowerCase().includes(search.toLowerCase())
    );
  }, [orders, search]);

  const total = orders.length;
  const active = orders.filter(x => ["Pending", "Processing", "Out"].includes(x.status)).length;
  const delivered = orders.filter(x => x.status === "Delivered").length;

  return (
    <div className="p-8 bg-slate-50 min-h-screen">
      <h1 className="text-4xl font-bold mb-2 text-slate-800">My Orders 📦</h1>
      <p className="text-slate-500 mb-8">View and track all your shipments</p>

      {/* KPI */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white rounded-3xl p-6 shadow-md">
          <Package className="mb-4 opacity-80" size={30} />
          <h2 className="text-sm font-medium uppercase tracking-wider opacity-90">Total Orders</h2>
          <p className="text-4xl font-bold mt-1">{total}</p>
        </div>

        <div className="bg-gradient-to-br from-amber-400 to-orange-500 text-white rounded-3xl p-6 shadow-md">
          <Activity className="mb-4 opacity-80" size={30} />
          <h2 className="text-sm font-medium uppercase tracking-wider opacity-90">Active Shipments</h2>
          <p className="text-4xl font-bold mt-1">{active}</p>
        </div>

        <div className="bg-gradient-to-br from-emerald-400 to-green-500 text-white rounded-3xl p-6 shadow-md">
          <CheckCircle className="mb-4 opacity-80" size={30} />
          <h2 className="text-sm font-medium uppercase tracking-wider opacity-90">Delivered</h2>
          <p className="text-4xl font-bold mt-1">{delivered}</p>
        </div>
      </div>

      {/* SEARCH */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 mb-8 flex items-center gap-3">
        <Search className="text-slate-400 ml-2" size={20} />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by Tracking No or Receiver Name..."
          className="w-full bg-transparent outline-none text-slate-700"
        />
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-slate-500 font-semibold text-sm uppercase tracking-wider">
            <tr>
              <th className="p-5 border-b border-slate-100">Tracking No</th>
              <th className="border-b border-slate-100">Barcode</th>
              <th className="border-b border-slate-100">Receiver</th>
              <th className="border-b border-slate-100">Destination</th>
              <th className="border-b border-slate-100">COD (Rs.)</th>
              <th className="border-b border-slate-100">Status</th>
              <th className="border-b border-slate-100">Created At</th>
              <th className="border-b border-slate-100 p-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-600">
            {loading ? (
              <tr>
                <td colSpan={8} className="text-center p-10 text-slate-400 animate-pulse">Loading orders...</td>
              </tr>
            ) : filtered.length > 0 ? (
              filtered.map(order => (
                <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-5 font-mono font-medium text-indigo-600">{order.orderNo}</td>
                  <td className="font-mono text-slate-600 text-sm">{order.waybillId || "N/A"}</td>
                  <td className="font-medium text-slate-800">{order.customerName}</td>
                  <td className="text-sm">
                    <div className="flex items-center gap-1 text-slate-500">
                      <MapPin size={14} />
                      <span className="truncate max-w-[150px]">{order.address || "N/A"}</span>
                    </div>
                  </td>
                  <td className="font-medium">{order.codAmount ? order.codAmount.toFixed(2) : "0.00"}</td>
                  <td>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold
                      ${["Processing", "Pending", "Out"].includes(order.status) ? "bg-orange-100 text-orange-700" :
                        order.status === "Delivered" ? "bg-green-100 text-green-700" :
                        "bg-slate-100 text-slate-700"}`}>
                      {order.status || "Unknown"}
                    </span>
                  </td>
                  <td className="text-sm text-slate-500">
                    {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="p-5 text-right">
                    <div className="inline-flex items-center gap-2">
                      <button 
                          onClick={() => handleTrackClick(order.orderNo || order.id.toString())}
                          className="bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white px-3.5 py-2 rounded-xl transition-all font-medium text-sm inline-flex items-center gap-1.5 shadow-sm">
                          <Activity size={16} /> Track
                      </button>
                      <button 
                          onClick={() => setWaybillOrder(order)}
                          title="Print Waybill / Shipping Label"
                          className="bg-slate-100 text-slate-700 hover:bg-slate-900 hover:text-white px-3.5 py-2 rounded-xl transition-all font-medium text-sm inline-flex items-center gap-1.5 shadow-sm">
                          <Printer size={16} /> Print
                      </button>
                      {order.status === "Pending" ? (
                          <button 
                              onClick={() => setEditingOrder(order)}
                              title="Edit Order Details"
                              className="bg-amber-50 text-amber-700 hover:bg-amber-500 hover:text-white px-3.5 py-2 rounded-xl transition-all font-medium text-sm inline-flex items-center gap-1.5 shadow-sm">
                              <Edit size={16} /> Edit
                          </button>
                      ) : (
                          <button 
                              disabled
                              title="Editing locked: Order is already in processing"
                              className="bg-slate-100 text-slate-400 opacity-60 cursor-not-allowed px-3 py-2 rounded-xl text-sm inline-flex items-center gap-1">
                              <Edit size={16} /> Edit
                          </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} className="text-center p-12 text-slate-400">
                  <Package className="mx-auto mb-3 opacity-30" size={40} />
                  No orders found.
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

      {/* EDIT ORDER MODAL */}
      <EditOrderModal
          order={editingOrder}
          isOpen={!!editingOrder}
          onClose={() => setEditingOrder(null)}
          onSaveSuccess={loadOrders}
      />
    </div>
  );
}

export default MyOrders;