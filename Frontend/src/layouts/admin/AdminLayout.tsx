import Sidebar from "./AdminSidebar";
import Navbar from "./AdminNavbar";
import { Outlet } from "react-router-dom";

function AdminLayout() {
  return (

    <div className="flex min-h-screen bg-gray-100">

      {/* SIDEBAR */}
      <Sidebar />

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col">

        <Navbar />

        <main className="p-6 flex-1">
          <Outlet />
        </main>

      </div>

    </div>
  );
}

export default AdminLayout;