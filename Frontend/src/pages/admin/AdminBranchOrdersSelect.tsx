import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { branchService } from "../../services/branchService";
import type { Branch } from "../../types/branch";
import { getCurrentUser } from "../../utils/auth";
import SearchableSelect from "../../components/SearchableSelect";
import { Box } from "lucide-react";

const AdminBranchOrdersSelect: React.FC = () => {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedBranchId, setSelectedBranchId] = useState<string | number>("");
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();
  const location = useLocation();

  const user = getCurrentUser();
  const isAdmin = user?.role === "Admin" || user?.role === "Owner";
  
  // Get redirect tab if available in URL query
  const queryParams = new URLSearchParams(location.search);
  const redirectTab = queryParams.get("redirectTo") || "all";

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        setLoading(true);
        const data = await branchService.getBranches();
        setBranches(data);
      } catch (err) {
        console.error("Failed to load branches:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBranches();
  }, []);

  const branchOptions = branches.map((b) => ({
    label: b.name,
    value: b.id,
  }));

  const handleClear = () => {
    setSelectedBranchId("");
  };

  const handleNext = () => {
    if (selectedBranchId) {
      navigate(`/admin/branch-orders/${selectedBranchId}?tab=${redirectTab}`);
    }
  };

  if (!isAdmin) {
    return <div className="p-8 text-red-500">Access Denied</div>;
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto p-8">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2 mb-2">
          <Box className="text-indigo-600 w-7 h-7" />
          Branch Orders - Select Context
        </h1>
        <p className="text-slate-500">Please select a branch to view its orders and operational queues.</p>
      </div>

      {/* Select Card */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-end gap-4">
        <div className="flex-1 md:max-w-md">
          <SearchableSelect
            label="Target Branch"
            options={branchOptions}
            value={selectedBranchId}
            onChange={(val) => setSelectedBranchId(val)}
            placeholder="Select branch..."
            loading={loading}
          />
        </div>
        <div className="flex items-center gap-3 mt-4 md:mt-0">
          <button
            onClick={handleClear}
            className="px-6 py-3.5 bg-slate-100 text-slate-700 font-medium rounded-xl hover:bg-slate-200 transition-colors text-sm"
          >
            Clear
          </button>
          <button
            onClick={handleNext}
            disabled={!selectedBranchId}
            className={`px-10 py-3.5 font-bold rounded-xl transition-all text-sm shadow-sm ${
              selectedBranchId
                ? "bg-indigo-600 hover:bg-indigo-700 text-white"
                : "bg-indigo-300 text-white cursor-not-allowed"
            }`}
          >
            Access Queues
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminBranchOrdersSelect;
