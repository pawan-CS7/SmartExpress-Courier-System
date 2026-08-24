import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  ListOrdered, 
  Box, 
  Printer, 
  Tag, 
  GitBranch, 
  MapPin, 
  Users, 
  UserPlus,
  Bell, 
  BarChart2, 
  UserCircle,
  ChevronDown,
  ChevronUp,
  CircleDot,
  Truck
} from "lucide-react";
import { getCurrentUser } from "../../utils/auth";

function AdminSidebar() {
  const user = getCurrentUser();
  const location = useLocation();
  const isAdmin = user?.role === "Admin" || user?.role === "Owner";
  
  // State for collapsible menus
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({
    "Branch Orders": true // Open by default if they navigate here
  });

  const toggleMenu = (label: string) => {
    setOpenMenus(prev => ({ ...prev, [label]: !prev[label] }));
  };
  
  // Base menu with role restrictions
  const allMenuItems = [
    { label: "Home Page", path: "/admin/dashboard", icon: LayoutDashboard, roles: ["Admin", "BranchManager"] },
    { label: "Branch Dashboard", path: "/admin/branch-dashboard-select", icon: LayoutDashboard, roles: ["Admin", "BranchManager"] },
    { label: "All Orders", path: "/admin/orders", icon: ListOrdered, roles: ["Admin"] },
    { 
      label: "Branch Orders", 
      icon: Box, 
      roles: ["Admin", "BranchManager"],
      subItems: [
        { label: "All Orders", path: isAdmin ? "/admin/branch-orders-select?redirectTo=all" : "/admin/branch-orders?tab=all" },
        { label: "Collection Queue", path: isAdmin ? "/admin/branch-orders-select?redirectTo=collection" : "/admin/branch-orders?tab=collection" },
        { label: "Incoming Shipments", path: isAdmin ? "/admin/branch-orders-select?redirectTo=incoming" : "/admin/branch-orders?tab=incoming" },
        { label: "Delivery Queue", path: isAdmin ? "/admin/branch-orders-select?redirectTo=delivery" : "/admin/branch-orders?tab=delivery" }
      ]
    },
    { label: "Barcode Print", path: "/admin/barcode", icon: Printer, roles: ["Admin"] },
    { label: "Waybill Management", path: "/admin/waybill-management", icon: Tag, roles: ["Admin", "BranchManager"] },
    { label: "Branch Operations", path: "/admin/branches", icon: GitBranch, roles: ["Admin"] },
    { label: "Cities & Zones", path: "/admin/cities", icon: MapPin, roles: ["Admin"] },
    { label: "User Management", path: "/admin/users", icon: Users, roles: ["Admin", "BranchManager"] },
    { label: "Delivery Riders", path: "/admin/riders", icon: Truck, roles: ["Admin", "BranchManager"] },
    { label: "Branch Managers", path: "/admin/branch-managers", icon: UserPlus, roles: ["Admin"] },
    { label: "Administration & Owners", path: "/admin/administration", icon: Users, roles: ["Admin"] },
    { label: "Notifications", path: "/admin/notify", icon: Bell, roles: ["Admin", "BranchManager"] },
    { label: "Reports & Analytics", path: "/admin/reports", icon: BarChart2, roles: ["Admin"] },
    { isDivider: true, roles: ["Admin", "BranchManager"] },
    { label: "My Profile", path: "/admin/profile", icon: UserCircle, roles: ["Admin", "BranchManager"] },
  ];

  // Filter based on role
  const menu = allMenuItems.filter(item => !item.roles || item.roles.includes(user?.role || "Admin"));

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-[calc(100vh-4rem)] py-6 px-4 flex flex-col shadow-sm shrink-0 overflow-y-auto">
      <div className="space-y-1">
        {menu.map((item, idx) => {
          if (item.isDivider) {
            return <div key={`div-${idx}`} className="h-px bg-gray-200 my-4 mx-2"></div>;
          }

          const Icon = item.icon;
          
          if (item.subItems) {
            const isOpen = openMenus[item.label!];
            const isActiveParent = location.pathname.includes("branch-orders");
            
            return (
              <div key={item.label} className="flex flex-col">
                <button
                  onClick={() => toggleMenu(item.label!)}
                  className={`flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActiveParent
                      ? "bg-[#fff1f0] text-[#D83626] font-semibold shadow-sm"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {Icon && <Icon size={18} className="shrink-0" />}
                    <span className="truncate">{item.label}</span>
                  </div>
                  {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
                
                {isOpen && (
                  <div className="flex flex-col mt-1 ml-4 border-l-2 border-gray-100 pl-2 space-y-1">
                    {item.subItems.map(sub => {
                      // Custom active state logic for query params
                      const isActiveSub = location.pathname.includes("branch-orders") && location.search.includes(`tab=${sub.path.split("tab=")[1] || sub.path.split("redirectTo=")[1]}`);
                      
                      return (
                        <NavLink
                          key={sub.label}
                          to={sub.path}
                          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                            isActiveSub
                              ? "text-[#D83626] font-bold bg-red-50/50"
                              : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                          }`}
                        >
                          <CircleDot size={12} className={isActiveSub ? "text-[#D83626]" : "text-gray-300"} />
                          {sub.label}
                        </NavLink>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }

          return (
            <NavLink
              key={item.label}
              to={item.path!}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-[#fff1f0] text-[#D83626] font-semibold shadow-sm"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`
              }
            >
              {Icon && <Icon size={18} className="shrink-0" />}
              <span className="truncate">{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </aside>
  );
}

export default AdminSidebar;