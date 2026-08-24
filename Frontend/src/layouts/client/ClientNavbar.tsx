import { Link, useNavigate } from "react-router-dom";
import { getUserRole } from "../../utils/auth";

function ClientNavbar() {
  const role = getUserRole();
  const navigate = useNavigate();

  return (
    <div className="h-16 bg-white border-b flex items-center justify-between px-6 shadow-sm">

      {/* LEFT */}
      <div className="text-lg font-semibold text-gray-800">
        🚚 SmartExpress
      </div>

      {/* RIGHT */}
      <div className="flex items-center gap-4">

        {/* Greeting */}
        <div className="text-sm text-gray-600">
          Welcome, <span className="font-medium text-gray-900">{role}</span> 👋
        </div>

        {/* Clickable Avatar wrapped in a Link component pointing to profile */}
        <Link 
          to="/client/profile"
          className="w-9 h-9 rounded-full bg-red-500 text-white flex items-center justify-center font-semibold cursor-pointer hover:opacity-90 transition shadow-sm"
        >
          {role?.charAt(0)}
        </Link>

        {/* Logout - Kept exactly as original layout color schema */}
        <button
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-1.5 rounded-lg text-sm transition"
          onClick={() => {
            if (window.confirm("Are you sure you want to log out?")) {
              localStorage.removeItem("token");
              localStorage.removeItem("role");
              localStorage.removeItem("userName");
              navigate("/login");
            }
          }}
        >
          Logout
        </button>

      </div>
    </div>
  );
}

export default ClientNavbar;