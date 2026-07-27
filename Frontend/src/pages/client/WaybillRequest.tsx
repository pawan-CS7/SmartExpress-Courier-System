import { useEffect, useState } from "react";
import api from "../../services/api";

interface WaybillRequestDto {
    id: number;
    noOfWaybills: number;
    status: string;
    requestedDate: string;
    fromBarcode?: string;
    toBarcode?: string;
}

function WaybillRequest() {
    const [qty, setQty] = useState("");
    const [loading, setLoading] = useState(false);
    const [requests, setRequests] = useState<WaybillRequestDto[]>([]);

    const loadRequests = async () => {
        try {
            const response = await api.get("/api/Waybill/myrequests");
            setRequests(response.data);
        } catch (error) {
            console.error("Error loading requests:", error);
        }
    };

    useEffect(() => {
        loadRequests();
    }, []);

    const submitRequest = async () => {
        if (!qty || Number(qty) <= 0) {
            alert("Please enter a valid quantity");
            return;
        }

        try {
            setLoading(true);
            await api.post("/api/Waybill/request", {
                noOfWaybills: Number(qty)
            });
            alert("Waybill request submitted successfully");
            setQty("");
            loadRequests();
        } catch (error) {
            console.error("Error submitting request:", error);
            alert("Failed to submit request. Check console for details.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold mb-8">Request Waybills</h1>
            
            <div className="bg-white shadow-lg rounded-2xl p-6 max-w-xl mb-8">
                <label className="block font-medium mb-2">Number of Waybills</label>
                <input
                    type="number"
                    min="1"
                    value={qty}
                    onChange={(e) => setQty(e.target.value)}
                    className="border rounded-xl w-full p-3 mb-4"
                    placeholder="Enter quantity"
                />
                <button
                    onClick={submitRequest}
                    disabled={loading}
                    className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-xl disabled:opacity-50"
                >
                    {loading ? "Submitting..." : "Submit Request"}
                </button>
            </div>

            <div className="bg-white shadow-lg rounded-2xl p-6">
                <h2 className="text-xl font-semibold mb-4">My Requests</h2>
                <div className="overflow-x-auto">
                    <table className="min-w-full border">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="border p-3">ID</th>
                                <th className="border p-3">Qty</th>
                                <th className="border p-3">Requested Date</th>
                                <th className="border p-3">Status</th>
                                <th className="border p-3">From Barcode</th>
                                <th className="border p-3">To Barcode</th>
                            </tr>
                        </thead>
                        <tbody>
                            {requests.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="text-center p-4">No requests found</td>
                                </tr>
                            ) : (
                                requests.map((request) => (
                                    <tr key={request.id}>
                                        <td className="border p-3">{request.id}</td>
                                        <td className="border p-3">{request.noOfWaybills}</td>

                                        
                                        <td className="border p-3">    {new Date(request.requestedDate.includes('Z') ? request.requestedDate : request.requestedDate + 'Z').toLocaleString()}</td>
                                        
                                        
                                        <td className="border p-3">
                                            <span className={request.status === "Done" ? "text-green-600 font-semibold" : "text-orange-500 font-semibold"}>
                                                {request.status}
                                            </span>
                                        </td>
                                        <td className="border p-3">{request.fromBarcode || "-"}</td>
                                        <td className="border p-3">{request.toBarcode || "-"}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default WaybillRequest;