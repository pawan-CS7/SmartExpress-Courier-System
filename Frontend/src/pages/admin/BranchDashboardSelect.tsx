import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { branchService } from "../../services/branchService";
import type { Branch } from "../../types/branch";
import { getCurrentUser } from "../../utils/auth";
import SearchableSelect from "../../components/SearchableSelect";
import { Settings } from "lucide-react";

const BranchDashboardSelect: React.FC = () => {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedBranchId, setSelectedBranchId] = useState<string | number>("");
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  const user = getCurrentUser();
  const isAdmin = user?.role === "Admin";
  const branchManagerId = user?.branchId; // Assuming BranchManager has a branchId in token

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

  // Filter branches based on user role
  const availableBranches = useMemo(() => {
    if (isAdmin) {
      return branches;
    }
    // Branch Manager only sees their assigned branch
    if (branchManagerId) {
      return branches.filter((b) => String(b.id) === String(branchManagerId));
    }
    return [];
  }, [branches, isAdmin, branchManagerId]);

  const branchOptions = availableBranches.map((b) => ({
    label: b.name,
    value: b.id,
  }));

  const handleClear = () => {
    setSelectedBranchId("");
  };

  const handleNext = () => {
    if (selectedBranchId) {
      navigate(`/admin/branch-dashboard/${selectedBranchId}`);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
        <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <Settings className="text-orange-500 w-6 h-6" />
          Pre Select
        </h1>
      </div>

      {/* Select Card */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-end gap-4">
        <div className="flex-1 md:max-w-md">
          <SearchableSelect
            label="Branch Name"
            options={branchOptions}
            value={selectedBranchId}
            onChange={(val) => setSelectedBranchId(val)}
            placeholder="Select branch"
            loading={loading}
          />
        </div>
        <div className="flex items-center gap-3 mt-4 md:mt-0">
          <button
            onClick={handleClear}
            className="px-6 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors text-sm"
          >
            Clear
          </button>
          <button
            onClick={handleNext}
            disabled={!selectedBranchId}
            className={`px-8 py-2.5 font-medium rounded-xl transition-all text-sm shadow-sm ${
              selectedBranchId
                ? "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white"
                : "bg-red-300 text-white cursor-not-allowed"
            }`}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default BranchDashboardSelect;
