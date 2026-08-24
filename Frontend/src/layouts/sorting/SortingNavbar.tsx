import { Link, useNavigate } from "react-router-dom";
import { Bell, Search, Phone, FileText } from "lucide-react";
import { useEffect, useState } from "react";
import api from "../../services/api";
import { getCurrentUser, getUserInitials, getTimeOfDayGreeting, type AuthUser } from "../../utils/auth";

function SortingNavbar() {
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);
  const [currentUser, setCurrentUser] = useState<AuthUser>(getCurrentUser());
  const [searchQuery, setSearchQuery] = useState("");
  const greetingInfo = getTimeOfDayGreeting();

  const fetchUnreadCount = async () => {
    try {
      const res = await api.get("/api/Notifications/unread-count");
      setUnreadCount(res.data.count);
    } catch (error) {
      console.error("Failed to fetch unread count for navbar", error);
    }
  };

  const fetchUserProfile = async () => {
    try {
      const res = await api.get("/api/Profile");
      if (res.data) {
        setCurrentUser((prev) => ({
          ...prev,
          name: res.data.name || prev.name,
          email: res.data.email || prev.email,
          role: res.data.role || prev.role,
        }));
        if (res.data.name) {
          localStorage.setItem("userName", res.data.name);
        }
      }
    } catch {
      // Fallback to token/stored user
    }
  };

  useEffect(() => {
    fetchUnreadCount();
    fetchUserProfile();

    const handleNotificationUpdate = () => {
      fetchUnreadCount();
    };

    window.addEventListener("notificationsUpdated", handleNotificationUpdate);
    const interval = setInterval(fetchUnreadCount, 20000);

    return () => {
      window.removeEventListener("notificationsUpdated", handleNotificationUpdate);
      clearInterval(interval);
    };
  }, []);

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to log out?")) {
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      localStorage.removeItem("userName");
      navigate("/login");
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      const query = searchQuery.trim();
      // If it looks like a Waybill ID (e.g. AA123456) or just in general navigate to details
      // Assuming all searches in the top bar are waybill ID searches for now based on user request.
      navigate(`/admin/order-details/${encodeURIComponent(query)}`);
    }
  };

  const displayName = currentUser?.name || currentUser?.role || "Staff Member";
  const userInitials = getUserInitials(displayName);

  return (
    <div className="h-16 bg-[#D83626] text-white flex items-center justify-between px-6 shadow-md z-10 sticky top-0">
      {/* LEFT: Logo & Title */}
      <Link to="/sorting/dashboard" className="flex items-center gap-3 hover:opacity-95 transition-opacity">
        <div className="w-8 h-8 rounded-full flex items-center justify-center bg-white/20 shadow-sm">
          <span className="text-xl">🚀</span>
        </div>
        <div className="flex flex-col leading-tight">
          <span className="font-bold text-lg tracking-wide">Warehouse Central</span>
          <span className="text-[10px] text-white/80 font-medium tracking-widest uppercase">Warehouse</span>
        </div>
      </Link>

      {/* RIGHT CONTROLS */}
      <div className="flex items-center gap-4 sm:gap-6">
        {/* DYNAMIC GREETING PILL */}
        <div className="hidden md:flex items-center gap-3 bg-black/15 px-4 py-1.5 rounded-full border border-white/15 backdrop-blur-sm shadow-inner">
          <div className="text-lg">{greetingInfo.icon}</div>
          <div className="flex flex-col leading-tight">
            <span className="text-[10px] text-white/80 font-medium">{greetingInfo.greeting}</span>
            <span className="text-xs font-bold tracking-wide truncate max-w-[140px]">{displayName}</span>
          </div>
        </div>

        {/* SEARCH BAR */}
        <form onSubmit={handleSearch} className="relative hidden lg:block">
          <input
            type="text"
            placeholder="Search orders, clients..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-64 bg-black/15 border border-white/25 text-white placeholder-white/70 text-sm rounded-full py-1.5 pl-4 pr-10 focus:outline-none focus:bg-black/25 focus:border-white/40 transition-all"
          />
          <button
            type="submit"
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/80 hover:text-white transition-colors"
          >
            <Search size={16} />
          </button>
        </form>

        {/* ICONS */}
        <div className="flex items-center gap-1.5">
          {/* Quick Reports Link */}
          <Link
            to="/admin/reports"
            title="Reports & Analytics"
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-white/15 transition-colors"
          >
            <FileText size={18} className="text-white/90" />
          </Link>

          {/* Dynamic Notification Bell */}
          <Link
            to="/sorting/dashboard"
            title={`${unreadCount} Unread Notifications`}
            className="relative w-9 h-9 flex items-center justify-center rounded-full hover:bg-white/15 transition-colors"
          >
            <Bell
              size={18}
              className={`text-white/90 transition-transform ${
                unreadCount > 0 ? "animate-pulse" : ""
              }`}
            />
            {unreadCount > 0 && (
              <>
                <span className="absolute top-1 right-1 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-300 opacity-75"></span>
                </span>
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-yellow-400 text-slate-900 text-[10px] font-black rounded-full flex items-center justify-center shadow-md px-1 border border-white/30">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              </>
            )}
          </Link>

          {/* Quick Phone / Branch Contact */}
          <Link
            to="/admin/branches"
            title="Branch Operations"
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-white/15 transition-colors"
          >
            <Phone size={18} className="text-white/90" />
          </Link>
        </div>

        {/* PROFILE / LOGOUT */}
        <div className="flex items-center gap-3 ml-1 pl-3 sm:pl-4 border-l border-white/20">
          <Link
            to="/sorting/profile"
            title="My Profile"
            className="w-9 h-9 rounded-full bg-white/20 text-white flex items-center justify-center font-bold text-sm border border-white/30 hover:bg-white/30 transition-all shadow-sm"
          >
            {userInitials}
          </Link>
          <button
            onClick={handleLogout}
            className="text-xs font-semibold text-white/85 hover:text-white bg-black/10 hover:bg-black/20 px-2.5 py-1 rounded-md transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}

export default SortingNavbar;