import { useEffect, useState } from "react";
import { getClientDashboard } from "../../services/dashboardService";

function Dashboard() {
  const [metrics, setMetrics] = useState({
    processing: 0,
    dispatched: 0,
    collected: 0,
    receivedDestination: 0,
    outForDelivery: 0,
    rescheduled: 0,
    failedToDeliver: 0,
    returnedToClient: 0,
    returnedBranchRescheduled: 0,
    returnedBranchFailed: 0,
    receivableCOD: 0,
    netReceivable: 0,
    totalReceived: 0,
  });

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const data = await getClientDashboard();
        setMetrics(data);
      } catch (error) {
        console.error("Failed to load client metrics", error);
      }
    };
    fetchMetrics();
  }, []);

  const activeStats = [
    { title: "Processing", value: metrics.processing, color: "text-blue-500", bg: "bg-blue-50", icon: "🔄" },
    { title: "Dispatched", value: metrics.dispatched, color: "text-purple-500", bg: "bg-purple-50", icon: "✈️" },
    { title: "Collected", value: metrics.collected, color: "text-indigo-500", bg: "bg-indigo-50", icon: "📦" },
    { title: "Received at Dest", value: metrics.receivedDestination, color: "text-amber-500", bg: "bg-amber-50", icon: "📍" },
    { title: "Out for Delivery", value: metrics.outForDelivery, color: "text-emerald-500", bg: "bg-emerald-50", icon: "🚴" },
  ];

  const exceptionStats = [
    { title: "Rescheduled", value: metrics.rescheduled, color: "text-orange-500", bg: "bg-orange-50", icon: "🔁" },
    { title: "Failed to Deliver", value: metrics.failedToDeliver, color: "text-red-500", bg: "bg-red-50", icon: "❌" },
    { title: "Returned to Client", value: metrics.returnedToClient, color: "text-rose-600", bg: "bg-rose-50", icon: "👤" },
    { title: "Returned (Resched)", value: metrics.returnedBranchRescheduled, color: "text-amber-600", bg: "bg-amber-50", icon: "🏢" },
    { title: "Returned (Failed)", value: metrics.returnedBranchFailed, color: "text-red-600", bg: "bg-red-50", icon: "🚫" },
  ];

  return (
    <div className="space-y-6">

      {/* ===== PAGE TITLE ===== */}
      <h1 className="text-2xl font-semibold">Dashboard</h1>

      {/* ===== ACTIVE ORDERS ===== */}
      <div>
        <h2 className="text-lg font-semibold mb-4 text-gray-800">Active Deliveries</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {activeStats.map((item, i) => (
            <div
              key={i}
              className="group bg-white rounded-2xl shadow-sm p-5 flex flex-col justify-between border border-gray-100 hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:-translate-y-1 transition-all duration-300"
            >
              <div className="flex justify-between items-start mb-2">
                <div className={`w-10 h-10 flex items-center justify-center rounded-xl ${item.bg} ${item.color} text-xl group-hover:scale-110 transition-transform duration-300`}>
                  {item.icon}
                </div>
                <h2 className="text-2xl font-extrabold text-gray-800">{item.value}</h2>
              </div>
              <p className="text-sm font-medium text-gray-500 leading-tight group-hover:text-gray-700 transition-colors">{item.title}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ===== EXCEPTIONS ===== */}
      <div>
        <h2 className="text-lg font-semibold mb-4 text-gray-800">Exceptions & Returns</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {exceptionStats.map((item, i) => (
            <div
              key={i}
              className="group bg-white rounded-2xl shadow-sm p-5 flex flex-col justify-between border border-gray-100 hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:-translate-y-1 transition-all duration-300"
            >
              <div className="flex justify-between items-start mb-2">
                <div className={`w-10 h-10 flex items-center justify-center rounded-xl ${item.bg} ${item.color} text-xl group-hover:scale-110 transition-transform duration-300`}>
                  {item.icon}
                </div>
                <h2 className="text-2xl font-extrabold text-gray-800">{item.value}</h2>
              </div>
              <p className="text-sm font-medium text-gray-500 leading-tight group-hover:text-gray-700 transition-colors">{item.title}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ===== ORDERS SECTION ===== */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 relative overflow-hidden group">
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-red-50 rounded-full blur-3xl opacity-50 group-hover:opacity-70 transition-opacity"></div>
        <div className="flex justify-between items-center mb-6 relative z-10">
          <h3 className="font-bold text-gray-800 text-lg">Monthly Placed Orders</h3>
          <button className="text-sm font-medium text-red-500 hover:text-red-600 bg-red-50 px-4 py-1.5 rounded-full hover:bg-red-100 transition-colors">View Report</button>
        </div>

        {/* Beautiful Empty State Chart */}
        <div className="h-64 flex flex-col items-center justify-center border-2 border-dashed border-gray-100 rounded-2xl bg-gray-50/50 relative z-10">
          <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center text-3xl mb-3">📈</div>
          <h4 className="font-semibold text-gray-700">Data Visualization Coming Soon</h4>
          <p className="text-sm text-gray-500 max-w-sm text-center mt-1">We're building beautiful charts to help you track your monthly orders visually.</p>
        </div>
      </div>

      {/* ===== FINANCE + SUCCESS ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

        {/* FINANCE OVERVIEW */}
        <div className="lg:col-span-3 bg-white rounded-3xl shadow-sm border border-gray-100 p-6 relative overflow-hidden group">
          <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-blue-50 rounded-full blur-3xl opacity-50 group-hover:opacity-70 transition-opacity"></div>
          <h3 className="font-bold text-gray-800 text-lg mb-6 relative z-10">Finance Overview</h3>

          <div className="grid grid-cols-3 gap-4 mb-6 relative z-10">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-5 rounded-2xl border border-blue-100/50 hover:shadow-sm transition-shadow">
              <p className="text-sm font-medium text-blue-600/80 mb-1">Receivable COD</p>
              <h2 className="text-2xl font-extrabold text-blue-700">Rs. {metrics.receivableCOD.toLocaleString()}</h2>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-5 rounded-2xl border border-purple-100/50 hover:shadow-sm transition-shadow">
              <p className="text-sm font-medium text-purple-600/80 mb-1">Net Receivable</p>
              <h2 className="text-2xl font-extrabold text-purple-700">Rs. {metrics.netReceivable.toLocaleString()}</h2>
            </div>
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-5 rounded-2xl border border-emerald-100/50 hover:shadow-sm transition-shadow">
              <p className="text-sm font-medium text-emerald-600/80 mb-1">Total Received</p>
              <h2 className="text-2xl font-extrabold text-emerald-700">Rs. {metrics.totalReceived.toLocaleString()}</h2>
            </div>
          </div>

          {/* Beautiful Empty State Chart */}
          <div className="h-56 flex flex-col items-center justify-center border-2 border-dashed border-gray-100 rounded-2xl bg-gray-50/50 relative z-10">
            <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center text-3xl mb-3">💰</div>
            <h4 className="font-semibold text-gray-700">Financial Reports Coming Soon</h4>
            <p className="text-sm text-gray-500 max-w-sm text-center mt-1">Detailed revenue graphs and sales trends are under construction.</p>
          </div>
        </div>

        {/* SUCCESS RATE */}
        <div className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-gray-100 p-6 flex flex-col relative overflow-hidden group">
          <div className="absolute -right-10 -top-10 w-48 h-48 bg-emerald-50 rounded-full blur-3xl opacity-50 group-hover:opacity-70 transition-opacity"></div>
          <h3 className="font-bold text-gray-800 text-lg mb-6 relative z-10">Success Rate</h3>

          {/* Upgraded Donut Placeholder */}
          <div className="flex-1 flex flex-col items-center justify-center relative z-10">
            <div className="relative flex items-center justify-center">
              <div className="w-48 h-48 rounded-full border-[20px] border-emerald-100 border-t-emerald-500 shadow-inner"></div>
              <div className="absolute flex flex-col items-center">
                <span className="text-3xl font-extrabold text-gray-800">60%</span>
                <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest mt-1">Delivered</span>
              </div>
            </div>

            <div className="mt-8 flex gap-6 text-sm font-medium">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-sm"></div>
                <span className="text-gray-600">Delivered (60%)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-100 shadow-sm"></div>
                <span className="text-gray-600">Returned (40%)</span>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}

export default Dashboard;