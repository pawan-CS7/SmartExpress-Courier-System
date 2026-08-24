import { useState, useRef, useEffect } from "react";
import { PackageOpen, Loader2, MapPin, FileText } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { outboundScan } from "../../services/sortingService";
import type { ScanResult } from "../../services/sortingService";
import api from "../../services/api";
import type { Branch } from "../../types/branch";

function OutboundScans() {
  const [barcode, setBarcode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [scannedItems, setScannedItems] = useState<ScanResult[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedBranchId, setSelectedBranchId] = useState<number | "">("");
  const navigate = useNavigate();

  const handleDone = () => {
    if (scannedItems.length === 0) return;
    setScannedItems([]);
    setSelectedBranchId("");
    alert("Batch dispatched successfully! You can view the grouped dispatches in the Hub Orders -> Dispatch History tab.");
  };

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Fetch all active branches for the dropdown
    const fetchBranches = async () => {
      try {
        const res = await api.get("/api/branches?activeOnly=true");
        setBranches(res.data);
      } catch (err) {
        console.error("Failed to load branches", err);
      }
    };
    fetchBranches();
  }, []);

  // Auto-focus the input if a branch is selected
  useEffect(() => {
    if (selectedBranchId !== "") {
      inputRef.current?.focus();
    }
  }, [selectedBranchId, scannedItems, error]);

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!barcode.trim() || selectedBranchId === "") return;

    setError("");
    setLoading(true);

    try {
      const res = await outboundScan(barcode.trim(), selectedBranchId as number);
      // Add to top of the session list
      setScannedItems((prev) => [res, ...prev]);
      setBarcode(""); // Clear input for next scan
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to process outbound scan.");
      setBarcode("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600">
          <PackageOpen size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Outbound Sort & Dispatch</h1>
          <p className="text-sm text-gray-500">Scan parcels into transport vehicles bound for destination branches.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
        
        {/* Branch Selection */}
        <div className="mb-6 border-b border-gray-100 pb-6">
          <label className="text-sm font-semibold text-gray-700 block mb-3">1. Select Target Destination Branch</label>
          <div className="relative max-w-md">
            <select
              value={selectedBranchId}
              onChange={(e) => setSelectedBranchId(Number(e.target.value) || "")}
              className="w-full bg-gray-50 border-2 border-gray-200 text-gray-800 rounded-xl py-3 pl-12 pr-4 focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-100 outline-none appearance-none font-medium"
            >
              <option value="">-- Choose Destination Branch --</option>
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} {b.cityName ? `(${b.cityName})` : ""}
                </option>
              ))}
            </select>
            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          </div>
        </div>

        {/* Barcode Scanner */}
        <form onSubmit={handleScan} className={`flex flex-col gap-4 transition-opacity ${selectedBranchId === "" ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
          <label className="text-sm font-semibold text-gray-700">2. Scan Barcode / Tracking Number</label>
          <div className="flex gap-4">
            <input
              ref={inputRef}
              type="text"
              value={barcode}
              onChange={(e) => setBarcode(e.target.value)}
              disabled={loading || selectedBranchId === ""}
              placeholder={selectedBranchId === "" ? "Select a branch first" : "e.g. AA123456"}
              className="flex-1 bg-gray-50 border-2 border-gray-200 text-2xl font-mono tracking-widest rounded-xl py-4 px-6 focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-100 transition-all outline-none uppercase"
            />
            <button
              type="submit"
              disabled={loading || !barcode.trim() || selectedBranchId === ""}
              className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-xl font-bold text-lg transition-colors disabled:opacity-50 min-w-[160px] flex items-center justify-center shadow-sm"
            >
              {loading ? <Loader2 className="animate-spin" size={24} /> : "Dispatch"}
            </button>
          </div>
          {error && <p className="text-red-500 font-medium text-sm animate-pulse">{error}</p>}
        </form>
      </div>

      {/* Session Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <h2 className="font-bold text-gray-800">Current Session Dispatches</h2>
            <span className="bg-orange-100 text-orange-700 text-xs font-bold px-3 py-1 rounded-full">
              {scannedItems.length} Parcels
            </span>
          </div>
          {scannedItems.length > 0 && (
            <button
              onClick={handleDone}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-bold text-sm shadow-sm transition-all"
            >
              Complete Batch (Done)
            </button>
          )}
        </div>
        
        {scannedItems.length === 0 ? (
          <div className="p-8 text-center text-gray-400 text-sm">
            No parcels dispatched yet in this session.
          </div>
        ) : (
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-gray-400 uppercase text-xs font-semibold">
              <tr>
                <th className="px-6 py-3">Tracking Number</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Destination</th>
                <th className="px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {scannedItems.map((item, idx) => (
                <tr key={`${item.trackingNumber}-${idx}`} className="hover:bg-orange-50/50 transition-colors">
                  <td className="px-6 py-4 font-mono font-bold text-gray-900">{item.trackingNumber}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
                      <div className="w-1.5 h-1.5 rounded-full bg-orange-500"></div>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-900 font-medium">{item.destination}</td>
                  <td className="px-6 py-4">
                      <button 
                          onClick={() => navigate(`/sorting/order-details/${item.trackingNumber}`)}
                          className="bg-orange-50 text-orange-600 hover:bg-orange-600 hover:text-white px-3.5 py-2 rounded-xl transition-all font-medium text-sm flex items-center gap-1.5 shadow-sm">
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

export default OutboundScans;
