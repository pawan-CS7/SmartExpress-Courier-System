import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import api from "../../../services/api";
import { branchService } from "../../../services/branchService";
import type { Branch } from "../../../types/branch";
import { getCurrentUser } from "../../../utils/auth";
import { SearchableSelect } from "../../../components/SearchableSelect";

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  branchId: number | null;
  isActive: boolean;
}

function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<"all" | "byBranch">("all");
  const [filterBranchId, setFilterBranchId] = useState<number | "">("");

  const location = useLocation();
  const [highlightId, setHighlightId] = useState<number | null>(null);

  const currentUser = getCurrentUser();
  const isAdmin = currentUser?.role === "Admin";

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const hId = queryParams.get("highlightId");
    if (hId) {
        const id = Number(hId);
        setHighlightId(id);
        setTimeout(() => {
            const element = document.getElementById(`user-row-${id}`);
            if (element) {
                element.scrollIntoView({ behavior: "smooth", block: "center" });
            }
        }, 500);
        setTimeout(() => {
            setHighlightId(null);
        }, 3500);
    }
  }, [location.search, users]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [usersRes, branchesRes] = await Promise.all([
          api.get("/api/users"),
          branchService.getBranches()
        ]);
        setUsers(usersRes.data);
        setBranches(branchesRes);
      } catch (err) {
        console.error("Failed to fetch data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const changeBranch = async (userId: number, newBranchId: number | "") => {
    if (!isAdmin) return;
    try {
      await api.put(`/api/users/update-branch/${userId}`, { branchId: newBranchId === "" ? null : newBranchId });
      setUsers(users.map((u) => (u.id === userId ? { ...u, branchId: newBranchId === "" ? null : newBranchId as number } : u)));
    } catch (err) {
      console.error("Failed to update branch", err);
      alert("Failed to update user branch. Please try again.");
    }
  };

  const toggleStatus = async (userId: number, currentStatus: boolean) => {
    if (!isAdmin) return; // Normally only Admins can toggle status, but depending on reqs BranchManager might too. Let's restrict to Admin for safety unless requested.
    try {
      await api.put(`/api/users/update-role/${userId}`, { isActive: !currentStatus });
      setUsers(users.map((u) => (u.id === userId ? { ...u, isActive: !currentStatus } : u)));
    } catch (err) {
      console.error("Failed to toggle status", err);
      alert("Failed to update user status. Please try again.");
    }
  };

  const filteredUsers = users.filter((u) => {
    // Only show Client users in this view
    if (u.role !== "Client") return false;
    
    if (activeTab === "all") return true;
    if (activeTab === "byBranch") {
        if (filterBranchId === "") return true;
        return u.branchId === filterBranchId;
    }
    return true;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-red-500"></div>
        <span className="ml-3 text-gray-600 font-medium">Loading Data...</span>
      </div>
    );
  }

  const branchOptions = [
    { value: "", label: "No Branch / Unassigned" },
    ...branches.map(b => ({ value: b.id, label: b.name }))
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          {isAdmin ? "Users Management" : "Branch Clients"}
        </h1>
        <p className="text-sm text-gray-500">
          {isAdmin ? "Manage user assignments and account statuses" : "View clients registered under your branch"}
        </p>
      </div>

      {isAdmin && (
        <div className="flex gap-4 mb-6 border-b border-gray-200">
          <button
            onClick={() => setActiveTab("all")}
            className={`pb-3 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === "all" ? "border-red-500 text-red-600" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            All Users
          </button>
          <button
            onClick={() => setActiveTab("byBranch")}
            className={`pb-3 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === "byBranch" ? "border-red-500 text-red-600" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            By Branch
          </button>
        </div>
      )}

      {isAdmin && activeTab === "byBranch" && (
        <div className="mb-6 max-w-xs">
          <SearchableSelect
            label="Filter by Branch"
            placeholder="Select branch to view"
            options={branchOptions}
            value={filterBranchId}
            onChange={(val) => setFilterBranchId(val as number | "")}
          />
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-xs font-bold uppercase text-gray-500">
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Branch</th>
                <th className="px-6 py-4 text-center">System Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm text-gray-600">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-400 font-medium">
                    No users found matching the selected criteria.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr 
                    id={`user-row-${user.id}`}
                    key={user.id} 
                    className={`border-b border-gray-100 transition-colors duration-700 ${highlightId === user.id ? 'bg-amber-100' : 'hover:bg-gray-50/50'}`}
                  >
                    <td className="px-6 py-4 font-medium text-gray-800">{user.name}</td>
                    <td className="px-6 py-4">{user.email}</td>
                    <td className="px-6 py-4">{user.role}</td>
                    <td className="px-6 py-4">
                      {isAdmin ? (
                        <select
                          value={user.branchId || ""}
                          onChange={(e) => changeBranch(user.id, e.target.value === "" ? "" : Number(e.target.value))}
                          className="border border-gray-200 rounded-lg p-2 text-sm focus:ring-2 focus:ring-red-400 outline-none bg-white cursor-pointer w-full max-w-[200px]"
                        >
                          {branchOptions.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                      ) : (
                        <span className="font-medium text-gray-700">
                          {branches.find(b => b.id === user.branchId)?.name || "Unassigned"}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => toggleStatus(user.id, user.isActive)}
                        disabled={!isAdmin}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                          user.isActive
                            ? "bg-green-50 text-green-700 hover:bg-green-100"
                            : "bg-red-50 text-red-700 hover:bg-red-100"
                        } ${!isAdmin && "opacity-80 cursor-default"}`}
                      >
                        {user.isActive ? "Active (Suspend)" : "Suspended (Activate)"}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Users;