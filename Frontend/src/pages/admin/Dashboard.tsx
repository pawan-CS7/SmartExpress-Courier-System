import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { LayoutDashboard, ListOrdered, User } from "lucide-react";
import api from "../../services/api";
import { getCurrentUser, getTimeOfDayGreeting, type AuthUser } from "../../utils/auth";
import DeliveryManImg from "../../assets/delivery man.png";

function Dashboard() {
  const [currentUser, setCurrentUser] = useState<AuthUser>(getCurrentUser());
  const greetingInfo = getTimeOfDayGreeting();

  const fetchProfile = async () => {
    try {
      const res = await api.get("/api/Profile");
      if (res.data) {
        setCurrentUser((prev) => ({
          ...prev,
          name: res.data.name || prev.name,
          email: res.data.email || prev.email,
          role: res.data.role || prev.role,
        }));
      }
    } catch (err) {
      console.error("Failed to fetch user profile", err);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const displayName = currentUser?.name || currentUser?.role || "Admin";

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-10">
      {/* 🔴 TOP HERO BANNER */}
      <div className="relative bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex flex-col md:flex-row h-auto md:h-96">

        {/* Left Side: Dark red diagonal section with truck.png in place of placeholder */}
        <div className="md:w-[58%] relative overflow-hidden bg-gradient-to-r from-[#6e130c] to-[#921f19] flex items-center justify-center p-6 md:p-8 min-h-[260px] md:min-h-[384px] md:[clip-path:polygon(0_0,100%_0,85%_100%,0_100%)]">

          {/* Decorative Dotted Curves */}
          <div className="absolute top-6 left-6 w-36 h-36 border-t-2 border-l-2 border-dotted border-white/20 rounded-tl-full pointer-events-none"></div>
          <div className="absolute bottom-6 right-24 w-36 h-36 border-b-2 border-r-2 border-dotted border-white/20 rounded-br-full pointer-events-none"></div>

          {/* 3D Truck Illustration Asset at the marked arrow position */}
          <div className="z-10 transform hover:scale-105 transition-transform duration-300 pointer-events-none select-none flex items-center justify-center h-full relative -left-8 md:-left-14">
            <img
              src={DeliveryManImg}
              alt="SmartExpress Delivery Scooter"
              className="w-auto h-[14rem] sm:h-[16rem] md:h-[18rem] lg:h-[20rem] object-contain drop-shadow-[0_20px_25px_rgba(0,0,0,0.5)]"
            />
          </div>
        </div>

        {/* Right Side: Dynamic User Greeting */}
        <div className="md:w-[42%] flex flex-col justify-center p-8 md:p-12 lg:p-14 relative z-20 bg-white">
          <p className="text-gray-600 text-base md:text-lg font-medium mb-1">
            {greetingInfo.greeting} {displayName}
          </p>
          <h1 className="text-4xl md:text-5xl font-extrabold text-[#D83626] tracking-tight">
            Welcome Back !
          </h1>
        </div>
      </div>

      {/* ⚡ QUICK ACCESS */}
      <div>
        <h2 className="text-xl font-bold text-gray-800 mb-6">
          Quick Access
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* 1. Dashboard */}
          <Link
            to="/admin/dashboard"
            className="group bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:border-red-100 transition-all duration-300 flex flex-col"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-[#D83626] text-white p-2.5 rounded-full shadow-sm group-hover:scale-105 transition-transform">
                <LayoutDashboard size={22} />
              </div>
              <h3 className="font-bold text-gray-800 text-lg group-hover:text-[#D83626] transition-colors">
                Dashboard
              </h3>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed">
              Get a complete overview of your orders, trends, and key insights at a glance.
            </p>
          </Link>

          {/* 2. All Orders */}
          <Link
            to="/admin/orders"
            className="group bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:border-red-100 transition-all duration-300 flex flex-col"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-[#D83626] text-white p-2.5 rounded-full shadow-sm group-hover:scale-105 transition-transform">
                <ListOrdered size={22} />
              </div>
              <h3 className="font-bold text-gray-800 text-lg group-hover:text-[#D83626] transition-colors">
                All Orders
              </h3>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed">
              Access and manage all your past and current orders in one place.
            </p>
          </Link>

          {/* 3. My Profile */}
          <Link
            to="/admin/profile"
            className="group bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:border-red-100 transition-all duration-300 flex flex-col"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-[#D83626] text-white p-2.5 rounded-full shadow-sm group-hover:scale-105 transition-transform">
                <User size={22} />
              </div>
              <h3 className="font-bold text-gray-800 text-lg group-hover:text-[#D83626] transition-colors">
                My Profile
              </h3>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed">
              Review and update your personal details, preferences, and settings.
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;

