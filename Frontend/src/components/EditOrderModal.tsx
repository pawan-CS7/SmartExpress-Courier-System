import React, { useState, useEffect } from "react";
import { X, Save, User, Phone, MapPin, DollarSign, Scale, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import type { Order } from "../types/Order";
import { updateOrder } from "../services/orderService";

interface EditOrderModalProps {
    order: Order | null;
    isOpen: boolean;
    onClose: () => void;
    onSaveSuccess: () => void;
}

export const EditOrderModal: React.FC<EditOrderModalProps> = ({ order, isOpen, onClose, onSaveSuccess }) => {
    const [customerName, setCustomerName] = useState("");
    const [phone1, setPhone1] = useState("");
    const [phone2, setPhone2] = useState("");
    const [address, setAddress] = useState("");
    const [codAmount, setCodAmount] = useState("");
    const [weight, setWeight] = useState("");

    const [saving, setSaving] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const [successMsg, setSuccessMsg] = useState("");

    useEffect(() => {
        if (order) {
            setCustomerName(order.customerName || order.receiverName || "");
            setPhone1(order.phone1 || "");
            setPhone2(order.phone2 || "");
            setAddress(order.address || order.deliveryAddress || "");
            setCodAmount(order.codAmount !== undefined ? order.codAmount.toString() : "0");
            setWeight(order.remarks || "");
            setErrorMsg("");
            setSuccessMsg("");
        }
    }, [order, isOpen]);

    if (!isOpen || !order) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg("");
        setSuccessMsg("");

        if (!customerName.trim()) {
            setErrorMsg("Receiver Name is required.");
            return;
        }
        if (!phone1.trim()) {
            setErrorMsg("Receiver Primary Phone is required.");
            return;
        }
        if (!address.trim()) {
            setErrorMsg("Delivery Address is required.");
            return;
        }

        setSaving(true);
        try {
            const updatePayload = {
                customerName: customerName.trim(),
                phone1: phone1.trim(),
                phone2: phone2.trim() || undefined,
                address: address.trim(),
                codAmount: parseFloat(codAmount) || 0,
                weight: weight.trim() || undefined
            };

            await updateOrder(order.id, updatePayload);
            setSuccessMsg("Order updated successfully!");
            setTimeout(() => {
                onSaveSuccess();
                onClose();
            }, 800);
        } catch (err: any) {
            console.error("Failed to update order:", err);
            const msg = err.response?.data?.message || err.message || "Failed to update order. Please try again.";
            setErrorMsg(msg);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm overflow-y-auto">
            <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col my-auto border border-slate-100">
                
                {/* Header */}
                <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/80">
                    <div>
                        <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                            <User className="text-indigo-600" size={22} /> Edit Order Details
                        </h3>
                        <p className="text-xs text-slate-500 font-mono mt-0.5">
                            Tracking No: <span className="font-bold text-indigo-600">{order.orderNo || order.waybillId || order.id}</span>
                        </p>
                    </div>
                    <button 
                        onClick={onClose} 
                        className="text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-200/60 transition">
                        <X size={20} />
                    </button>
                </div>

                {/* Form Body */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    
                    {errorMsg && (
                        <div className="bg-red-50 text-red-700 text-sm font-medium p-3.5 rounded-2xl border border-red-100 flex items-center gap-2.5">
                            <AlertCircle size={18} className="shrink-0" />
                            <span>{errorMsg}</span>
                        </div>
                    )}

                    {successMsg && (
                        <div className="bg-emerald-50 text-emerald-700 text-sm font-medium p-3.5 rounded-2xl border border-emerald-100 flex items-center gap-2.5">
                            <CheckCircle2 size={18} className="shrink-0 text-emerald-600" />
                            <span>{successMsg}</span>
                        </div>
                    )}

                    {/* Receiver Name */}
                    <div>
                        <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                            Receiver Name *
                        </label>
                        <div className="relative">
                            <User size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                value={customerName}
                                onChange={e => setCustomerName(e.target.value)}
                                placeholder="Enter Receiver's Full Name"
                                className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all font-medium"
                                required
                            />
                        </div>
                    </div>

                    {/* Phone Numbers */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                                Phone 1 *
                            </label>
                            <div className="relative">
                                <Phone size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="text"
                                    value={phone1}
                                    onChange={e => setPhone1(e.target.value)}
                                    placeholder="Primary Mobile"
                                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all font-medium"
                                    required
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                                Phone 2 (Optional)
                            </label>
                            <div className="relative">
                                <Phone size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="text"
                                    value={phone2}
                                    onChange={e => setPhone2(e.target.value)}
                                    placeholder="Alt Mobile"
                                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all font-medium"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Delivery Address */}
                    <div>
                        <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                            Delivery Address *
                        </label>
                        <div className="relative">
                            <MapPin size={18} className="absolute left-3.5 top-3 text-slate-400" />
                            <textarea
                                value={address}
                                onChange={e => setAddress(e.target.value)}
                                placeholder="Complete Delivery Address & Landmark"
                                rows={2}
                                className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl pl-10 pr-4 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all font-medium resize-none"
                                required
                            />
                        </div>
                    </div>

                    {/* COD & Weight */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                                COD Amount (Rs.)
                            </label>
                            <div className="relative">
                                <DollarSign size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={codAmount}
                                    onChange={e => setCodAmount(e.target.value)}
                                    placeholder="0.00"
                                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all font-medium"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                                Parcel Weight
                            </label>
                            <div className="relative">
                                <Scale size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="text"
                                    value={weight}
                                    onChange={e => setWeight(e.target.value)}
                                    placeholder="e.g. 1kg"
                                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all font-medium"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-3 border-t border-slate-100 flex justify-end gap-3">
                        <button 
                            type="button"
                            onClick={onClose}
                            disabled={saving}
                            className="px-5 py-2.5 rounded-xl border border-slate-300 font-semibold text-slate-600 hover:bg-slate-100 transition-all text-sm disabled:opacity-50">
                            Cancel
                        </button>
                        <button 
                            type="submit"
                            disabled={saving}
                            className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-all shadow-md hover:shadow-lg flex items-center gap-2 text-sm disabled:opacity-50">
                            {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                            {saving ? "Saving Changes..." : "Save Changes"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditOrderModal;
