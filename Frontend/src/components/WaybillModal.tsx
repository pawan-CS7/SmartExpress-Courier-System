import React from "react";
import QRCode from "react-qr-code";
import { X, Printer, Package, Truck, Phone, MapPin } from "lucide-react";
import type { Order } from "../types/Order";

interface WaybillModalProps {
    order: Order | null;
    isOpen: boolean;
    onClose: () => void;
}

export const WaybillModal: React.FC<WaybillModalProps> = ({ order, isOpen, onClose }) => {
    if (!isOpen || !order) return null;

    const trackingNumber = order.trackingNumber || `TRK-${order.id}`;
    const formattedDate = order.createdAt 
        ? new Date(order.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
        : order.createdDate || new Date().toLocaleDateString();

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
            {/* Embedded Print CSS */}
            <style>{`
                @media print {
                    body * {
                        visibility: hidden !important;
                    }
                    .waybill-printable, .waybill-printable * {
                        visibility: visible !important;
                    }
                    .waybill-printable {
                        position: fixed !important;
                        left: 50% !important;
                        top: 20px !important;
                        transform: translateX(-50%) !important;
                        width: 100mm !important;
                        max-width: 100mm !important;
                        margin: 0 !important;
                        padding: 16px !important;
                        background: #ffffff !important;
                        color: #000000 !important;
                        border: 2px solid #000000 !important;
                        box-shadow: none !important;
                        border-radius: 0 !important;
                        z-index: 99999 !important;
                    }
                    .hide-on-print {
                        display: none !important;
                    }
                }
            `}</style>

            <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col my-auto border border-slate-100">
                {/* Modal Header */}
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/80 hide-on-print">
                    <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        <Printer className="text-indigo-600" size={22} /> Waybill / Shipping Label
                    </h3>
                    <button 
                        onClick={onClose} 
                        className="text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-200/60 transition">
                        <X size={20} />
                    </button>
                </div>

                {/* Printable Label Container */}
                <div className="p-6 overflow-y-auto max-h-[75vh] flex justify-center bg-slate-100/50">
                    <div className="waybill-printable bg-white w-full max-w-[400px] border-2 border-slate-900 rounded-2xl p-5 shadow-lg text-slate-900 font-sans">
                        
                        {/* Header Branding */}
                        <div className="flex items-center justify-between pb-3 border-b-2 border-slate-900 mb-3">
                            <div className="flex items-center gap-2">
                                <div className="bg-indigo-600 text-white p-2 rounded-xl flex items-center justify-center">
                                    <Truck size={22} />
                                </div>
                                <div>
                                    <h2 className="font-extrabold text-xl tracking-tight text-slate-900 leading-none">SmartExpress</h2>
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">Courier & Logistics</span>
                                </div>
                            </div>
                            <div className="text-right">
                                <span className="inline-block bg-slate-900 text-white text-[11px] font-bold px-2.5 py-1 rounded">EXPRESS</span>
                                <p className="text-[10px] text-slate-500 font-medium mt-0.5">{formattedDate}</p>
                            </div>
                        </div>

                        {/* Barcode & QR Code Section */}
                        <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-xl p-3 mb-3">
                            <div className="flex flex-col justify-center">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tracking / Waybill No</span>
                                <span className="font-mono text-lg font-extrabold text-indigo-950 tracking-wider my-0.5">{trackingNumber}</span>
                                <span className="text-[11px] text-slate-500 font-medium flex items-center gap-1">
                                    <Package size={12} className="text-indigo-500" /> Standard Courier Delivery
                                </span>
                            </div>
                            <div className="bg-white p-1.5 rounded-lg border border-slate-200 shadow-sm shrink-0">
                                <QRCode value={trackingNumber} size={76} level="M" />
                            </div>
                        </div>

                        {/* Details Grid: Shipper & Receiver */}
                        <div className="grid grid-cols-1 gap-2 text-xs mb-3">
                            {/* Shipper */}
                            <div className="border border-slate-300 rounded-xl p-3 bg-slate-50/50">
                                <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                                    <MapPin size={12} className="text-indigo-600" /> Shipper (From)
                                </div>
                                <p className="font-bold text-slate-900 text-sm">
                                    {order.client?.businessName || order.client?.ownerName || order.senderName || "SmartExpress Merchant"}
                                </p>
                                <p className="text-slate-600 mt-0.5 leading-snug">
                                    {order.client?.pickupAddress || order.client?.address || order.pickupAddress || "Pickup Warehouse Location"}
                                </p>
                                {order.client?.phone && (
                                    <p className="text-slate-600 font-medium mt-1 flex items-center gap-1">
                                        <Phone size={10} /> {order.client.phone}
                                    </p>
                                )}
                            </div>

                            {/* Receiver */}
                            <div className="border-2 border-indigo-600/30 rounded-xl p-3 bg-indigo-50/20">
                                <div className="flex items-center gap-1 text-[10px] font-bold text-indigo-700 uppercase tracking-wider mb-1">
                                    <MapPin size={12} className="text-indigo-600" /> Receiver (To / Destination)
                                </div>
                                <p className="font-extrabold text-slate-900 text-base">
                                    {order.customerName || order.receiverName || "Valued Customer"}
                                </p>
                                <p className="text-slate-800 font-medium mt-1 text-xs leading-relaxed">
                                    {order.address || order.deliveryAddress || "Delivery Address Pending"}
                                </p>
                                <p className="text-slate-900 font-bold mt-1.5 flex items-center gap-1 text-xs">
                                    <Phone size={12} className="text-indigo-600" /> 
                                    {order.phone1 || "N/A"}{order.phone2 ? ` / ${order.phone2}` : ""}
                                </p>
                            </div>
                        </div>

                        {/* Order Specs Grid */}
                        <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                            <div className="border border-slate-200 rounded-xl p-2.5 bg-slate-50 text-center">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Parcel Weight</span>
                                <span className="font-bold text-slate-800 text-sm">{order.remarks || "0.5 kg"}</span>
                            </div>
                            <div className="border-2 border-emerald-600 bg-emerald-50 rounded-xl p-2.5 text-center">
                                <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">COD Amount</span>
                                <span className="font-extrabold text-emerald-950 text-base">
                                    Rs. {(order.codAmount ?? 0).toFixed(2)}
                                </span>
                            </div>
                        </div>

                        {/* Label Footer */}
                        <div className="pt-2 border-t border-slate-200 text-center text-[10px] text-slate-400">
                            <p>Thank you for choosing SmartExpress Courier System!</p>
                        </div>
                    </div>
                </div>

                {/* Action Footer */}
                <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3 hide-on-print">
                    <button 
                        onClick={onClose}
                        className="px-5 py-2.5 rounded-xl border border-slate-300 font-semibold text-slate-600 hover:bg-slate-100 transition-all text-sm">
                        Cancel
                    </button>
                    <button 
                        onClick={handlePrint}
                        className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-all shadow-md hover:shadow-lg flex items-center gap-2 text-sm">
                        <Printer size={18} /> Print Label
                    </button>
                </div>
            </div>
        </div>
    );
};

export default WaybillModal;
