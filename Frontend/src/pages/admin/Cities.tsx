import React, { useEffect, useState } from "react";
import { cityService } from "../../services/cityService";
import type { City, CreateCityRequest, UpdateCityRequest } from "../../types/city";
import { SriLankaLocations } from "../../utils/sriLankaLocations";
import SearchableSelect from "../../components/SearchableSelect";
import { Plus, Search, Edit2, Trash2, MapPin, Building2, CheckCircle2, XCircle, RefreshCw, Compass } from "lucide-react";

const Cities: React.FC = () => {
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filterActive, setFilterActive] = useState<string>("all");
  const [filterProvince, setFilterProvince] = useState<string>("all");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingCity, setEditingCity] = useState<City | null>(null);

  const [formData, setFormData] = useState<CreateCityRequest>({
    name: "",
    province: "",
    district: "",
    postalCode: "",
    isActive: true,
  });

  const [saving, setSaving] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchCities = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const data = await cityService.getCities();
      setCities(data);
    } catch (err: any) {
      console.error("Failed to fetch cities:", err);
      setErrorMessage(err.response?.data?.message || err.response?.data || "Failed to load cities.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCities();
  }, []);

  const handleOpenAddModal = () => {
    setEditingCity(null);
    setFormData({
      name: "",
      province: "Southern",
      district: "Matara",
      postalCode: "",
      isActive: true,
    });
    setErrorMessage(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (city: City) => {
    setEditingCity(city);
    setFormData({
      name: city.name,
      province: city.province || SriLankaLocations.getProvinceByDistrict(city.district) || "",
      district: city.district || "",
      postalCode: city.postalCode || "",
      isActive: city.isActive,
    });
    setErrorMessage(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCity(null);
    setErrorMessage(null);
  };

  const handleProvinceChange = (province: string) => {
    const districtsForProv = SriLankaLocations.getDistrictsByProvince(province);
    setFormData((prev) => ({
      ...prev,
      province,
      district: districtsForProv.length > 0 ? districtsForProv[0] : "",
    }));
  };

  const handleDistrictChange = (district: string) => {
    const parentProvince = SriLankaLocations.getProvinceByDistrict(district);
    setFormData((prev) => ({
      ...prev,
      district,
      province: parentProvince || prev.province,
    }));
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!formData.name.trim()) {
      setErrorMessage("City name is required (e.g. Walgama, Nugegoda, Malabe).");
      return;
    }
    if (!formData.province) {
      setErrorMessage("Please select a Province.");
      return;
    }
    if (!formData.district) {
      setErrorMessage("Please select a District.");
      return;
    }

    setSaving(true);
    setErrorMessage(null);
    try {
      if (editingCity) {
        const updateData: UpdateCityRequest = {
          name: formData.name.trim(),
          province: formData.province?.trim(),
          district: formData.district?.trim(),
          postalCode: formData.postalCode?.trim(),
          isActive: formData.isActive,
        };
        await cityService.updateCity(editingCity.id, updateData);
        setSuccessMessage(`City "${formData.name}" updated successfully.`);
      } else {
        const createData: CreateCityRequest = {
          name: formData.name.trim(),
          province: formData.province?.trim(),
          district: formData.district?.trim(),
          postalCode: formData.postalCode?.trim(),
          isActive: formData.isActive,
        };
        await cityService.createCity(createData);
        setSuccessMessage(`City "${formData.name}" created successfully.`);
      }
      handleCloseModal();
      fetchCities();
    } catch (err: any) {
      console.error("Save error:", err);
      const msg =
        typeof err.response?.data === "string"
          ? err.response.data
          : err.response?.data?.message || err.response?.data?.title || err.message || "Failed to save city.";
      setErrorMessage(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (city: City) => {
    if (!window.confirm(`Are you sure you want to delete or deactivate city "${city.name}"?`)) return;

    try {
      const res = await cityService.deleteCity(city.id);
      setSuccessMessage(res.message || `City "${city.name}" processed successfully.`);
      fetchCities();
    } catch (err: any) {
      console.error("Delete error:", err);
      alert(err.response?.data?.message || err.response?.data || "Failed to delete city.");
    }
  };

  // Filtered Cities
  const filteredCities = cities.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.postalCode && c.postalCode.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (c.district && c.district.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (c.province && c.province.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus =
      filterActive === "all" ? true : filterActive === "active" ? c.isActive : !c.isActive;

    const matchesProvince =
      filterProvince === "all" ? true : c.province?.toLowerCase() === filterProvince.toLowerCase();

    return matchesSearch && matchesStatus && matchesProvince;
  });

  const totalCities = cities.length;
  const activeCities = cities.filter((c) => c.isActive).length;
  const totalBranches = cities.reduce((acc, c) => acc + (c.branchCount || 0), 0);
  const totalDistricts = new Set(cities.map((c) => c.district).filter(Boolean)).size;

  const provincesList = SriLankaLocations.getProvinces();
  const availableDistricts = SriLankaLocations.getDistrictsByProvince(formData.province);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <MapPin className="text-red-500 w-7 h-7" /> Cities & Locations Management
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Hierarchy: <strong className="text-gray-700">Province &rarr; District &rarr; City</strong> (e.g. Southern &rarr; Matara &rarr; Walgama).
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchCities}
            className="p-2.5 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition flex items-center gap-2 text-sm font-medium"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} /> Refresh
          </button>
          <button
            onClick={handleOpenAddModal}
            className="px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium shadow-md shadow-red-200 transition flex items-center gap-2 text-sm cursor-pointer"
          >
            <Plus className="w-5 h-5" /> Add New City
          </button>
        </div>
      </div>

      {/* Notifications */}
      {successMessage && (
        <div className="bg-emerald-50 text-emerald-800 border border-emerald-200 p-4 rounded-xl text-sm flex justify-between items-center">
          <span>{successMessage}</span>
          <button onClick={() => setSuccessMessage(null)} className="text-emerald-600 font-bold ml-4">
            ✕
          </button>
        </div>
      )}

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-red-50 text-red-500 rounded-xl">
            <MapPin className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Total Cities</p>
            <p className="text-2xl font-bold text-gray-900">{totalCities}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Active Cities</p>
            <p className="text-2xl font-bold text-emerald-600">{activeCities}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Linked Branches</p>
            <p className="text-2xl font-bold text-gray-900">{totalBranches}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <Compass className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Districts Covered</p>
            <p className="text-2xl font-bold text-gray-900">{totalDistricts}</p>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search city, district, province, postal code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500 font-medium whitespace-nowrap">Province:</span>
            <select
              value={filterProvince}
              onChange={(e) => setFilterProvince(e.target.value)}
              className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-red-500 text-gray-700 font-medium"
            >
              <option value="all">All Provinces</option>
              {provincesList.map((p) => (
                <option key={p} value={p}>
                  {p} Province
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500 font-medium whitespace-nowrap">Status:</span>
            <select
              value={filterActive}
              onChange={(e) => setFilterActive(e.target.value)}
              className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-red-500 text-gray-700"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table Data Container */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-500">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto text-red-500 mb-3" />
            <p className="font-medium">Loading cities...</p>
          </div>
        ) : filteredCities.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="font-semibold text-gray-700 text-lg">No Cities Found</p>
            <p className="text-sm text-gray-400 mt-1">Try adjusting your search query or add a new city.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <th className="py-4 px-6">ID</th>
                  <th className="py-4 px-6">City Name</th>
                  <th className="py-4 px-6">District</th>
                  <th className="py-4 px-6">Province</th>
                  <th className="py-4 px-6">Postal Code</th>
                  <th className="py-4 px-6">Linked Branches</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {filteredCities.map((city) => (
                  <tr key={city.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="py-4 px-6 font-mono text-gray-400 font-medium">#{city.id}</td>
                    <td className="py-4 px-6 font-semibold text-gray-900 flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-red-500 flex-shrink-0" />
                      {city.name}
                    </td>
                    <td className="py-4 px-6 text-gray-700 font-medium">
                      {city.district ? (
                        <span className="px-2.5 py-1 bg-amber-50 text-amber-800 rounded-lg text-xs font-semibold border border-amber-100">
                          {city.district}
                        </span>
                      ) : (
                        <span className="text-gray-300 italic">N/A</span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-gray-600">
                      {city.province ? (
                        <span className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-medium border border-blue-100">
                          {city.province}
                        </span>
                      ) : (
                        <span className="text-gray-300 italic">N/A</span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-gray-600 font-mono">
                      {city.postalCode || <span className="text-gray-300 italic">N/A</span>}
                    </td>
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-purple-50 text-purple-700 rounded-lg text-xs font-semibold">
                        <Building2 className="w-3.5 h-3.5" />
                        {city.branchCount} {city.branchCount === 1 ? "Branch" : "Branches"}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      {city.isActive ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-semibold">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 text-gray-500 border border-gray-200 rounded-full text-xs font-semibold">
                          <XCircle className="w-3.5 h-3.5" /> Inactive
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEditModal(city)}
                          className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          title="Edit City"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(city)}
                          className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="Delete / Deactivate City"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-gray-100">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <MapPin className="text-red-500 w-5 h-5" />
                {editingCity ? "Edit City" : "Add New City"}
              </h2>
              <button
                type="button"
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600 transition font-bold text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {errorMessage && (
                <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-xl text-xs font-medium">
                  {errorMessage}
                </div>
              )}

              {/* 1. Province Dropdown */}
              <SearchableSelect
                label="1. Province"
                required
                options={provincesList}
                value={formData.province || ""}
                onChange={handleProvinceChange}
                placeholder="Type or search Province..."
              />

              {/* 2. District Dropdown (Filtered by Province) */}
              <SearchableSelect
                label="2. District"
                required
                options={availableDistricts}
                value={formData.district || ""}
                onChange={handleDistrictChange}
                placeholder="Type or search District..."
              />

              {/* 3. City Name Input */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                  3. City Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Walgama, Nugegoda, Malabe"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-red-500 focus:outline-none"
                />
              </div>

              {/* 4. Postal Code Input */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                  4. Postal Code
                </label>
                <input
                  type="text"
                  placeholder="e.g. 81000, 10250, 10115"
                  value={formData.postalCode || ""}
                  onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-red-500 focus:outline-none"
                />
              </div>

              {/* 5. Active Checkbox */}
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 text-red-500 border-gray-300 rounded focus:ring-red-500 cursor-pointer"
                />
                <label htmlFor="isActive" className="text-sm font-medium text-gray-700 cursor-pointer select-none">
                  Active for delivery coverage
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl text-sm font-medium transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-medium shadow-md shadow-red-200 transition disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                >
                  {saving ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" /> Saving...
                    </>
                  ) : editingCity ? (
                    "Update City"
                  ) : (
                    "Create City"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cities;
