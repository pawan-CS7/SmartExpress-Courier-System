import Sidebar from "./ClientSidebar";
import Navbar from "./ClientNavbar";
import { Outlet } from "react-router-dom";

function ClientLayout() {
  return (
    <div className="flex bg-gray-50">

      {/* Sidebar */}
      <Sidebar />

      {/* Content */}
      <div className="ml-64 w-full min-h-screen flex flex-col">

        {/* Navbar */}
        <Navbar />

        {/* Page Content */}
        <div className="p-6">
          <div className="bg-white rounded-2xl shadow-sm p-6 min-h-[80vh]">
            <Outlet />
          </div>
        </div>

      </div>
    </div>
  );
}

export default ClientLayout;