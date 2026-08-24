import React, { useEffect, useState } from "react";
import {
  Users,
  Plus,
  Search,
  Edit2,
  Trash2,
  MapPin,
  CheckCircle,
  XCircle,
  Phone
} from "lucide-react";
import { toast } from "react-hot-toast";

import { getCurrentUser } from "../../utils/auth";
import { branchService } from "../../services/branchService";
import type { Branch } from "../../types/branch";
import {
  getRiders,
  createRider,
  updateRider,
  deleteRider,
} from "../../services/riderService";
import type { Rider } from "../../services/riderService";

const Riders: React.FC = () => {
  const user = getCurrentUser();
  const isAdmin = user?.role === "Admin" || user?.role === "Owner";
  
  const [riders, setRiders] = useState<Rider[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBranch, setSelectedBranch] = useState<string>("All");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentRiderId, setCurrentRiderId] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    password: "",
    branchId: user?.branchId ? Number(user.branchId) : 0,
    isActive: true,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [ridersData, branchesData] = await Promise.all([
        getRiders(),
        branchService.getBranches(),
      ]);
      setRiders(ridersData);
      
      if (isAdmin) {
        setBranches(branchesData);
      } else if (user?.branchId) {
        setBranches(branchesData.filter(b => b.id === Number(user.branchId)));
        setFormData(prev => ({ ...prev, branchId: Number(user.branchId) }));
      }
    } catch (error) {
      toast.error("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  const filteredRiders = riders.filter((rider) => {
    const matchesSearch =
      rider.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rider.riderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rider.phone.includes(searchTerm);
    const matchesBranch =
      selectedBranch === "All" || rider.branchId === Number(selectedBranch);
    return matchesSearch && matchesBranch;
  });

  // Group by branch for Admin
  const groupedRiders = filteredRiders.reduce((acc, rider) => {
    if (!acc[rider.branchName]) {
      acc[rider.branchName] = [];
    }
    acc[rider.branchName].push(rider);
    return acc;
  }, {} as Record<string, Rider[]>);

  const handleOpenModal = (rider?: Rider) => {
    if (rider) {
      setIsEditMode(true);
      setCurrentRiderId(rider.id);
      setFormData({
        name: rider.name,
        phone: rider.phone,
        email: rider.email,
        password: "", // Password is blank initially when editing
        branchId: rider.branchId,
        isActive: rider.isActive,
      });
    } else {
      setIsEditMode(false);
      setCurrentRiderId(null);
      setFormData({
        name: "",
        phone: "",
        email: "",
        password: "",
        branchId: isAdmin ? 0 : (user?.branchId ? Number(user.branchId) : 0),
        isActive: true,
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.email || formData.branchId === 0 || (!isEditMode && !formData.password)) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      if (isEditMode && currentRiderId) {
        await updateRider(currentRiderId, formData);
        toast.success("Rider updated successfully");
      } else {
        await createRider(formData);
        toast.success("Rider created successfully");
      }
      handleCloseModal();
      fetchData();
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || (typeof error.response?.data === 'string' ? error.response.data : "Operation failed");
      toast.error(errorMsg);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this rider?")) return;
    try {
      await deleteRider(id);
      toast.success("Rider deleted");
      fetchData();
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || (typeof error.response?.data === 'string' ? error.response.data : "Delete failed");
      toast.error(errorMsg);
    }
  };

  const renderRiderCard = (rider: Rider) => (
    <div key={rider.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow duration-300 relative group">
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2.5 py-0.5 rounded">
              {rider.riderId}
            </span>
            {rider.isActive ? (
              <span className="flex items-center text-xs text-green-600 font-medium">
                <CheckCircle className="w-3 h-3 mr-1" /> Active
              </span>
            ) : (
              <span className="flex items-center text-xs text-red-600 font-medium">
                <XCircle className="w-3 h-3 mr-1" /> Inactive
              </span>
            )}
          </div>
          <h3 className="text-lg font-semibold text-gray-800">{rider.name}</h3>
        </div>
        <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => handleOpenModal(rider)}
            className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <Edit2 size={16} />
          </button>
          <button
            onClick={() => handleDelete(rider.id)}
            className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
      <div className="space-y-2 text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <Phone className="w-4 h-4 text-gray-400" />
          <span>{rider.phone}</span>
        </div>
        {isAdmin && (
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-gray-400" />
            <span>{rider.branchName}</span>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="text-blue-600" />
            Delivery Riders
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Manage your delivery fleet and assign branch locations.
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm font-medium"
        >
          <Plus size={18} />
          Add Rider
        </button>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-8 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by name, ID, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>
        {isAdmin && (
          <select
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(e.target.value)}
            className="w-full sm:w-64 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
          >
            <option value="All">All Branches</option>
            {branches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : filteredRiders.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-100 border-dashed">
          <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">No riders found</h3>
          <p className="text-gray-500">Get started by adding a new delivery rider.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {isAdmin ? (
            Object.entries(groupedRiders).map(([branchName, branchRiders]) => (
              <div key={branchName}>
                <h2 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2 flex items-center gap-2">
                  <MapPin className="text-blue-500 w-5 h-5" />
                  {branchName} ({branchRiders.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {branchRiders.map(renderRiderCard)}
                </div>
              </div>
            ))
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredRiders.map(renderRiderCard)}
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="text-lg font-semibold text-gray-900">
                {isEditMode ? "Edit Rider" : "Add New Rider"}
              </h3>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <XCircle size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    placeholder="07X XXX XXXX"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    placeholder="rider@smartexpress.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password {isEditMode ? "(Leave blank to keep current)" : "*"}
                  </label>
                  <input
                    type="password"
                    required={!isEditMode}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    placeholder="••••••••"
                  />
                </div>
                
                {isAdmin && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Branch *
                    </label>
                    <select
                      required
                      value={formData.branchId}
                      onChange={(e) => setFormData({ ...formData, branchId: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                    >
                      <option value={0} disabled>Select Branch</option>
                      {branches.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {isEditMode && (
                  <div className="flex items-center mt-4">
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                    />
                    <label htmlFor="isActive" className="ml-2 text-sm text-gray-700 font-medium">
                      Active Rider
                    </label>
                  </div>
                )}
              </div>
              
              <div className="mt-8 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                >
                  {isEditMode ? "Save Changes" : "Create Rider"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Riders;
