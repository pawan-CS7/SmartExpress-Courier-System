import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../../services/api";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ REDIRECT IF ALREADY LOGGED IN
  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    if (token && role) {
      if (role === "Admin" || role === "BranchManager") navigate("/admin/dashboard", { replace: true });
      else if (role === "Client") navigate("/client/dashboard", { replace: true });
      else if (role === "SortingCenterManager") navigate("/sorting/dashboard", { replace: true });
      else if (role === "Rider") navigate("/rider/pending", { replace: true });
    }
  }, [navigate]);

  // ✅ LOGIN HANDLER
  const handleLogin = async () => {

    setError("");

    console.log("API URL:", api.defaults.baseURL);
    console.log(import.meta.env.VITE_API_BASE_URL);

    const trimmedEmail = email.trim();

    // 🔹 Empty validation
    if (!trimmedEmail || !password) {
      setError("Please enter both email and password");
      return;
    }

    // 🔹 Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(trimmedEmail)) {
      setError("Please enter a valid email");
      return;
    }

    try {

      setLoading(true);

      const res = await api.post("/api/Auth/login", {
        email: trimmedEmail,
        password,
      });

      console.log("LOGIN RESPONSE:", res.data);

      // ✅ Save token
      localStorage.setItem("token", res.data.token);

      // ✅ Save role & name
      const role = res.data.role?.trim() || "";
      localStorage.setItem("role", role);
      if (res.data.name) {
        localStorage.setItem("userName", res.data.name);
      }

      console.log("ROLE:", role);

      // ✅ Redirect by role
      if (role === "Admin" || role === "BranchManager") {
        navigate("/admin/dashboard", { replace: true });
      }
      else if (role === "Client") {
        navigate("/client/dashboard", { replace: true });
      }
      else if (role === "SortingCenterManager") {
        navigate("/sorting/dashboard", { replace: true });
      }
      else if (role === "Rider") {
        navigate("/rider/pending", { replace: true });
      }
      else {
        setError("Unknown user role");
      }

    } catch (err: any) {

      console.log(err);

      // 🔴 Backend errors
      if (err.response) {

        if (err.response.status === 401) {
          setError("Invalid email or password ❌");
        }
        else if (err.response.status === 500) {
          setError("Server error. Try again later ⚠️");
        }
        else {
          setError(err.response.data?.message || "Login failed");
        }

      } else {
        setError("Cannot connect to server 🌐");
      }

    } finally {
      setLoading(false);
    }
  };

  return (

    <div className="min-h-screen flex bg-gradient-to-br from-orange-500 via-red-500 to-pink-500">

      {/* LEFT SIDE */}
      <div className="hidden md:flex w-1/2 items-center justify-center text-white relative overflow-hidden">

        <div className="absolute w-[500px] h-[500px] bg-white/10 blur-3xl rounded-full top-10 left-10"></div>

        <div className="text-center px-12 z-10">

          <h1 className="text-5xl font-extrabold mb-4">
            SmartExpress 🚚
          </h1>

          <p className="text-lg opacity-90 mb-8">
            Fast, reliable and secure courier services
          </p>

          <img
            src="/Delivery.png"
            alt="delivery"
            className="w-80 mx-auto rounded-xl shadow-2xl hover:scale-105 transition"
          />

        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-6 rounded-l-[160px]">

        <div className="w-full max-w-md bg-white/80 backdrop-blur-xl p-10 rounded-3xl shadow-2xl border border-white/30">

          {/* TITLE */}
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            Welcome Back 👋
          </h2>

          <p className="text-gray-500 mb-6">
            Sign in to continue your journey
          </p>

          {/* ERROR */}
          {error && (
            <div className="mb-4 bg-red-100 border border-red-300 text-red-600 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* EMAIL */}
          <div className="relative mb-6">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="peer w-full p-3.5 border-2 border-gray-100 rounded-xl bg-gray-50 focus:bg-white focus:border-red-400 focus:ring-4 focus:ring-red-100 transition-all outline-none"
              placeholder=" "
            />
            <label className="absolute left-4 top-3.5 text-gray-400 text-sm transition-all pointer-events-none
            peer-focus:-top-2.5 peer-focus:text-xs peer-focus:text-red-500 peer-focus:bg-white peer-focus:px-2
            peer-[&:not(:placeholder-shown)]:-top-2.5 peer-[&:not(:placeholder-shown)]:text-xs peer-[&:not(:placeholder-shown)]:bg-white peer-[&:not(:placeholder-shown)]:px-2">
              Email Address
            </label>
          </div>

          {/* PASSWORD */}
          <div className="relative mb-6">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="peer w-full p-3.5 border-2 border-gray-100 rounded-xl bg-gray-50 focus:bg-white focus:border-red-400 focus:ring-4 focus:ring-red-100 transition-all outline-none pr-12"
              placeholder=" "
            />
            <label className="absolute left-4 top-3.5 text-gray-400 text-sm transition-all pointer-events-none
            peer-focus:-top-2.5 peer-focus:text-xs peer-focus:text-red-500 peer-focus:bg-white peer-focus:px-2
            peer-[&:not(:placeholder-shown)]:-top-2.5 peer-[&:not(:placeholder-shown)]:text-xs peer-[&:not(:placeholder-shown)]:bg-white peer-[&:not(:placeholder-shown)]:px-2">
              Password
            </label>
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-3.5 text-gray-400 hover:text-red-500 transition-colors"
            >
              {showPassword ? "🙈" : "👁"}
            </button>
          </div>

          {/* OPTIONS */}
          <div className="flex justify-between items-center mb-6 text-sm">

            <label className="flex items-center space-x-2">
              <input type="checkbox" />
              <span className="text-gray-600">Remember me</span>
            </label>

            <Link
              to="/forgot-password"
              className="text-red-500 hover:underline"
            >
              Forgot Password?
            </Link>

          </div>

          {/* BUTTON */}
          <button
            onClick={handleLogin}
            disabled={loading || !email || !password}
            className="w-full bg-gradient-to-r from-red-500 to-orange-500 text-white py-3.5 rounded-xl font-bold text-lg transition-all duration-300 hover:shadow-[0_8px_30px_rgb(239,68,68,0.3)] hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                Authenticating...
              </span>
            ) : "Login"}
          </button>

          {/* REGISTER */}
          <p className="text-center text-sm mt-6 text-gray-600">

            Don’t have an account?{" "}

            <Link to="/register" className="text-red-500 cursor-pointer hover:underline">
                Register Now
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
}

export default Login;
