import Sidebar from "./AdminSidebar";
import Navbar from "./AdminNavbar";
import { Outlet } from "react-router-dom";

function AdminLayout() {
  return (

    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="p-6 flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;