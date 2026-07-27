import { Link } from "react-router-dom";

import DashboardCard from "../../components/ui/DashboardCard";

function Dashboard() {

  return (

    <div className="space-y-6">

      {/* 🔴 TOP BANNER */}
      <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white p-6 rounded-2xl shadow-sm flex justify-between items-center">

        <div>

          <h2 className="text-lg opacity-90">
            Welcome Back 👋
          </h2>

          <h1 className="text-4xl font-bold mt-2">
            Admin Dashboard
          </h1>

          <p className="mt-2 text-sm opacity-80">
            Manage courier operations efficiently
          </p>

        </div>

        <img
          src="/Delivery.png"
          alt="delivery"
          className="w-40 hidden md:block"
        />

      </div>

      {/* 📊 STATISTICS */}
      <div>

        <h2 className="text-lg font-semibold mb-4">
          Overview
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">

          <DashboardCard
            title="Total Orders"
            value={1250}
            icon="📦"
          />

          <DashboardCard
            title="Delivered"
            value={980}
            icon="✅"
          />

          <DashboardCard
            title="Pending"
            value={120}
            icon="🚚"
          />

          <DashboardCard
            title="Revenue"
            value="Rs. 450K"
            icon="💰"
          />

        </div>

      </div>

      {/* ⚡ QUICK ACCESS */}
      <div>

        <h2 className="text-lg font-semibold mb-4">
          Quick Access
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

          {/* Orders */}
          <Link
            to="/admin/orders"
            className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition"
          >

            <div className="flex items-center gap-4">

              <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white p-4 rounded-full text-xl">
                📦
              </div>

              <div>

                <h3 className="font-semibold text-gray-800">
                  Manage Orders
                </h3>

                <p className="text-sm text-gray-500 mt-1">
                  View and manage all courier orders
                </p>

              </div>

            </div>

          </Link>

          {/* Reports */}
          <Link
            to="/admin/reports"
            className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition"
          >

            <div className="flex items-center gap-4">

              <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white p-4 rounded-full text-xl">
                📊
              </div>

              <div>

                <h3 className="font-semibold text-gray-800">
                  Reports
                </h3>

                <p className="text-sm text-gray-500 mt-1">
                  Analyze operational performance
                </p>

              </div>

            </div>

          </Link>

          {/* Users */}
          <Link
            to="/admin/users"
            className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition"
          >

            <div className="flex items-center gap-4">

              <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white p-4 rounded-full text-xl">
                👥
              </div>

              <div>

                <h3 className="font-semibold text-gray-800">
                  Users
                </h3>

                <p className="text-sm text-gray-500 mt-1">
                  Manage clients and staff accounts
                </p>

              </div>

            </div>

          </Link>

        </div>

      </div>

    </div>
  );
}

export default Dashboard;