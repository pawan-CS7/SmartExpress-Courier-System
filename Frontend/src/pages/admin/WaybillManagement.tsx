import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import api from "../../services/api";
import { Eye, X, Building, Phone, Mail, MapPin, CreditCard, Filter } from "lucide-react";
import FilterSidebar, { type FilterState } from "../../components/FilterSidebar";
import { branchService } from "../../services/branchService";
import type { Branch } from "../../types/branch";
import { getCurrentUser } from "../../utils/auth";

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
  const user = getCurrentUser();
  const isAdmin = user.role === "Admin" || user.role === "Owner";

  const [requests, setRequests] = useState<WaybillRequest[]>([]);
  const [waybills, setWaybills] = useState<Waybill[]>([]);
  const [loading, setLoading] = useState(false);
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
  
  const [selectedClient, setSelectedClient] = useState<ClientDetails | null>(null);
  const [modalLoading, setModalLoading] = useState(false);

  const location = useLocation();
  const [highlightId, setHighlightId] = useState<number | null>(null);

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const hId = queryParams.get("highlightId");
    if (hId) {
        const id = Number(hId);
        setHighlightId(id);
        setTimeout(() => {
            const element = document.getElementById(`waybill-row-${id}`);
            if (element) {
                element.scrollIntoView({ behavior: "smooth", block: "center" });
            }
        }, 500);
        setTimeout(() => {
            setHighlightId(null);
        }, 3500);
    }
  }, [location.search, requests]);

  const queryParams = new URLSearchParams(location.search);
  const branchId = queryParams.get("branchId");

  useEffect(() => {
    if (branchId && branchId !== filters.branchId) {
        setFilters(prev => ({ ...prev, branchId: branchId }));
    }
    branchService.getBranches().then(data => setBranches(data)).catch(console.error);
  }, [branchId]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      const queryParamsString = filters.branchId ? `?branchId=${filters.branchId}` : '';

      const requestsResponse = await api.get(`/api/Waybill${queryParamsString}`);
      setRequests(requestsResponse.data);

      try {
        const waybillsResponse = await api.get(`/api/Waybill/all-barcodes${queryParamsString}`);
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
  }, [filters.branchId]);

  const approveRequest = async (id: number) => {
    try {
      await api.post(`/api/Waybill/approve/${id}`);
      alert("Waybills generated successfully");
      loadData();
    } catch (error: any) {
      console.error("FULL ERROR:", error);
      const errorMsg = error.response?.data?.message || "Failed to approve request";
      alert(errorMsg);
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

  const filteredRequests = requests.filter(x => {
      const matchSearch = (x.clientName || "").toLowerCase().includes(filters.search.toLowerCase()) || 
                          x.clientId.toString().includes(filters.search);
      
      const matchStatus = filters.statuses.length === 0 || filters.statuses.includes(x.status);
      
      const requestDate = new Date(x.requestedDate);
      const matchStartDate = !filters.startDate || requestDate >= new Date(filters.startDate);
      
      let matchEndDate = true;
      if (filters.endDate) {
          const endDate = new Date(filters.endDate);
          endDate.setHours(23, 59, 59, 999);
          matchEndDate = requestDate <= endDate;
      }

      return matchSearch && matchStatus && matchStartDate && matchEndDate;
  });

  const pendingCount = filteredRequests.filter((x) => x.status === "Pending").length;
  const completedCount = filteredRequests.filter((x) => x.status === "Done").length;

  const hasActiveFilters = filters.search !== '' || filters.statuses.length > 0 || filters.startDate !== '' || filters.endDate !== '' || (filters.branchId && filters.branchId !== '');

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

  return (
    <div className="p-8">
      <div className="mb-8 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">
              {branchId ? "Branch Waybill Management" : "Waybill Management"}
          </h1>
          <p className="text-slate-500 mt-2">
              {branchId ? "Manage client barcode requests for this specific branch" : "Manage all client barcode requests and allocations"}
          </p>
        </div>
        <div className="flex gap-2">
            <button 
                onClick={() => setIsFilterOpen(true)}
                className={`relative bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 px-6 py-3 rounded-lg font-bold transition-all shadow-sm flex items-center gap-2 ${hasActiveFilters ? 'ring-2 ring-indigo-500' : ''}`}
            >
                <Filter size={18} /> Advanced Search
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
        </div>
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
            <div className="text-2xl font-bold text-indigo-600">{filteredRequests.length}</div>
            <div className="text-slate-500 text-sm font-medium mt-1">Total Requests</div>
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
                {filteredRequests.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                      No requests found matching your filters.
                    </td>
                  </tr>
                ) : (
                  filteredRequests.map((req) => (
                    <tr 
                        key={req.id} 
                        id={`waybill-row-${req.id}`}
                        className={`hover:bg-slate-50 transition-colors ${highlightId === req.id ? 'bg-indigo-50/50' : ''}`}
                    >
                      <td className="p-4 text-sm font-medium text-slate-800">#{req.id}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div>
                            <div className="text-sm font-bold text-slate-800">{req.clientName || 'Unknown Client'}</div>
                            <div className="text-xs text-slate-500">ID: {req.clientId}</div>
                          </div>
                          <button
                              onClick={() => openClientModal(req.clientId)}
                              className="flex items-center justify-center w-7 h-7 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-md transition-colors"
                              title="View Client Details"
                          >
                              <Eye size={14} />
                          </button>
                        </div>
                      </td>
                      <td className="p-4 text-sm font-bold text-slate-700">{req.noOfWaybills}</td>
                      <td className="p-4 text-sm text-slate-500">{new Date(req.requestedDate).toLocaleDateString()}</td>
                      <td className="p-4">
                        <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                          req.status === "Pending" ? "bg-orange-100 text-orange-700" : "bg-green-100 text-green-700"
                        }`}>
                          {req.status}
                        </span>
                      </td>
                      <td className="p-4 text-sm font-medium">
                        {req.status === "Pending" ? (
                          <button
                            onClick={() => approveRequest(req.id)}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors shadow-sm"
                          >
                            Generate Barcodes
                          </button>
                        ) : (
                          <span className="text-slate-400">Completed</span>
                        )}
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

      {/* FILTER SIDEBAR */}
      <FilterSidebar
          isOpen={isFilterOpen}
          onClose={() => setIsFilterOpen(false)}
          filters={filters}
          setFilters={setFilters}
          showBranchFilter={!branchId && isAdmin} // Only show if Admin and no branch in URL
          branches={branches}
          statusOptions={[
              { label: "Pending", value: "Pending" },
              { label: "Done", value: "Done" }
          ]}
      />
    </div>
  );
}

export default WaybillManagement;