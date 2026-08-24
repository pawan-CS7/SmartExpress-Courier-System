import React, { useEffect, useState } from "react";
import { getUsers, registerUser, updateStaff, deleteStaff } from "../../services/userService";
import { branchService } from "../../services/branchService";
import type { Branch } from "../../types/branch";
import { 
  Users, 
  Plus, 
  Search,
  Building2,
  Mail,
  Phone,
  RefreshCw,
  CheckCircle2,
  Edit,
  Trash2
} from "lucide-react";

const BranchManagers: React.FC = () => {
  const [managers, setManagers] = useState<any[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    nic: "",
    address: "",
    password: "",
    role: "BranchManager",
    branchId: "" as number | string
  });

  const fetchData = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const [usersData, branchData] = await Promise.all([
        getUsers(),
        branchService.getBranches()
      ]);
      const branchManagers = usersData.filter((u: any) => 
        u.role === "BranchManager" || u.role === "SortingCenterManager"
      );
      setManagers(branchManagers);
      setBranches(branchData);
    } catch (err) {
      console.error("Failed to load branch managers:", err);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenAddModal = () => {
    setEditingId(null);
    setFormData({
      name: "",
      email: "",
      phone: "",
      nic: "",
      address: "",
      password: "",
      role: "BranchManager",
      branchId: ""
    });
    setErrorMessage(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (manager: any) => {
    setEditingId(manager.id);
    setFormData({
      name: manager.name || "",
      email: manager.email || "",
      phone: manager.phone || "",
      nic: manager.nic || "",
      address: manager.address || "",
      password: "", // Usually password is not updated here, or ignored by backend
      role: manager.role || "BranchManager",
      branchId: manager.branchId || ""
    });
    setErrorMessage(null);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to permanently delete this manager?")) return;
    try {
      await deleteStaff(id);
      setSuccessMessage("Branch Manager permanently deleted.");
      fetchData(false);
    } catch (err: any) {
      console.error("Failed to delete manager:", err);
      setErrorMessage(err.response?.data?.message || "Failed to delete manager.");
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setErrorMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMessage(null);

    try {
      if (editingId) {
        await updateStaff(editingId, {
          ...formData,
          mobileNo: formData.phone,
          isActive: true,
          branchId: formData.branchId ? Number(formData.branchId) : null
        });
        setSuccessMessage("Branch Manager updated successfully.");
      } else {
        await registerUser({
          ...formData,
          branchId: formData.branchId ? Number(formData.branchId) : null
        });
        setSuccessMessage("Branch Manager registered successfully.");
      }
      handleCloseModal();
      fetchData(false);
    } catch (err: any) {
      console.error("Failed to save branch manager:", err);
      const msg = err.response?.data?.message || err.response?.data || err.message || "Operation failed.";
      setErrorMessage(msg);
    } finally {
      setSaving(false);
    }
  };

  const regularManagers = managers.filter(m => 
    m.role === "BranchManager" && (m.name.toLowerCase().includes(searchTerm.toLowerCase()) || m.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const sortingManagers = managers.filter(m => 
    m.role === "SortingCenterManager" && (m.name.toLowerCase().includes(searchTerm.toLowerCase()) || m.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="text-red-500 w-6 h-6" />
            Branch Managers
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Assign and manage staff for regional warehouses.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-4 py-2.5 rounded-xl font-medium text-sm flex items-center gap-2 shadow-md shadow-red-200 transition"
        >
          <Plus className="w-4 h-4" /> Add Manager
        </button>
      </div>

      {successMessage && (
        <div className="p-4 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-2xl text-xs font-semibold flex items-center justify-between">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" /> {successMessage}
          </span>
          <button onClick={() => setSuccessMessage(null)} className="text-emerald-600 hover:text-emerald-900">
            ✕
          </button>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden min-h-[400px]">
        <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            <input 
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:outline-none"
            />
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-gray-500">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-red-500 mb-2" />
            <p className="text-sm font-medium">Loading managers...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            {/* Branch Managers Table */}
            {regularManagers.length > 0 && (
              <>
                <div className="bg-gray-50 px-6 py-3 border-b border-gray-100 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-gray-500" />
                  <h3 className="text-sm font-bold text-gray-700">Branch Managers</h3>
                </div>
                <table className="w-full text-left text-sm mb-6">
                  <thead className="bg-gray-50/50 text-gray-500 font-semibold border-b border-gray-100 text-xs uppercase tracking-wider">
                    <tr>
                      <th className="px-6 py-4">Manager Name</th>
                      <th className="px-6 py-4">Contact Info</th>
                      <th className="px-6 py-4">Assigned Branch</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {regularManagers.map((m) => (
                      <tr key={m.id} className="hover:bg-gray-50 transition">
                        <td className="px-6 py-4 font-bold text-gray-900">{m.name}</td>
                        <td className="px-6 py-4 space-y-1">
                          <div className="flex items-center gap-2 text-gray-600 text-xs">
                            <Mail className="w-3.5 h-3.5" /> {m.email}
                          </div>
                          <div className="flex items-center gap-2 text-gray-600 text-xs">
                            <Phone className="w-3.5 h-3.5" /> {m.phone}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-700 rounded-full text-xs font-semibold">
                            <Building2 className="w-3.5 h-3.5" /> 
                            {branches.find(b => b.id === m.branchId)?.name || 'N/A'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {m.isActive ? (
                            <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-bold">Active</span>
                          ) : (
                            <span className="px-2.5 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs font-bold">Inactive</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleOpenEditModal(m)}
                              className="p-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                              title="Edit Manager"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(m.id)}
                              className="p-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                              title="Delete Manager"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}

            {/* Sorting Center Managers Table */}
            {sortingManagers.length > 0 && (
              <>
                <div className="bg-blue-50 px-6 py-3 border-y border-blue-100 flex items-center gap-2 mt-4">
                  <RefreshCw className="w-4 h-4 text-blue-600" />
                  <h3 className="text-sm font-bold text-blue-800">Sorting Center Managers (Warehouse)</h3>
                </div>
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50/50 text-gray-500 font-semibold border-b border-gray-100 text-xs uppercase tracking-wider">
                    <tr>
                      <th className="px-6 py-4">Manager Name</th>
                      <th className="px-6 py-4">Contact Info</th>
                      <th className="px-6 py-4">Assigned Center</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {sortingManagers.map((m) => (
                      <tr key={m.id} className="hover:bg-gray-50 transition">
                        <td className="px-6 py-4 font-bold text-gray-900">{m.name}</td>
                        <td className="px-6 py-4 space-y-1">
                          <div className="flex items-center gap-2 text-gray-600 text-xs">
                            <Mail className="w-3.5 h-3.5" /> {m.email}
                          </div>
                          <div className="flex items-center gap-2 text-gray-600 text-xs">
                            <Phone className="w-3.5 h-3.5" /> {m.phone}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-semibold">
                            <Building2 className="w-3.5 h-3.5" /> 
                            {branches.find(b => b.id === m.branchId)?.name || 'N/A'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {m.isActive ? (
                            <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-bold">Active</span>
                          ) : (
                            <span className="px-2.5 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs font-bold">Inactive</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleOpenEditModal(m)}
                              className="p-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                              title="Edit Manager"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(m.id)}
                              className="p-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                              title="Delete Manager"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-100 flex flex-col">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-slate-50/70">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Users className="text-red-500 w-5 h-5" />
                {editingId ? "Edit Branch Manager" : "Register Branch Manager"}
              </h2>
              <button
                type="button"
                onClick={handleCloseModal}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-800 transition flex items-center justify-center font-bold text-sm"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {errorMessage && (
                <div className="p-3 bg-red-50 text-red-700 rounded-xl text-xs font-semibold border border-red-200">
                  ⚠️ {errorMessage}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Email *</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Phone *</label>
                    <input
                      type="text"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Password {editingId ? "(Leave blank to keep)" : "*"}</label>
                    <input
                      type="password"
                      required={!editingId}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">NIC *</label>
                    <input
                      type="text"
                      required
                      value={formData.nic}
                      onChange={(e) => setFormData({ ...formData, nic: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Address *</label>
                  <input
                    type="text"
                    required
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Role *</label>
                    <select
                      required
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:outline-none"
                    >
                      <option value="BranchManager">Branch Manager</option>
                      <option value="SortingCenterManager">Sorting Center Manager</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Assign to Branch/Center *</label>
                    <select
                      required
                      value={formData.branchId}
                      onChange={(e) => setFormData({ ...formData, branchId: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:outline-none"
                    >
                      <option value="" disabled>Select Location</option>
                      {branches.map(b => (
                        <option key={b.id} value={b.id}>{b.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 bg-gray-100 text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl text-sm font-bold shadow-md shadow-red-200 disabled:opacity-50 flex items-center gap-2"
                >
                  {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : null}
                  {editingId ? "Update Manager" : "Register Manager"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BranchManagers;
