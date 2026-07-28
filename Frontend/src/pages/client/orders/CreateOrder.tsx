import { useState, useEffect } from "react";
import { Upload, Package, User, Phone, MapPin, Scale, DollarSign, CheckCircle2, Zap } from "lucide-react";
import { createOrder, uploadBulkOrders } from "../../../services/orderService";
import { getAvailableBarcodes } from "../../../services/waybillService";

function CreateOrder() {
  const [tab, setTab] = useState("single");
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [availableBarcodes, setAvailableBarcodes] = useState<any[]>([]);
  
  // Bulk upload state
  const [bulkFile, setBulkFile] = useState<File | null>(null);

  const [formData, setFormData] = useState({
    waybillId: "",
    customerName: "",
    phone1: "",
    weight: "",
    codAmount: "",
    address: ""
  });

  const fetchBarcodes = async () => {
    try {
      const data = await getAvailableBarcodes();
      setAvailableBarcodes(data);
    } catch (err: any) {
      console.error("Error fetching barcodes:", err);
      const serverMsg = err.response?.data?.message || err.response?.data?.inner || err.message;
      setErrorMsg(`Failed to fetch barcodes: ${serverMsg}`);
    }
  };

  useEffect(() => {
    fetchBarcodes();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAutoAssign = () => {
    if (availableBarcodes.length > 0) {
      setFormData({ ...formData, waybillId: availableBarcodes[0].barcode });
    } else {
      setErrorMsg("No available barcodes to assign. Please request more Waybills.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg("");
    setErrorMsg("");

    try {
      const res = await createOrder({
        ...formData,
        codAmount: formData.codAmount ? parseFloat(formData.codAmount) : null
      });
      setSuccessMsg(`Order successfully created! Tracking Number: ${res.orderNo}`);
      setFormData({
        waybillId: "",
        customerName: "",
        phone1: "",
        weight: "",
        codAmount: "",
        address: ""
      });
      // Refresh barcodes to remove the one we just used
      fetchBarcodes();
    } catch (err: any) {
      const serverMsg = err.response?.data?.message || err.message;
      setErrorMsg(`Error: ${serverMsg}`);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setBulkFile(e.target.files[0]);
    }
  };

  const handleBulkSubmit = async () => {
    if (!bulkFile) {
      setErrorMsg("Please select a file first.");
      return;
    }

    setLoading(true);
    setSuccessMsg("");
    setErrorMsg("");

    try {
      const res = await uploadBulkOrders(bulkFile);
      setSuccessMsg(res.message || "Bulk orders successfully created!");
      setBulkFile(null);
      // Refresh barcodes to reflect usage
      fetchBarcodes();
      // Reset file input
      const fileInput = document.getElementById('file-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    } catch (err: any) {
      const serverMsg = err.response?.data?.message || err.message;
      setErrorMsg(`Error: ${serverMsg}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 bg-slate-50 min-h-screen">
      <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 p-8 md:p-10 max-w-4xl">
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-slate-800 mb-3 flex items-center gap-3">
            <Package className="text-red-500" size={36} /> Add New Order
          </h1>
          <p className="text-slate-500 text-lg">Create new shipments seamlessly</p>
        </div>

        {/* TABS */}
        <div className="flex gap-3 mb-10 bg-slate-100 p-1.5 rounded-2xl w-fit">
          <button
            onClick={() => { setTab("single"); setSuccessMsg(""); setErrorMsg(""); }}
            className={`px-6 py-2.5 rounded-xl font-medium transition-all ${
              tab === "single" ? "bg-white text-red-500 shadow-sm" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            Single Order
          </button>
          <button
            onClick={() => { setTab("bulk"); setSuccessMsg(""); setErrorMsg(""); }}
            className={`px-6 py-2.5 rounded-xl font-medium transition-all ${
              tab === "bulk" ? "bg-white text-red-500 shadow-sm" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            Bulk Upload
          </button>
        </div>

        {/* NOTIFICATIONS */}
        {successMsg && (
          <div className="mb-8 p-4 bg-green-50 border border-green-200 text-green-700 rounded-2xl flex items-center gap-3">
            <CheckCircle2 size={20} />
            <span className="font-medium">{successMsg}</span>
          </div>
        )}
        {errorMsg && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl flex items-center gap-3">
            <span className="font-bold">⚠ Error:</span> {errorMsg}
          </div>
        )}

        {/* SINGLE ORDER FORM */}
        {tab === "single" && (
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6">
              <label className="block text-sm font-bold text-slate-700 uppercase tracking-wider mb-3">
                Barcode / Waybill Number *
              </label>
              
              <div className="flex gap-3">
                <select
                  name="waybillId"
                  value={formData.waybillId}
                  onChange={handleChange}
                  required
                  className="w-full bg-white border border-slate-200 p-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all text-lg font-mono"
                >
                  <option value="" disabled>-- Select an available barcode --</option>
                  {availableBarcodes.map(wb => (
                    <option key={wb.id} value={wb.barcode}>{wb.barcode}</option>
                  ))}
                </select>
                
                <button
                  type="button"
                  onClick={handleAutoAssign}
                  className="bg-slate-800 hover:bg-slate-700 text-white font-bold px-6 rounded-xl transition flex items-center justify-center gap-2 whitespace-nowrap"
                >
                  <Zap size={18} className="text-yellow-400" /> Auto-Assign
                </button>
              </div>
              <p className="text-xs text-slate-500 mt-2">Available Barcodes: <span className="font-bold text-slate-700">{availableBarcodes.length}</span></p>
            </div>

            <div>
              <h3 className="text-lg font-bold text-slate-800 mb-5 border-b pb-2">Receiver Information</h3>
              <div className="grid md:grid-cols-2 gap-5">
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    name="customerName"
                    value={formData.customerName}
                    onChange={handleChange}
                    required
                    placeholder="Receiver Name"
                    className="w-full border border-slate-200 rounded-xl p-3 pl-11 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
                  />
                </div>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    name="phone1"
                    value={formData.phone1}
                    onChange={handleChange}
                    required
                    placeholder="Receiver Phone Number"
                    className="w-full border border-slate-200 rounded-xl p-3 pl-11 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
                  />
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-bold text-slate-800 mb-5 border-b pb-2">Shipment Details</h3>
              <div className="grid md:grid-cols-2 gap-5">
                <div className="relative">
                  <Scale className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    name="weight"
                    value={formData.weight}
                    onChange={handleChange}
                    placeholder="Weight (kg) e.g. 1.5"
                    className="w-full border border-slate-200 rounded-xl p-3 pl-11 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
                  />
                </div>
                <div className="relative">
                  <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    name="codAmount"
                    type="number"
                    value={formData.codAmount}
                    onChange={handleChange}
                    placeholder="Cash on Delivery (COD) Amount"
                    className="w-full border border-slate-200 rounded-xl p-3 pl-11 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
                  />
                </div>
              </div>

              <div className="relative mt-5">
                <MapPin className="absolute left-4 top-4 text-slate-400" size={18} />
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  required
                  placeholder="Full Delivery Address"
                  rows={3}
                  className="w-full border border-slate-200 rounded-xl p-3 pl-11 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
                />
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="bg-red-500 hover:bg-red-600 text-white font-bold px-10 py-4 rounded-xl transition shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? "Processing..." : "Create Order"}
              </button>
            </div>
          </form>
        )}

        {/* BULK UPLOAD FORM */}
        {tab === "bulk" && (
          <div className="bg-slate-50 border border-slate-100 border-dashed rounded-3xl p-12 text-center">
            <Upload size={60} className="mx-auto mb-6 text-red-300" />
            <h2 className="text-2xl font-bold mb-3 text-slate-800">Smart Bulk Upload</h2>
            <p className="text-slate-500 mb-8 max-w-sm mx-auto">
              Upload your orders via CSV. The system will automatically map your available barcodes to each order!
            </p>
            
            <input 
              type="file" 
              accept=".csv" 
              onChange={handleFileChange}
              className="hidden" 
              id="file-upload" 
            />
            
            <div className="flex flex-col items-center justify-center gap-4">
              <label
                htmlFor="file-upload"
                className="bg-white border-2 border-red-500 text-red-500 hover:bg-red-50 cursor-pointer font-bold px-8 py-3 rounded-xl transition inline-block mb-2"
              >
                {bulkFile ? bulkFile.name : "Browse CSV File"}
              </label>
              
              <button
                onClick={handleBulkSubmit}
                disabled={loading || !bulkFile}
                className="bg-red-500 hover:bg-red-600 text-white font-bold px-10 py-4 rounded-xl transition shadow-md disabled:opacity-50 flex gap-2 items-center"
              >
                {loading ? "Uploading..." : "Upload & Auto-Assign"} <Zap size={18} />
              </button>
            </div>

            <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold mt-8 bg-white p-4 rounded-xl shadow-sm border border-slate-100 inline-block text-left">
              Required CSV Columns:<br/><span className="text-slate-700">CustomerName, Phone1, Address, Weight, CODAmount</span>
              <br/><br/>
              <span className="text-red-400 font-bold">NOTE:</span> Barcodes will be assigned automatically.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CreateOrder;