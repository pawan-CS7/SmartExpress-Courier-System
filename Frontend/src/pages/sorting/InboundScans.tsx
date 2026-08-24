import { useState, useRef, useEffect } from "react";
import { PackageCheck, FileText, Loader2 } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { inboundScan } from "../../services/sortingService";
import { getAllOrders } from "../../services/orderService";
import type { Order } from "../../types/Order";

function InboundScans() {
  const [barcode, setBarcode] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [inboundOrders, setInboundOrders] = useState<Order[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const loadOrders = async () => {
    try {
      const data = await getAllOrders();
      let ordersArray: Order[] = [];
      if (Array.isArray(data)) ordersArray = data;
      else if (data && Array.isArray(data.orders)) ordersArray = data.orders;
      else if (data && Array.isArray(data.data)) ordersArray = data.data;

      const filtered = ordersArray.filter((o: Order) => o.status === "Collected at Warehouse");
      setInboundOrders(filtered);
    } catch (err) {
      console.error("Failed to fetch inbound orders", err);
    }
  };

  useEffect(() => {
    loadOrders();
    const interval = setInterval(loadOrders, 10000);
    return () => clearInterval(interval);
  }, []);

  // Auto-focus the input on load and after scans
  useEffect(() => {
    inputRef.current?.focus();
  }, [inboundOrders, error]);

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!barcode.trim()) return;

    setError("");
    setLoading(true);

    try {
      await inboundScan(barcode.trim());
      await loadOrders(); // Refresh the list from the server
      setBarcode(""); // Clear input for next scan
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to process inbound scan.");
      setBarcode("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center text-purple-600">
          <PackageCheck size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inbound Receive</h1>
          <p className="text-sm text-gray-500">Scan parcels arriving at the Warehouse.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
        <form onSubmit={handleScan} className="flex flex-col gap-4">
          <label className="text-sm font-semibold text-gray-700">Scan Barcode / Tracking Number</label>
          <div className="flex gap-4">
            <input
              ref={inputRef}
              type="text"
              value={barcode}
              onChange={(e) => setBarcode(e.target.value)}
              disabled={loading}
              placeholder="e.g. AA123456"
              className="flex-1 bg-gray-50 border-2 border-gray-200 text-2xl font-mono tracking-widest rounded-xl py-4 px-6 focus:bg-white focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all outline-none uppercase"
              autoFocus
            />
            <button
              type="submit"
              disabled={loading || !barcode.trim()}
              className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 rounded-xl font-bold text-lg transition-colors disabled:opacity-50 min-w-[160px] flex items-center justify-center"
            >
              {loading ? <Loader2 className="animate-spin" size={24} /> : "Process Scan"}
            </button>
          </div>
          {error && <p className="text-red-500 font-medium text-sm animate-pulse">{error}</p>}
        </form>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
          <h2 className="font-bold text-gray-800">Currently in Warehouse</h2>
          <span className="bg-purple-100 text-purple-700 text-xs font-bold px-3 py-1 rounded-full">
            {inboundOrders.length} Parcels
          </span>
        </div>
        
        {inboundOrders.length === 0 ? (
          <div className="p-8 text-center text-gray-400 text-sm">
            No parcels currently sitting in the warehouse.
          </div>
        ) : (
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-gray-400 uppercase text-xs font-semibold">
              <tr>
                <th className="px-6 py-3">Tracking Number</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Time</th>
                <th className="px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {inboundOrders.map((item, idx) => (
                <tr key={`${item.trackingNumber}-${idx}`} className="hover:bg-purple-50/50 transition-colors">
                  <td className="px-6 py-4 font-mono font-bold text-gray-900">{item.trackingNumber}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                      <div className="w-1.5 h-1.5 rounded-full bg-purple-500"></div>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-400">In Warehouse</td>
                  <td className="px-6 py-4">
                      <button 
                          onClick={() => navigate(`/sorting/order-details/${item.trackingNumber}`)}
                          className="bg-purple-50 text-purple-600 hover:bg-purple-600 hover:text-white px-3.5 py-2 rounded-xl transition-all font-medium text-sm flex items-center gap-1.5 shadow-sm">
                          <FileText size={16} /> Details
                      </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default InboundScans;

