import { Link, useNavigate } from "react-router-dom";

function AdminNavbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/");
  };

  return (
    <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shadow-sm">

      {/* TITLE */}
      <h1 className="font-bold text-xl text-gray-800">
        Admin Dashboard
      </h1>

      {/* RIGHT SIDE */}
      <div className="flex items-center gap-4">

        {/* Clickable Admin Profile Box wrapped in a Link component */}
        <Link 
          to="/admin/profile"
          className="flex items-center gap-2 text-gray-700 cursor-pointer hover:opacity-90 transition"
        >
          <div className="w-9 h-9 rounded-full bg-gradient-to-r from-red-500 to-orange-500 text-white flex items-center justify-center font-bold">
            A
          </div>
          <span className="font-medium">
            Admin
          </span>
        </Link>

        {/* LOGOUT - Kept exactly as original layout color schema */}
        <button
          onClick={handleLogout}
          className="bg-gradient-to-r from-red-500 to-orange-500 text-white px-4 py-2 rounded-lg text-sm hover:opacity-90 transition"
        >
          Logout
        </button>

      </div>

    </div>
  );
}

export default AdminNavbar;