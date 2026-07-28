import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { 
  Home, 
  PlusCircle, 
  Package, 
  Printer, 
  Ticket, 
  Receipt, 
  Briefcase, 
  UserCircle,
  ChevronDown,
  ChevronRight,
  Truck,
  FileText
} from "lucide-react";

function ClientSidebar() {
  const location = useLocation();
  const [openOps, setOpenOps] = useState(true);
  const [openReports, setOpenReports] = useState(false);

  const isActive = (path: string) => location.pathname === path;
  const isOpsActive = location.pathname.includes('/client/processing') || 
                      location.pathname.includes('/client/receivable') || 
                      location.pathname.includes('/client/received') ||
                      location.pathname.includes('/client/returned') ||
                      location.pathname.includes('/client/age');

  return (
    <div className="w-72 h-screen bg-white text-slate-800 border-r shadow-xl fixed p-5 overflow-y-auto custom-scrollbar flex flex-col">
      {/* LOGO */}
      <div className="text-2xl font-black text-red-500 mb-8 mt-2 px-2 flex items-center gap-3 tracking-wide">
        <span className="bg-red-500 p-2 rounded-xl">
          <Truck size={24} className="text-white" />
        </span>
        SmartExpress
      </div>

      <div className="space-y-1.5 flex-1">
        <div className="text-xs font-bold text-slate-400 uppercase tracking-widest px-4 mb-3 mt-4">Dashboard</div>
        
        <Link
          to="/client/dashboard"
          className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all font-medium ${
            isActive("/client/dashboard") ? "bg-red-500 text-white shadow-lg shadow-red-500/30" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
          }`}
        >
          <Home size={20} className={isActive("/client/dashboard") ? "text-white" : "text-slate-400"} />
          Overview
        </Link>

        <div className="text-xs font-bold text-slate-400 uppercase tracking-widest px-4 mb-3 mt-8">Shipments</div>

        <Link
          to="/client/orders/create"
          className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all font-medium ${
            isActive("/client/orders/create") ? "bg-red-500 text-white shadow-lg shadow-red-500/30" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
          }`}
        >
          <PlusCircle size={20} className={isActive("/client/orders/create") ? "text-white" : "text-slate-400"} />
          Add New Order
        </Link>

        <Link
          to="/client/orders"
          className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all font-medium ${
            isActive("/client/orders") ? "bg-red-500 text-white shadow-lg shadow-red-500/30" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
          }`}
        >
          <Package size={20} className={isActive("/client/orders") ? "text-white" : "text-slate-400"} />
          My Orders
        </Link>

        <Link
          to="/client/barcode"
          className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all font-medium ${
            isActive("/client/barcode") ? "bg-red-500 text-white shadow-lg shadow-red-500/30" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
          }`}
        >
          <Printer size={20} className={isActive("/client/barcode") ? "text-white" : "text-slate-400"} />
          Barcode Print
        </Link>

        <Link
          to="/client/waybill-request"
          className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all font-medium ${
            isActive("/client/waybill-request") ? "bg-red-500 text-white shadow-lg shadow-red-500/30" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
          }`}
        >
          <Ticket size={20} className={isActive("/client/waybill-request") ? "text-white" : "text-slate-400"} />
          Waybill Request
        </Link>

        <div className="text-xs font-bold text-slate-400 uppercase tracking-widest px-4 mb-3 mt-8">Billing & Ops</div>

        <Link
          to="/client/invoices"
          className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all font-medium ${
            isActive("/client/invoices") ? "bg-red-500 text-white shadow-lg shadow-red-500/30" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
          }`}
        >
          <Receipt size={20} className={isActive("/client/invoices") ? "text-white" : "text-slate-400"} />
          My Invoices
        </Link>

        {/* CLIENT OPERATIONS ACCORDION */}
        <div className="pt-1">
          <button
            onClick={() => setOpenOps(!openOps)}
            className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl transition-all font-medium ${
              isOpsActive && !openOps ? "bg-slate-50 text-slate-900" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            <div className="flex items-center gap-3">
              <Briefcase size={20} className={isOpsActive ? "text-red-500" : "text-slate-400"} />
              Client Operations
            </div>
            {openOps ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>

          {openOps && (
            <div className="ml-11 mt-1 space-y-1 border-l border-slate-200 pl-3 py-1">
              <Link 
                to="/client/processing" 
                className={`block py-2 px-3 rounded-lg text-sm font-medium transition-colors ${isActive("/client/processing") ? "text-slate-900 bg-slate-100" : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"}`}
              >
                Processing Orders
              </Link>
              
              <Link 
                to="/client/receivable" 
                className={`block py-2 px-3 rounded-lg text-sm font-medium transition-colors ${isActive("/client/receivable") ? "text-slate-900 bg-slate-100" : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"}`}
              >
                Receivable Orders
              </Link>

              <Link 
                to="/client/received" 
                className={`block py-2 px-3 rounded-lg text-sm font-medium transition-colors ${isActive("/client/received") ? "text-slate-900 bg-slate-100" : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"}`}
              >
                Received Orders
              </Link>

              {/* NESTED REPORTS */}
              <div className="mt-1">
                <button
                  onClick={() => setOpenReports(!openReports)}
                  className="w-full flex items-center justify-between py-2 px-3 rounded-lg text-sm font-medium text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <FileText size={14} />
                    Delivery Reports
                  </div>
                  {openReports ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                </button>

                {openReports && (
                  <div className="ml-4 mt-1 space-y-1">
                    <Link 
                      to="/client/returned" 
                      className={`block py-1.5 px-3 rounded-md text-xs font-medium transition-colors ${isActive("/client/returned") ? "text-red-500" : "text-slate-500 hover:text-slate-700"}`}
                    >
                      Returned Orders
                    </Link>
                    <Link 
                      to="/client/age" 
                      className={`block py-1.5 px-3 rounded-md text-xs font-medium transition-colors ${isActive("/client/age") ? "text-red-500" : "text-slate-500 hover:text-slate-700"}`}
                    >
                      Age Reports
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* FOOTER PROFILE */}
      <div className="mt-8 pt-6 border-t border-slate-200">
        <Link
          to="/client/profile"
          className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium hover:bg-slate-50 text-slate-600 hover:text-slate-900"
        >
          <UserCircle size={22} className="text-slate-400" />
          My Profile
        </Link>
      </div>
    </div>
  );
}

export default ClientSidebar;