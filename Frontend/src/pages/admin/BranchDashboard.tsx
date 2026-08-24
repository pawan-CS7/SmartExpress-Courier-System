import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { branchService } from "../../services/branchService";
import type { Branch } from "../../types/branch";
import {
  ChevronLeft,
  RefreshCw,
  Box,
  Inbox,
  Truck,
  CheckCircle,
  PackageCheck,
  PackageX,
  CornerUpLeft,
  Calendar,
  XOctagon,
  Activity
} from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, icon: Icon, color }) => {
  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
      <div className="flex items-start gap-4">
        <div className={`p-3 rounded-full border-2 ${color} bg-white flex items-center justify-center`}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <div className={`text-2xl font-bold ${color.split(" ")[0].replace("border-", "text-")}`}>
            {value}
          </div>
          <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mt-1 w-32 leading-tight">
            {title}
          </div>
        </div>
      </div>
      <div className="text-gray-200">
        <Activity className="w-12 h-12 opacity-50" />
      </div>
    </div>
  );
};

const BranchDashboard: React.FC = () => {
  const { branchId } = useParams<{ branchId: string }>();
  const navigate = useNavigate();
  const [branch, setBranch] = useState<Branch | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchBranch = async () => {
      try {
        setLoading(true);
        if (branchId) {
          const data = await branchService.getBranchById(Number(branchId));
          setBranch(data);
        }
      } catch (err) {
        console.error("Failed to load branch details:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBranch();
  }, [branchId]);

  const handleBack = () => {
    navigate("/admin/branch-dashboard-select");
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  const metrics = [
    { title: "DISPATCHED TO DESTINATION BRANCH", value: "14", icon: Box, color: "border-blue-600 text-blue-600" },
    { title: "RECEIVED AT DESTINATION BRANCH", value: "277", icon: Inbox, color: "border-yellow-500 text-yellow-500" },
    { title: "OUT FOR DELIVERY", value: "4", icon: Truck, color: "border-gray-500 text-gray-500" },
    { title: "DELIVERED", value: "222,619", icon: CheckCircle, color: "border-green-600 text-green-600" },
    { title: "PARTIALLY DELIVERED", value: "1,018", icon: PackageCheck, color: "border-teal-600 text-teal-600" },
    { title: "FAILED TO DELIVER", value: "1", icon: PackageX, color: "border-red-700 text-red-700" },
    { title: "RETURNED TO HO", value: "4", icon: CornerUpLeft, color: "border-orange-600 text-orange-600" },
    { title: "RE-DELIVERY", value: "31", icon: Truck, color: "border-red-600 text-red-600" },
    { title: "RETURNED TO BRANCH RESCHEDULED", value: "188", icon: Calendar, color: "border-yellow-600 text-yellow-600" },
    { title: "RETURNED TO BRANCH FAILED", value: "316", icon: XOctagon, color: "border-red-600 text-red-600" },
  ];

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading dashboard...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button 
            onClick={handleBack}
            className="p-1 hover:bg-gray-100 rounded-lg transition"
          >
            <ChevronLeft className="w-6 h-6 text-gray-700" />
          </button>
          <h1 className="text-xl font-bold text-gray-900">
            {branch ? `${branch.name} Dashboard` : "Branch Dashboard"}
          </h1>
        </div>
        
        <div className="flex items-center gap-4">
          <span className="text-xs text-gray-500 font-medium">Last updated: Just now</span>
          <button 
            onClick={handleRefresh}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {metrics.map((metric, idx) => (
          <MetricCard 
            key={idx}
            title={metric.title}
            value={metric.value}
            icon={metric.icon}
            color={metric.color}
          />
        ))}
      </div>

      {/* Branch Operations Section */}
      <div className="mt-8 bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
            <PackageCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Branch Operations</h3>
            <p className="text-sm text-gray-500">Manage daily tasks, requests, and dispatch operations for this branch.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Waybill Management Action */}
          <button 
            onClick={() => navigate(`/admin/waybill-management?branchId=${branchId}`)}
            className="flex flex-col items-start p-5 bg-gradient-to-br from-indigo-50 to-white border border-indigo-100 rounded-xl hover:shadow-md hover:border-indigo-300 transition-all group text-left"
          >
            <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Box className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-gray-900 mb-1">Manage Waybills</h4>
            <p className="text-xs text-gray-500 line-clamp-2">Review client waybill requests and generate new barcode sequences for dispatch.</p>
          </button>

          {/* Branch Orders Action */}
          <button 
            onClick={() => navigate(`/admin/orders?branchId=${branchId}`)}
            className="flex flex-col items-start p-5 bg-gradient-to-br from-indigo-50 to-white border border-indigo-100 rounded-xl hover:shadow-md hover:border-indigo-300 transition-all group text-left"
          >
            <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Truck className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-gray-900 mb-1">Branch Orders</h4>
            <p className="text-xs text-gray-500 line-clamp-2">View and manage all courier orders exclusively assigned to this branch.</p>
          </button>

          {/* Placeholders for future operations */}
          <button 
            className="flex flex-col items-start p-5 bg-gradient-to-br from-gray-50 to-white border border-gray-100 rounded-xl opacity-60 cursor-not-allowed text-left"
          >
            <div className="w-10 h-10 bg-gray-200 text-gray-500 rounded-full flex items-center justify-center mb-4">
              <Truck className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-gray-900 mb-1">Assign Riders</h4>
            <p className="text-xs text-gray-500">Assign delivery routes and pickups to available branch riders (Coming Soon).</p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default BranchDashboard;
