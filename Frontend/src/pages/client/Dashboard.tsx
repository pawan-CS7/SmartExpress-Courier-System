import { useEffect, useState } from "react";
import { getClientDashboard } from "../../services/dashboardService";
import {
  Truck,
  Package,
  CheckCircle,
  XCircle,
  RotateCcw,
} from "lucide-react";

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

const stats = [
  { title: "Processing", value: metrics.processing, color: "text-blue-500", icon: "🔄" },
  { title: "Dispatched to Destination", value: metrics.dispatched, color: "text-purple-500", icon: "✈️" },
  { title: "Collected from Warehouse", value: metrics.collected, color: "text-green-500", icon: "📦" },
  { title: "Received at Destination", value: metrics.receivedDestination, color: "text-yellow-500", icon: "📍" },
  { title: "Out for Delivery", value: metrics.outForDelivery, color: "text-emerald-500", icon: "🚴" },

  { title: "Rescheduled", value: metrics.rescheduled, color: "text-blue-400", icon: "🔁" },
  { title: "Failed to Deliver", value: metrics.failedToDeliver, color: "text-red-500", icon: "❌" },
  { title: "Returned to Client", value: metrics.returnedToClient, color: "text-orange-500", icon: "👤" },
  { title: "Returned to Branch Rescheduled", value: metrics.returnedBranchRescheduled, color: "text-amber-600", icon: "🏢" },
  { title: "Returned to Branch Failed", value: metrics.returnedBranchFailed, color: "text-red-600", icon: "🚫" },
];

  return (
    <div className="space-y-6">

      {/* ===== PAGE TITLE ===== */}
      <h1 className="text-2xl font-semibold">Dashboard</h1>

      {/* ===== TOP STATS ===== */}
      <div className="grid grid-cols-5 gap-4">
        {stats.map((item, i) => (
          <div
            key={i}
            className="bg-white rounded-xl shadow-sm p-4 flex justify-between items-center hover:shadow-md transition"
          >
            <div>
              <p className="text-sm text-gray-500">{item.title}</p>
              <h2 className="text-xl font-bold">{item.value}</h2>
            </div>

            <div className={`text-2xl ${item.color}`}>
              {item.icon}
            </div>
          </div>
        ))}
      </div>

      {/* ===== ORDERS SECTION ===== */}
      <div className="bg-white rounded-xl shadow-sm p-5">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold">Monthly Placed Orders</h3>
          <button className="text-sm text-blue-500">View More</button>
        </div>

        {/* Placeholder Chart */}
        <div className="h-64 flex items-center justify-center text-gray-400 border rounded-lg">
          📈 Orders Chart (Recharts can be added)
        </div>
      </div>

      {/* ===== FINANCE + SUCCESS ===== */}
   <div className="grid grid-cols-5 gap-4">

        {/* FINANCE OVERVIEW */}
        <div className="col-span-2 bg-white rounded-xl shadow-sm p-5">
          <h3 className="font-semibold mb-4">Finance Overview</h3>

          <div className="grid grid-cols-3 gap-4 mb-4">

            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-500">Receivable COD</p>
              <h2 className="text-lg font-bold text-blue-500">Rs. {metrics.receivableCOD.toLocaleString()}</h2>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-500">Net Receivable</p>
              <h2 className="text-lg font-bold text-red-500">Rs. {metrics.netReceivable.toLocaleString()}</h2>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-500">Total Received</p>
              <h2 className="text-lg font-bold text-green-500">Rs. {metrics.totalReceived.toLocaleString()}</h2>
            </div>

          </div>

          {/* Placeholder Chart */}
          <div className="h-64 flex items-center justify-center text-gray-400 border rounded-lg">
            📊 Sales Chart
          </div>
        </div>

        {/* SUCCESS RATE */}
        <div className="bg-white rounded-xl shadow-sm p-5">
          <h3 className="font-semibold mb-4">Success Rate</h3>

          {/* Fake Donut */}
          <div className="flex flex-col items-center justify-center h-64">
            <div className="w-40 h-40 rounded-full border-[16px] border-green-500 border-t-blue-500"></div>

            <div className="mt-4 text-sm text-gray-500 text-center">
              Delivered: 60% <br />
              Returned: 40%
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}

export default Dashboard;