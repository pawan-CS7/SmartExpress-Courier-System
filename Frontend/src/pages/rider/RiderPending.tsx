import React, { useEffect, useState } from "react";
import { Package, MapPin, CheckCircle, XCircle, AlertCircle, PhoneCall, RefreshCw, Navigation } from "lucide-react";
import { toast } from "react-hot-toast";
import { getPendingDeliveries, updateDeliveryStatus, type RiderDelivery } from "../../services/riderAppService";

const RiderPending: React.FC = () => {
  const [deliveries, setDeliveries] = useState<RiderDelivery[]>([]);
  const [loading, setLoading] = useState(true);

  const [activeModal, setActiveModal] = useState<{ type: string; delivery: RiderDelivery } | null>(null);
  const [remarks, setRemarks] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await getPendingDeliveries();
      setDeliveries(data);
    } catch (error) {
      toast.error("Failed to load deliveries");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpdateStatus = async (status: string, defaultRemarks: string = "") => {
    if (!activeModal) return;
    const { delivery } = activeModal;
    try {
      await updateDeliveryStatus(delivery.trackingNumber, {
        status,
        location: "Delivery Location",
        remarks: remarks || defaultRemarks,
      });
      toast.success(`Marked as ${status}`);
      setActiveModal(null);
      setRemarks("");
      fetchData();
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const handleCall = (phone: string) => {
    window.location.href = `tel:${phone}`;
  };

  const handleNavigate = (address: string) => {
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`);
  };

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto pb-24">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Package className="text-blue-600" />
            Pending Deliveries
          </h2>
          <p className="text-gray-500 text-sm mt-1">{deliveries.length} packages to deliver</p>
        </div>
        <button onClick={fetchData} className="p-2 bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100 transition">
          <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      {loading && deliveries.length === 0 ? (
        <div className="flex justify-center py-12">
          <RefreshCw className="animate-spin text-blue-600 w-8 h-8" />
        </div>
      ) : deliveries.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100">
          <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-800">All Caught Up!</h3>
          <p className="text-gray-500 mt-2">You have no pending deliveries.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {deliveries.map((delivery) => (
            <div key={delivery.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="bg-blue-50/50 p-4 border-b border-gray-100 flex justify-between items-center">
                <div>
                  <p className="text-xs font-bold text-blue-500 tracking-wider uppercase mb-1">Waybill</p>
                  <p className="font-mono font-bold text-lg text-gray-900">{delivery.trackingNumber}</p>
                </div>
                <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-bold rounded-full">
                  {delivery.status}
                </span>
              </div>
              
              <div className="p-4 space-y-4">
                <div>
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">
                      <MapPin className="w-5 h-5 text-red-500" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">{delivery.customerName}</p>
                      <p className="text-sm text-gray-600 mt-1">{delivery.destinationAddress}</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleCall(delivery.customerPhone)}
                    className="flex-1 flex items-center justify-center gap-2 bg-green-50 text-green-700 py-2.5 rounded-xl font-medium hover:bg-green-100 transition"
                  >
                    <PhoneCall size={18} /> Call
                  </button>
                  <button 
                    onClick={() => handleNavigate(delivery.destinationAddress)}
                    className="flex-1 flex items-center justify-center gap-2 bg-blue-50 text-blue-700 py-2.5 rounded-xl font-medium hover:bg-blue-100 transition"
                  >
                    <Navigation size={18} /> Map
                  </button>
                </div>
              </div>

              <div className="p-4 bg-gray-50 border-t border-gray-100 grid grid-cols-2 gap-2">
                <button 
                  onClick={() => setActiveModal({ type: 'Delivered', delivery })}
                  className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-bold transition shadow-sm"
                >
                  <CheckCircle size={18} /> Delivered
                </button>
                <button 
                  onClick={() => setActiveModal({ type: 'Failed', delivery })}
                  className="flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 text-red-700 py-3 rounded-xl font-bold transition"
                >
                  <XCircle size={18} /> Issue
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Action Modal */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl w-full max-w-md overflow-hidden animate-in slide-in-from-bottom-4 sm:slide-in-from-bottom-0 sm:zoom-in-95">
            <div className="p-6">
              <h3 className={`text-xl font-bold mb-2 flex items-center gap-2 ${activeModal.type === 'Delivered' ? 'text-green-600' : 'text-red-600'}`}>
                {activeModal.type === 'Delivered' ? <CheckCircle /> : <AlertCircle />}
                {activeModal.type === 'Delivered' ? 'Confirm Delivery' : 'Report Issue'}
              </h3>
              <p className="text-gray-600 mb-6">
                Waybill: <span className="font-mono font-bold text-gray-900">{activeModal.delivery.trackingNumber}</span>
              </p>

              {activeModal.type === 'Failed' && (
                <div className="space-y-3 mb-6">
                  <p className="text-sm font-bold text-gray-700">Select Issue Reason:</p>
                  <div className="grid grid-cols-1 gap-2">
                    {[
                      "Customer Not Answering",
                      "Address Not Found",
                      "Rescheduled",
                      "Rejected by Customer"
                    ].map(reason => (
                      <button
                        key={reason}
                        onClick={() => handleUpdateStatus("Failed to Deliver", reason)}
                        className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-red-50 border border-gray-200 hover:border-red-200 text-gray-700 hover:text-red-700 rounded-xl font-medium transition"
                      >
                        {reason}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {activeModal.type === 'Delivered' && (
                <div className="mb-6">
                  <label className="block text-sm font-bold text-gray-700 mb-2">Optional Notes (Receiver Name, etc.)</label>
                  <textarea
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    placeholder="E.g., Left at front door, signed by John..."
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none resize-none"
                    rows={3}
                  />
                  <button
                    onClick={() => handleUpdateStatus("Delivered", "Delivered successfully")}
                    className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white font-bold py-3.5 rounded-xl transition shadow-md flex items-center justify-center gap-2"
                  >
                    Confirm Delivery
                  </button>
                </div>
              )}

              <button
                onClick={() => setActiveModal(null)}
                className="w-full py-3 text-gray-500 font-bold hover:bg-gray-100 rounded-xl transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RiderPending;
