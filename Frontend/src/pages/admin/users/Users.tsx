import { useState, useEffect } from "react";
import api from "../../../services/api";

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
}

function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const res = await api.get("/api/users");
      setUsers(res.data);
    } catch (err) {
      console.error("Failed to fetch users", err);
    } finally {
      setLoading(false);
    }
  };

  const changeRole = async (userId: number, newRole: string) => {
    try {
      await api.put(`/api/users/update-role/${userId}`, { role: newRole });
      setUsers(users.map((u) => (u.id === userId ? { ...u, role: newRole } : u)));
    } catch (err) {
      console.error("Failed to update role", err);
      alert("Failed to update user role. Please try again.");
    }
  };

  const toggleStatus = async (userId: number, currentStatus: boolean) => {
    try {
      await api.put(`/api/users/update-role/${userId}`, { isActive: !currentStatus });
      setUsers(users.map((u) => (u.id === userId ? { ...u, isActive: !currentStatus } : u)));
    } catch (err) {
      console.error("Failed to toggle status", err);
      alert("Failed to update user status. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-red-500"></div>
        <span className="ml-3 text-gray-600 font-medium">Loading Users...</span>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Users Management</h1>
        <p className="text-sm text-gray-500">Manage user roles and account statuses</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-xs font-bold uppercase text-gray-500">
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Role Setup</th>
                <th className="px-6 py-4 text-center">System Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm text-gray-600">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50/50 transition">
                  <td className="px-6 py-4 font-medium text-gray-800">{user.name}</td>
                  <td className="px-6 py-4">{user.email}</td>
                  <td className="px-6 py-4">
                    <select
                      value={user.role}
                      onChange={(e) => changeRole(user.id, e.target.value)}
                      className="border border-gray-200 rounded-lg p-2 text-sm focus:ring-2 focus:ring-red-400 outline-none bg-white cursor-pointer"
                    >
                      <option value="Admin">Admin</option>
                      <option value="Branch Manager">Branch Manager</option>
                      <option value="Pickup Officer">Pickup Officer</option>
                      <option value="Delivery Rider">Delivery Rider</option>
                      <option value="Client">Client</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => toggleStatus(user.id, user.isActive)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                        user.isActive
                          ? "bg-green-50 text-green-700 hover:bg-green-100"
                          : "bg-red-50 text-red-700 hover:bg-red-100"
                      }`}
                    >
                      {user.isActive ? "Active (Suspend)" : "Suspended (Activate)"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Users;