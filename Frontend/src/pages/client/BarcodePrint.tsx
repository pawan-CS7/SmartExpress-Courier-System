import { useEffect, useState } from "react";
import api from "../../services/api";
import QRCode from "react-qr-code";

interface Waybill {
    id: number;
    barcode: string;
    clientId: number;
    waybillRequestId: number;
    isUsed?: boolean;
}

// Define the available viewing modes for the component
type ViewMode = "SUMMARY" | "SINGLE_REQUEST" | "ALL_REQUESTS";

function BarcodePrint() {
    const [data, setData] = useState<Waybill[]>([]);
    const [loading, setLoading] = useState(true);
    
    // UI State Management
    const [viewMode, setViewMode] = useState<ViewMode>("SUMMARY");
    const [selectedRequestId, setSelectedRequestId] = useState<number | null>(null);
    const [printingSingleId, setPrintingSingleId] = useState<number | null>(null);

    useEffect(() => {
        loadBarcodes();
    }, []);

    const loadBarcodes = async () => {
        try {
            setLoading(true);
            const res = await api.get("/api/Waybill/all-barcodes");
            setData(res.data);
        } catch (err) {
            console.error("FAILED TO FETCH BARCODES:", err);
        } finally {
            setLoading(false);
        }
    };

    // Group barcodes by their corresponding Request ID
    const groupedBarcodes = data.reduce((acc, waybill) => {
        const reqId = waybill.waybillRequestId || 0; 
        if (!acc[reqId]) {
            acc[reqId] = [];
        }
        acc[reqId].push(waybill);
        return acc;
    }, {} as Record<number, Waybill[]>);

    // Triggers the browser print dialog for all currently visible barcodes
    const handlePrintAll = () => {
        window.print();
    };

    // Triggers the print dialog targeting ONLY one specific barcode via CSS classes
    const handlePrintSingle = (barcodeId: number) => {
        setPrintingSingleId(barcodeId);
        // Small delay ensures React updates the DOM with the targeted print class before printing
        setTimeout(() => {
            window.print();
            setPrintingSingleId(null);
        }, 150);
    };

    // Reusable component block for rendering an individual barcode card
    const renderBarcodeCard = (item: Waybill) => (
        <div
            key={item.id}
            className={`bg-white rounded-3xl shadow-md p-6 flex flex-col items-center border border-gray-100 barcode-card ${
                printingSingleId === item.id ? "target-print" : ""
            }`}
        >
            <h2 className="font-bold text-2xl tracking-wider mb-4 text-gray-800 print-title">
                {item.barcode}
            </h2>

            <div className="bg-white p-3 rounded-xl shadow-inner mb-4 qr-wrapper">
                <QRCode value={item.barcode} size={130} level="H" />
            </div>

            <p className="mt-1 font-medium text-gray-600 text-sm hide-on-print">
                Status:
                <span className={item.isUsed ? "text-red-500 ml-1 font-bold" : "text-green-500 ml-1 font-bold"}>
                    {item.isUsed ? "Used 🚫" : "Available ✅"}
                </span>
            </p>

            <button
                onClick={() => handlePrintSingle(item.id)}
                disabled={item.isUsed}
                className="w-full bg-gray-800 text-white font-semibold px-4 py-2.5 rounded-xl mt-4 hover:bg-gray-900 transition-all disabled:opacity-50 hide-on-print text-sm"
            >
                {item.isUsed ? "Already Used" : "🖨 Print Single"}
            </button>
        </div>
    );

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-red-500"></div>
                <span className="ml-3 font-semibold text-gray-600 text-xl">Loading your barcodes... ⏳</span>
            </div>
        );
    }

    return (
        <div className={`p-8 ${printingSingleId ? "is-single-print" : ""}`}>
            {/* INJECTED PRINT STYLES: 
              This forces the printable area to strictly overlay the entire screen during print,
              ignoring all sidebars, margins, and external UI wrappers. 
            */}
            <style>{`
                @media print {
                    @page { size: A4 portrait; margin: 15mm; }
                    body * { visibility: hidden; }
                    
                    #printable-section, #printable-section * { visibility: visible; }
                    
                    #printable-section {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                        margin: 0;
                        padding: 0;
                    }

                    .hide-on-print { display: none !important; }
                    
                    .barcode-grid {
                        display: grid !important;
                        grid-template-columns: repeat(3, 1fr) !important;
                        gap: 20px !important;
                        width: 100% !important;
                    }

                    .barcode-card {
                        border: 2px solid #222 !important;
                        box-shadow: none !important;
                        padding: 15px !important;
                        border-radius: 12px !important;
                        page-break-inside: avoid !important;
                        break-inside: avoid !important;
                        margin-bottom: 10px !important;
                    }

                    .print-title { font-size: 1.25rem !important; margin-bottom: 10px !important; }
                    .qr-wrapper { padding: 0 !important; box-shadow: none !important; margin-bottom: 0 !important; }

                    /* Logic for single barcode printing */
                    .is-single-print .barcode-card { display: none !important; }
                    .is-single-print .target-print { display: flex !important; }
                    .is-single-print .print-section-title { display: none !important; }
                }
            `}</style>

            {/* VIEW 1: SUMMARY DASHBOARD */}
            {viewMode === "SUMMARY" && (
                <>
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h1 className="text-4xl font-bold text-gray-800">My Waybill Requests 📦</h1>
                            <p className="text-gray-500 mt-1">Select a request or view the entire registry.</p>
                        </div>
                        <button
                            onClick={() => setViewMode("ALL_REQUESTS")}
                            className="bg-gray-800 hover:bg-gray-900 text-white font-bold px-6 py-3 rounded-xl transition shadow-md"
                        >
                            📋 View All Barcodes
                        </button>
                    </div>

                    {Object.keys(groupedBarcodes).length === 0 ? (
                        <div className="bg-white rounded-3xl shadow p-10 text-center text-gray-500 font-medium">
                            No approved barcodes found. Please wait for admin approval.
                        </div>
                    ) : (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {Object.entries(groupedBarcodes).map(([reqId, barcodes]) => (
                                <div
                                    key={reqId}
                                    className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col justify-between hover:shadow-lg hover:-translate-y-1 transition cursor-pointer"
                                    onClick={() => {
                                        setSelectedRequestId(Number(reqId));
                                        setViewMode("SINGLE_REQUEST");
                                    }}
                                >
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-800 mb-2">
                                            Request #{reqId === "0" ? "Direct Assignment" : reqId}
                                        </h2>
                                        <p className="text-sm text-gray-500">
                                            Contains <span className="font-bold text-red-500">{barcodes.length}</span> verified barcodes.
                                        </p>
                                    </div>
                                    <div className="mt-6 text-right">
                                        <span className="text-sm font-semibold text-red-600 bg-red-50 px-3 py-1.5 rounded-lg">
                                            Open Folder ➔
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}

            {/* VIEW 2 & 3: DETAILED GRID (Single Request OR All Requests) */}
            {viewMode !== "SUMMARY" && (
                <div id="printable-section" className="bg-transparent">
                    
                    {/* Sticky Header Controls */}
                    <div className="flex justify-between items-center mb-8 hide-on-print bg-white p-5 rounded-2xl shadow-sm border border-gray-100 sticky top-4 z-10">
                        <button
                            onClick={() => setViewMode("SUMMARY")}
                            className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold px-5 py-2.5 rounded-xl transition flex items-center gap-2"
                        >
                            ⬅ Back
                        </button>
                        
                        <h2 className="text-2xl font-bold text-gray-800">
                            {viewMode === "ALL_REQUESTS" 
                                ? "Complete Barcode Registry" 
                                : `Request #${selectedRequestId} Contents`}
                        </h2>
                        
                        <button
                            onClick={handlePrintAll}
                            className="bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-2.5 rounded-xl transition shadow-md flex items-center gap-2"
                        >
                            🖨 Print Shown
                        </button>
                    </div>

                    {/* Render Single Request Mode */}
                    {viewMode === "SINGLE_REQUEST" && selectedRequestId !== null && (
                        <div className="barcode-grid grid md:grid-cols-3 gap-6">
                            {groupedBarcodes[selectedRequestId].map(renderBarcodeCard)}
                        </div>
                    )}

                    {/* Render All Requests Mode */}
                    {viewMode === "ALL_REQUESTS" && (
                        <div className="space-y-12">
                            {Object.entries(groupedBarcodes).map(([reqId, barcodes]) => (
                                <div key={reqId} className="print-section-wrapper">
                                    <h3 className="text-xl font-bold text-gray-700 mb-6 border-b border-gray-200 pb-3 print-section-title">
                                        Request #{reqId === "0" ? "Direct Assignment" : reqId}
                                    </h3>
                                    <div className="barcode-grid grid md:grid-cols-3 gap-6">
                                        {barcodes.map(renderBarcodeCard)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                </div>
            )}
        </div>
    );
}

export default BarcodePrint;