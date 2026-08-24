import { NavLink } from "react-router-dom";
import { 
  LayoutDashboard, 
  PackageCheck,
  PackageOpen,
  Inbox,
  Package,
  Clock
} from "lucide-react";

function SortingSidebar() {
  const menu: Array<{ label?: string, path?: string, icon?: any, isDivider?: boolean }> = [
    { label: "Dashboard / Overview", path: "/sorting/dashboard", icon: LayoutDashboard },
    { isDivider: true },
    { label: "Expected Inbound", path: "/sorting/expected", icon: Inbox },
    { label: "Inbound Receive", path: "/sorting/inbound", icon: PackageCheck },
    { isDivider: true },
    { label: "Currently in Warehouse", path: "/sorting/inventory", icon: Package },
    { label: "Outbound Sort & Dispatch", path: "/sorting/outbound", icon: PackageOpen },
    { isDivider: true },
    { label: "Dispatch History", path: "/sorting/history", icon: Clock }
  ];

  return (
    <aside className="w-64 bg-[#1a0b2e] border-r border-purple-900/30 min-h-[calc(100vh-4rem)] py-6 px-4 flex flex-col shadow-sm shrink-0">
      <div className="space-y-1">
        {menu.map((item, idx) => {
          if (item.isDivider) {
            return <div key={`div-${idx}`} className="h-px bg-purple-900/50 my-4 mx-2"></div>;
          }

          const Icon = item.icon;
          
          return (
            <NavLink
              key={item.label}
              to={item.path!}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-purple-600/20 text-purple-300 font-semibold shadow-sm"
                    : "text-purple-300/70 hover:bg-purple-900/30 hover:text-purple-200"
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

export default SortingSidebar;
