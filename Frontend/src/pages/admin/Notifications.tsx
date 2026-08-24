import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Package, 
  Tag, 
  Users, 
  Mail, 
  Bell, 
  FileText, 
  CheckCircle, 
  Clock,
  ArrowRight,
  Inbox
} from "lucide-react";
import api from "../../services/api";

interface NotificationDto {
  id: number;
  category: string; // 'New Order', 'Waybill Request', 'New User', etc.
  message: string;
  targetId: number | null;
  isRead: boolean;
  createdAt: string;
}

function Notifications() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("orders");
  const [notifications, setNotifications] = useState<NotificationDto[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/Notifications");
      setNotifications(res.data);
    } catch (err) {
      console.error("Failed to fetch notifications", err);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: number) => {
    try {
      await api.put(`/api/Notifications/${id}/read`);
      setNotifications((prev) => 
        prev.map(n => n.id === id ? { ...n, isRead: true } : n)
      );
      window.dispatchEvent(new Event("notificationsUpdated"));
    } catch (err) {
      console.error("Failed to mark as read", err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.put(`/api/Notifications/read-all`);
      setNotifications((prev) => prev.map(n => ({ ...n, isRead: true })));
      window.dispatchEvent(new Event("notificationsUpdated"));
    } catch (err) {
      console.error("Failed to mark all as read", err);
    }
  };

  const handleAction = async (notif: NotificationDto, path: string) => {
    if (!notif.isRead) {
      await markAsRead(notif.id);
    }
    navigate(`${path}?highlightId=${notif.targetId}`);
  };

  const tabs = [
    { id: "orders", label: "New Orders", icon: Package, color: "text-blue-500", bg: "bg-blue-50" },
    { id: "waybills", label: "Waybill Requests", icon: Tag, color: "text-purple-500", bg: "bg-purple-50" },
    { id: "users", label: "New Users", icon: Users, color: "text-green-500", bg: "bg-green-50" },
    { id: "divider", label: "", isDivider: true },
    { id: "complaints", label: "Client Complaints", icon: Mail, color: "text-orange-500", bg: "bg-orange-50" },
    { id: "system", label: "System Alerts", icon: Bell, color: "text-red-500", bg: "bg-red-50" },
    { id: "reports", label: "Bill Reports", icon: FileText, color: "text-indigo-500", bg: "bg-indigo-50" },
  ];

  // Filtering based on active tab
  const getFilteredNotifications = () => {
    let list: NotificationDto[] = [];
    switch (activeTab) {
      case "orders": list = notifications.filter(n => n.category === "New Order" || n.category === "Order"); break;
      case "waybills": list = notifications.filter(n => n.category === "Waybill Request" || n.category === "Waybill"); break;
      case "users": list = notifications.filter(n => n.category === "New User" || n.category === "User"); break;
      default: list = [];
    }

    // Sort: Unread first, then by date descending
    return list.sort((a, b) => {
      if (a.isRead === b.isRead) {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      return a.isRead ? 1 : -1;
    });
  };

  const filtered = getFilteredNotifications();

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Notification Panel</h1>
          <p className="text-slate-500 mt-2">Manage your administrative alerts and tasks</p>
        </div>
        <button 
          onClick={markAllAsRead}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-slate-600 font-medium hover:bg-slate-50 hover:text-slate-800 transition-colors shadow-sm"
        >
          <CheckCircle size={18} className="text-slate-400" />
          Mark all as read
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Navigation */}
        <div className="w-full lg:w-72 flex-shrink-0">
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex flex-col gap-1">
            {tabs.map((tab, idx) => {
              if (tab.isDivider) {
                return <div key={`div-${idx}`} className="h-px bg-slate-100 my-4 mx-2"></div>;
              }
              const Icon = tab.icon as any;
              const isActive = activeTab === tab.id;
              
              // Count unread for active categories
              let unreadCount = 0;
              if (tab.id === "orders") unreadCount = notifications.filter(n => (n.category === "New Order" || n.category === "Order") && !n.isRead).length;
              if (tab.id === "waybills") unreadCount = notifications.filter(n => (n.category === "Waybill Request" || n.category === "Waybill") && !n.isRead).length;
              if (tab.id === "users") unreadCount = notifications.filter(n => (n.category === "New User" || n.category === "User") && !n.isRead).length;

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id!)}
                  className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 ${
                    isActive 
                      ? "bg-slate-800 text-white shadow-md shadow-slate-200" 
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${isActive ? "bg-white/10" : tab.bg}`}>
                      <Icon size={18} className={isActive ? "text-white" : tab.color} />
                    </div>
                    <span className="font-semibold text-sm">{tab.label}</span>
                  </div>
                  {unreadCount > 0 && (
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                      isActive ? "bg-red-500 text-white" : "bg-red-100 text-red-600"
                    }`}>
                      {unreadCount}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden min-h-[600px]">
          
          {/* Header */}
          <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/50">
             <h2 className="text-xl font-bold text-slate-800">
                {tabs.find(t => t.id === activeTab)?.label}
             </h2>
          </div>

          <div className="p-8">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                <Clock className="w-8 h-8 animate-spin mb-4" />
                <p className="font-medium">Loading notifications...</p>
              </div>
            ) : (
              <>
                {/* Coming Soon States */}
                {["complaints", "system", "reports"].includes(activeTab) ? (
                  <div className="flex flex-col items-center justify-center h-96 text-center animate-in fade-in duration-500">
                    <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                      <Inbox className="w-10 h-10 text-slate-300" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-800 mb-2">Coming Soon</h3>
                    <p className="text-slate-500 max-w-md">
                      We are currently building this feature. Soon you'll be able to manage all your {tabs.find(t => t.id === activeTab)?.label.toLowerCase()} right from here.
                    </p>
                  </div>
                ) : (
                  /* Active States List */
                  <div className="flex flex-col gap-4">
                    {filtered.length === 0 ? (
                       <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                         <CheckCircle className="w-12 h-12 mb-4 text-slate-200" />
                         <p className="font-medium">You're all caught up!</p>
                       </div>
                    ) : (
                      filtered.map(notif => (
                        <div 
                          key={notif.id} 
                          className={`group flex items-start gap-5 p-5 rounded-2xl border transition-all duration-200 ${
                            notif.isRead 
                              ? 'border-slate-100 bg-slate-50 opacity-60' 
                              : 'border-blue-100 bg-blue-50/30 shadow-sm'
                          }`}
                        >
                          {/* Icon based on category */}
                          <div className={`p-3 rounded-xl flex-shrink-0 ${
                            activeTab === 'orders' ? 'bg-blue-100 text-blue-600' :
                            activeTab === 'waybills' ? 'bg-purple-100 text-purple-600' :
                            'bg-green-100 text-green-600'
                          }`}>
                            {activeTab === 'orders' && <Package size={20} />}
                            {activeTab === 'waybills' && <Tag size={20} />}
                            {activeTab === 'users' && <Users size={20} />}
                          </div>

                          <div className="flex-1 min-w-0">
                            {/* NEW USER WELCOME VIBE */}
                            {activeTab === 'users' ? (
                              <div>
                                <h4 className={`text-lg font-bold mb-1 ${notif.isRead ? 'text-slate-600' : 'text-slate-800'}`}>🎉 New User Registration</h4>
                                <p className="text-slate-600 leading-relaxed">{notif.message}</p>
                                <p className="text-xs font-semibold text-slate-400 mt-3 mb-4 flex items-center gap-1">
                                  <Clock size={12} />
                                  {new Date(notif.createdAt).toLocaleString()}
                                </p>
                                <div className="flex gap-3">
                                  <button 
                                    onClick={() => handleAction(notif, '/admin/users')}
                                    className="flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-sm font-semibold rounded-lg transition-colors"
                                  >
                                    Take Action
                                    <ArrowRight size={14} />
                                  </button>
                                  
                                  {!notif.isRead && (
                                    <button 
                                      onClick={() => markAsRead(notif.id)}
                                      className="px-4 py-2 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 text-sm font-semibold rounded-lg transition-colors"
                                    >
                                      Mark as read
                                    </button>
                                  )}
                                </div>
                              </div>
                            ) : (
                              /* ORDER & WAYBILL VIBE */
                              <div>
                                <div className="flex justify-between items-start mb-2">
                                  <h4 className={`font-bold ${notif.isRead ? 'text-slate-700' : 'text-slate-900'}`}>
                                    {notif.category} #{notif.targetId}
                                  </h4>
                                  <span className="text-xs font-semibold text-slate-400 flex items-center gap-1">
                                    <Clock size={12} />
                                    {new Date(notif.createdAt).toLocaleDateString()}
                                  </span>
                                </div>
                                <p className="text-slate-600 text-sm">{notif.message}</p>
                                
                                <div className="mt-4 flex gap-3">
                                  <button 
                                    onClick={() => handleAction(
                                      notif, 
                                      activeTab === 'orders' ? '/admin/orders' : '/admin/waybill-management'
                                    )}
                                    className="flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-sm font-semibold rounded-lg transition-colors"
                                  >
                                    Take Action
                                    <ArrowRight size={14} />
                                  </button>
                                  
                                  {!notif.isRead && (
                                    <button 
                                      onClick={() => markAsRead(notif.id)}
                                      className="px-4 py-2 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 text-sm font-semibold rounded-lg transition-colors"
                                    >
                                      Mark as read
                                    </button>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                          
                          {!notif.isRead && (
                            <div className="w-2.5 h-2.5 rounded-full bg-blue-500 mt-2 flex-shrink-0"></div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Notifications;
