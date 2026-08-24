import React, { useEffect, useState } from "react";
import { Package, MapPin, XCircle, RefreshCw, AlertCircle } from "lucide-react";
import { toast } from "react-hot-toast";
import { getFailedDeliveries, type RiderDelivery } from "../../services/riderAppService";

const RiderFailed: React.FC = () => {
  const [deliveries, setDeliveries] = useState<RiderDelivery[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await getFailedDeliveries();
      setDeliveries(data);
    } catch (error) {
      toast.error("Failed to load issue deliveries");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto pb-24">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <AlertCircle className="text-red-600" />
            Failed / Issues
          </h2>
          <p className="text-gray-500 text-sm mt-1">{deliveries.length} deliveries with issues</p>
        </div>
        <button onClick={fetchData} className="p-2 bg-red-50 text-red-600 rounded-full hover:bg-red-100 transition">
          <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      {loading && deliveries.length === 0 ? (
        <div className="flex justify-center py-12">
          <RefreshCw className="animate-spin text-red-600 w-8 h-8" />
        </div>
      ) : deliveries.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-800">No Failed Deliveries</h3>
          <p className="text-gray-500 mt-2">All your deliveries are going smoothly today.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {deliveries.map((delivery) => (
            <div key={delivery.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden opacity-90 hover:opacity-100 transition">
              <div className="bg-red-50 p-4 border-b border-gray-100 flex justify-between items-center">
                <div>
                  <p className="font-mono font-bold text-lg text-gray-900">{delivery.trackingNumber}</p>
                </div>
                <div className="flex items-center gap-1 text-red-700 font-bold text-sm bg-red-100 px-3 py-1 rounded-full">
                  <XCircle size={14} /> Failed
                </div>
              </div>
              
              <div className="p-4">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">
                    <MapPin className="w-5 h-5 text-gray-400" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">{delivery.customerName}</p>
                    <p className="text-sm text-gray-600 mt-1">{delivery.destinationAddress}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RiderFailed;
