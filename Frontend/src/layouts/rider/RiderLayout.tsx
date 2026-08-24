import React, { useState } from "react";
import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom";
import { LogOut, Package, CheckCircle, XCircle, Menu, X, User as UserIcon } from "lucide-react";
import { getCurrentUser } from "../../utils/auth";
import { toast } from "react-hot-toast";

const RiderLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = getCurrentUser();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("userName");
    navigate("/login");
    toast.success("Logged out successfully");
  };

  const navLinks = [
    { name: "Pending", path: "/rider/pending", icon: <Package size={20} /> },
    { name: "Completed", path: "/rider/completed", icon: <CheckCircle size={20} /> },
    { name: "Failed", path: "/rider/failed", icon: <XCircle size={20} /> },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Mobile-first Header */}
      <header className="bg-blue-600 text-white shadow-md sticky top-0 z-50">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <button
              className="p-1 hover:bg-blue-700 rounded-lg md:hidden transition"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <h1 className="font-bold text-xl tracking-tight">SmartExpress</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 bg-blue-700/50 px-3 py-1.5 rounded-full text-sm">
              <UserIcon size={16} />
              <span className="font-medium truncate max-w-[120px]">{user?.name}</span>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 hover:bg-blue-700 rounded-full transition text-blue-100 hover:text-white"
              title="Logout"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col md:flex-row relative">
        {/* Mobile Navigation Menu (Overlay) */}
        {isMobileMenuOpen && (
          <div className="absolute inset-0 bg-white z-40 md:hidden flex flex-col pt-4 shadow-lg border-b border-gray-100 animate-in slide-in-from-top-2">
            <div className="px-4 pb-4 mb-4 border-b border-gray-100">
              <div className="flex items-center gap-3 text-gray-700">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                  <UserIcon size={20} />
                </div>
                <div>
                  <p className="font-bold text-lg">{user?.name}</p>
                  <p className="text-sm text-gray-500">Delivery Rider</p>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-2 px-2">
              {navLinks.map((link) => (
                <NavLink
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
                      isActive
                        ? "bg-blue-50 text-blue-700 shadow-sm border border-blue-100"
                        : "text-gray-600 hover:bg-gray-50 hover:text-blue-600"
                    }`
                  }
                >
                  {link.icon}
                  {link.name} Deliveries
                </NavLink>
              ))}
            </div>
          </div>
        )}

        {/* Desktop Sidebar Navigation */}
        <nav className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200 p-4 gap-2 shadow-sm z-10">
          <div className="mb-6 px-2">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Navigation</p>
          </div>
          {navLinks.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
                  isActive
                    ? "bg-blue-50 text-blue-700 shadow-sm border border-blue-100"
                    : "text-gray-600 hover:bg-gray-50 hover:text-blue-600"
                }`
              }
            >
              {link.icon}
              {link.name}
            </NavLink>
          ))}
        </nav>

        {/* Dynamic Page Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50">
          <Outlet />
        </main>
      </div>

      {/* Bottom Navigation (Mobile Only) */}
      <div className="md:hidden bg-white border-t border-gray-200 flex justify-around items-center pb-safe pt-1 sticky bottom-0 z-40 shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
        {navLinks.map((link) => {
          const isActive = location.pathname === link.path;
          return (
            <NavLink
              key={link.path}
              to={link.path}
              className={`flex flex-col items-center justify-center p-2 min-w-[80px] ${
                isActive ? "text-blue-600" : "text-gray-500 hover:text-blue-500"
              }`}
            >
              <div className={`p-1.5 rounded-full transition-all ${isActive ? "bg-blue-50" : ""}`}>
                {link.icon}
              </div>
              <span className={`text-[11px] mt-1 font-medium ${isActive ? "font-bold" : ""}`}>
                {link.name}
              </span>
            </NavLink>
          );
        })}
      </div>
    </div>
  );
};

export default RiderLayout;
