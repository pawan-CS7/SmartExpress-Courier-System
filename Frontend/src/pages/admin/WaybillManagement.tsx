import { useEffect, useState } from "react";
import api from "../../services/api";
import { Eye, X, Building, Phone, Mail, MapPin, CreditCard } from "lucide-react";

interface WaybillRequest {
  id: number;
  clientId: number;
  clientName?: string;
  noOfWaybills: number;
  status: string;
  requestedDate: string;
  fromBarcode?: string;
  toBarcode?: string;
}

interface Waybill {
  id: number;
  barcode: string;
  clientId: number;
  waybillRequestId: number;
}

interface ClientDetails {
  id: number;
  businessName: string;
  ownerName: string;
  nic: string;
  email: string;
  phone: string;
  address: string;
  businessRegistrationNo: string;
  bankName: string;
  accountNumber: string;
  pickupAddress: string;
  paymentTerms: string;
}

function WaybillManagement() {
  const [requests, setRequests] = useState<WaybillRequest[]>([]);
  const [waybills, setWaybills] = useState<Waybill[]>([]);
  const [loading, setLoading] = useState(false);
  
  const [selectedClient, setSelectedClient] = useState<ClientDetails | null>(null);
  const [modalLoading, setModalLoading] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);

      const requestsResponse = await api.get("/api/Waybill");
      setRequests(requestsResponse.data);

      try {
        const waybillsResponse = await api.get("/api/Waybill/all-barcodes");
        setWaybills(waybillsResponse.data);
      } catch {
        setWaybills([]);
      }
    } catch (error) {
      console.error(error);
      alert("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const approveRequest = async (id: number) => {
    try {
      const response = await api.post(`/api/Waybill/approve/${id}`);
      alert("Waybills generated successfully");
      loadData();
    } catch (error: any) {
      console.error("FULL ERROR:", error);
      alert("Failed to approve request");
    }
  };

  const openClientModal = async (clientId: number) => {
    setModalLoading(true);
    setSelectedClient(null); // Open modal immediately, then load data
    try {
      // Create a dummy client if endpoint is not fully ready, but try to fetch
      const response = await api.get(`/api/Waybill/client/${clientId}`);
      setSelectedClient(response.data);
    } catch (error) {
      console.error("Error fetching client details", error);
      alert("Could not load client details");
    } finally {
      setModalLoading(false);
    }
  };

  const pendingCount = requests.filter((x) => x.status === "Pending").length;
  const completedCount = requests.filter((x) => x.status === "Done").length;

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">Waybill Management</h1>
        <p className="text-slate-500 mt-2">Manage client barcode requests and allocations</p>
      </div>

      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white shadow-sm border border-slate-200 rounded-2xl p-6">
          <p className="text-slate-500 font-medium text-sm">Pending Requests</p>
          <h2 className="text-4xl font-bold mt-3 text-orange-500">{pendingCount}</h2>
        </div>
        <div className="bg-white shadow-sm border border-slate-200 rounded-2xl p-6">
          <p className="text-slate-500 font-medium text-sm">Approved Requests</p>
          <h2 className="text-4xl font-bold mt-3 text-green-600">{completedCount}</h2>
        </div>
        <div className="bg-white shadow-sm border border-slate-200 rounded-2xl p-6">
          <p className="text-slate-500 font-medium text-sm">Total Requests</p>
          <h2 className="text-4xl font-bold mt-3 text-indigo-600">{requests.length}</h2>
        </div>
        <div className="bg-white shadow-sm border border-slate-200 rounded-2xl p-6">
          <p className="text-slate-500 font-medium text-sm">Generated Barcodes</p>
          <h2 className="text-4xl font-bold mt-3 text-slate-800">{waybills.length}</h2>
        </div>
      </div>

      <div className="bg-white shadow-sm border border-slate-200 rounded-2xl p-6 mb-8">
        <h2 className="text-xl font-bold mb-6 text-slate-800">Client Requests</h2>
        {loading ? (
          <div className="py-10 text-center text-slate-500">Loading...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="p-4 text-sm font-semibold text-slate-600">ID</th>
                  <th className="p-4 text-sm font-semibold text-slate-600">Client</th>
                  <th className="p-4 text-sm font-semibold text-slate-600">Qty</th>
                  <th className="p-4 text-sm font-semibold text-slate-600">Requested Date</th>
                  <th className="p-4 text-sm font-semibold text-slate-600">Status</th>
                  <th className="p-4 text-sm font-semibold text-slate-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {requests.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-slate-500">No requests found</td>
                  </tr>
                ) : (
                  requests.map((r) => (
                    <tr key={r.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                      <td className="p-4 text-sm font-medium text-slate-800">#{r.id}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div>
                            <div className="text-sm font-bold text-slate-800">{r.clientName || 'Unknown Client'}</div>
                            <div className="text-xs text-slate-500">ID: {r.clientId}</div>
                          </div>
                          <button
                              onClick={() => openClientModal(r.clientId)}
                              className="flex items-center justify-center w-7 h-7 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-md transition-colors"
                              title="View Client Details"
                          >
                              <Eye size={14} />
                          </button>
                        </div>
                      </td>
                      <td className="p-4 text-sm font-medium text-slate-600">{r.noOfWaybills}</td>
                      <td className="p-4 text-sm text-slate-600">
                        {new Date(r.requestedDate.includes('Z') ? r.requestedDate : r.requestedDate + 'Z').toLocaleDateString()}
                      </td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${r.status === "Pending" ? "bg-orange-100 text-orange-700" : "bg-green-100 text-green-700"}`}>
                          {r.status}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                            {r.status === "Pending" ? (
                            <button
                                onClick={() => approveRequest(r.id)}
                                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 text-sm font-medium rounded-lg transition-colors shadow-sm"
                            >
                                Approve
                            </button>
                            ) : (
                                <span className="text-slate-400 text-sm font-medium">Completed</span>
                            )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Client Details Modal */}
      {(selectedClient || modalLoading) && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-slate-100">
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <Building className="text-indigo-500" size={24} />
                Client Details
              </h2>
              <button onClick={() => {setSelectedClient(null); setModalLoading(false);}} className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-2 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6">
                {modalLoading ? (
                    <div className="py-12 text-center text-slate-500">Loading client information...</div>
                ) : selectedClient && (
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div>
                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Business Name</h4>
                                <p className="text-slate-800 font-medium text-lg">{selectedClient.businessName || selectedClient.ownerName}</p>
                            </div>
                            
                            <div className="flex items-start gap-3">
                                <Phone size={18} className="text-slate-400 mt-0.5" />
                                <div>
                                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Contact</h4>
                                    <p className="text-slate-800 font-medium">{selectedClient.phone}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <Mail size={18} className="text-slate-400 mt-0.5" />
                                <div>
                                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Email</h4>
                                    <p className="text-slate-800 font-medium">{selectedClient.email}</p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-start gap-3">
                                <MapPin size={18} className="text-slate-400 mt-0.5" />
                                <div>
                                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Address</h4>
                                    <p className="text-slate-800 font-medium">{selectedClient.address}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <CreditCard size={18} className="text-slate-400 mt-0.5" />
                                <div>
                                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Bank Details</h4>
                                    <p className="text-slate-800 font-medium">{selectedClient.bankName}</p>
                                    <p className="text-slate-600 text-sm">{selectedClient.accountNumber}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            
            <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button 
                onClick={() => setSelectedClient(null)}
                className="px-6 py-2.5 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-colors shadow-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default WaybillManagement;