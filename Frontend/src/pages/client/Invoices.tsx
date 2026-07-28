import { useEffect, useState } from "react";
import api from "../../services/api";
import { Receipt, Search, Download, CreditCard } from "lucide-react";

function Invoices() {
    const [invoices, setInvoices] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    useEffect(() => {
        loadInvoices();
    }, []);

    const loadInvoices = async () => {
        try {
            const res = await api.get("/invoice/my");
            setInvoices(res.data);
        } catch (err) {
            console.log(err);
            setInvoices([]);
        } finally {
            setLoading(false);
        }
    };

    const filtered = invoices.filter(x =>
        x.trackingNo?.toLowerCase().includes(search.toLowerCase())
    );

    const totalAmount = invoices.reduce((acc, curr) => acc + (curr.amount || 0), 0);
    const paidAmount = invoices.filter(x => x.status === "Paid").reduce((acc, curr) => acc + (curr.amount || 0), 0);
    const pendingAmount = invoices.filter(x => x.status === "Pending").reduce((acc, curr) => acc + (curr.amount || 0), 0);

    return (
        <div className="p-8 bg-slate-50 min-h-screen">
            <div className="mb-10">
                <h1 className="text-4xl font-bold text-slate-800 mb-3 flex items-center gap-3">
                    <Receipt className="text-emerald-500" size={36} /> My Invoices
                </h1>
                <p className="text-slate-500 text-lg">Manage and track your billing and payments</p>
            </div>

            {/* KPI Cards */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex items-center gap-4">
                    <div className="bg-slate-100 p-4 rounded-full text-slate-600">
                        <Receipt size={28} />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">Total Billed</p>
                        <h2 className="text-2xl font-black text-slate-700">Rs. {totalAmount.toFixed(2)}</h2>
                    </div>
                </div>

                <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex items-center gap-4">
                    <div className="bg-emerald-50 p-4 rounded-full text-emerald-600">
                        <CheckCircle2 size={28} />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-emerald-400 uppercase tracking-wider">Total Paid</p>
                        <h2 className="text-2xl font-black text-emerald-700">Rs. {paidAmount.toFixed(2)}</h2>
                    </div>
                </div>

                <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex items-center gap-4">
                    <div className="bg-orange-50 p-4 rounded-full text-orange-600">
                        <CreditCard size={28} />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-orange-400 uppercase tracking-wider">Pending Due</p>
                        <h2 className="text-2xl font-black text-orange-700">Rs. {pendingAmount.toFixed(2)}</h2>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 mb-8 flex items-center gap-3">
                <Search className="text-slate-400 ml-2" size={20} />
                <input
                    placeholder="Search by Tracking number..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full bg-transparent outline-none text-slate-700"
                />
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 text-slate-500 font-semibold text-sm uppercase tracking-wider">
                        <tr>
                            <th className="p-5 border-b border-slate-100">Tracking No</th>
                            <th className="border-b border-slate-100">Amount</th>
                            <th className="border-b border-slate-100">Status</th>
                            <th className="border-b border-slate-100">Date Issued</th>
                            <th className="border-b border-slate-100">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-600">
                        {loading ? (
                            <tr>
                                <td colSpan={5} className="p-10 text-center text-slate-400 animate-pulse">
                                    Loading invoices...
                                </td>
                            </tr>
                        ) : filtered.length > 0 ? (
                            filtered.map(invoice => (
                                <tr key={invoice.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="p-5 font-mono font-medium text-slate-700">
                                        {invoice.trackingNo || `INV-${invoice.id.toString().padStart(5, '0')}`}
                                    </td>
                                    <td className="font-bold text-slate-800">
                                        Rs. {invoice.amount ? invoice.amount.toFixed(2) : (invoice.finalAmount ? invoice.finalAmount.toFixed(2) : "0.00")}
                                    </td>
                                    <td>
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-sm ${
                                            invoice.status === "Paid" ? "bg-emerald-100 text-emerald-700" : "bg-orange-100 text-orange-700"
                                        }`}>
                                            {invoice.status || "Pending"}
                                        </span>
                                    </td>
                                    <td className="text-sm text-slate-500">
                                        {invoice.invoiceDate ? new Date(invoice.invoiceDate).toLocaleDateString() : (invoice.createdDate ? new Date(invoice.createdDate).toLocaleDateString() : "N/A")}
                                    </td>
                                    <td>
                                        <button className="text-indigo-500 hover:text-indigo-700 hover:bg-indigo-50 p-2 rounded-lg transition-colors">
                                            <Download size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={5} className="p-12 text-center text-slate-400">
                                    <Receipt className="mx-auto mb-3 opacity-30" size={40} />
                                    No invoices found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

// Temporary icon component since we missed importing CheckCircle2 earlier in the file
import { CheckCircle2 } from "lucide-react";

export default Invoices;