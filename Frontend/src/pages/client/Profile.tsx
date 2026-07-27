import { useEffect, useState } from "react";
import api from "../../services/api";

function Profile() {
  const [profile, setProfile] = useState<any>(null);
  const [editing, setEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const [password, setPassword] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/profile");
      setProfile(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const saveProfile = async () => {
    try {
      await api.put("/api/profile", {
        name: profile.name,
        email: profile.email,
        phone: profile.phone,
        address: profile.address,
      });
      alert("Profile updated successfully!");
      setEditing(false);
      loadProfile();
    } catch (err) {
      alert("Failed to update profile.");
    }
  };

  const changePassword = async () => {
    if (password.newPassword !== password.confirmPassword) {
      alert("New password and confirm password do not match!");
      return;
    }
    try {
      await api.put("/api/profile/change-password", {
        currentPassword: password.currentPassword,
        newPassword: password.newPassword,
      });
      alert("Password changed successfully!");
      setPassword({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to change password.");
    }
  };

  if (loading || !profile) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-red-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">My Client Profile</h1>
        <p className="text-gray-500 text-sm mt-1">Manage your personal details and account security</p>
      </div>

      <div className="flex gap-4 mb-6 border-b border-gray-200 pb-2">
        <button
          onClick={() => setActiveTab("profile")}
          className={`pb-2 px-2 text-sm font-semibold transition ${
            activeTab === "profile" ? "text-red-600 border-b-2 border-red-600" : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Personal Details
        </button>
        <button
          onClick={() => setActiveTab("password")}
          className={`pb-2 px-2 text-sm font-semibold transition ${
            activeTab === "password" ? "text-red-600 border-b-2 border-red-600" : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Security
        </button>
      </div>

      {activeTab === "profile" && (
        <div className="bg-white p-8 shadow-sm border border-gray-100 rounded-2xl">
          <div className="flex items-center gap-6 mb-8 pb-8 border-b border-gray-100">
            <img
              src="/Avatar.png"
              alt="Profile"
              className="w-24 h-24 rounded-full object-cover border-4 border-gray-50 shadow-sm"
            />
            <div>
              <h2 className="text-xl font-bold text-gray-800">{profile.name}</h2>
              <span className="inline-block mt-1 px-3 py-1 bg-blue-50 text-blue-600 text-xs font-bold rounded-full">
                {profile.role} Account
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Full Name</label>
              <input
                value={profile.name || ""}
                disabled={!editing}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-red-400 outline-none transition disabled:opacity-70"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Email Address</label>
              <input
                value={profile.email || ""}
                disabled={!editing}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-red-400 outline-none transition disabled:opacity-70"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Phone Number</label>
              <input
                value={profile.phone || ""}
                disabled={!editing}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-red-400 outline-none transition disabled:opacity-70"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Home Address</label>
              <input
                value={profile.address || ""}
                disabled={!editing}
                onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-red-400 outline-none transition disabled:opacity-70"
              />
            </div>
          </div>

          <div className="mt-8 flex justify-end">
            <button
              onClick={() => (editing ? saveProfile() : setEditing(true))}
              className="bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-2.5 rounded-xl transition shadow-sm"
            >
              {editing ? "Save Changes" : "Edit Profile"}
            </button>
          </div>
        </div>
      )}

      {activeTab === "password" && (
        <div className="bg-white p-8 shadow-sm border border-gray-100 rounded-2xl max-w-xl">
          <h2 className="text-lg font-bold text-gray-800 mb-6">Update Password</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Current Password</label>
              <input
                type="password"
                value={password.currentPassword}
                onChange={(e) => setPassword({ ...password, currentPassword: e.target.value })}
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-red-400 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-2">New Password</label>
              <input
                type="password"
                value={password.newPassword}
                onChange={(e) => setPassword({ ...password, newPassword: e.target.value })}
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-red-400 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Confirm New Password</label>
              <input
                type="password"
                value={password.confirmPassword}
                onChange={(e) => setPassword({ ...password, confirmPassword: e.target.value })}
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-red-400 outline-none"
              />
            </div>
          </div>
          <div className="mt-8">
            <button
              onClick={changePassword}
              className="bg-gray-800 hover:bg-gray-900 text-white font-semibold px-6 py-2.5 rounded-xl transition shadow-sm w-full"
            >
              Update Security Key
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Profile;