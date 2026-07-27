import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../../services/api";

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    nic: "",
    address: "",
    password: ""
  });
  
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Validates all inputs against strict formats before pushing to API
  const validateForm = () => {
    if (!formData.name || !formData.email || !formData.phone || !formData.nic || !formData.address || !formData.password) {
      setError("Please complete all required fields.");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Please provide a valid email address.");
      return false;
    }

    // Ensures exact 10-digit format for standard mobile numbers
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(formData.phone)) {
      setError("Phone number must contain exactly 10 digits.");
      return false;
    }

    // Validates both old (9 digits + V/v/X/x) and new (12 digits) NIC formats
    const nicRegex = /^([0-9]{9}[vVxX]|[0-9]{12})$/;
    if (!nicRegex.test(formData.nic)) {
      setError("Invalid NIC format. Use 9 digits + V or 12 continuous digits.");
      return false;
    }

    // Strong password: Minimum 8 characters, at least 1 uppercase letter, and 1 number
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(formData.password)) {
      setError("Password must be at least 8 characters long and contain at least one uppercase letter and one number.");
      return false;
    }

    return true;
  };

  const handleRegister = async () => {
    setError("");

    // Halt execution if client-side validation fails
    if (!validateForm()) return;

    try {
      setLoading(true);

      await api.post("/api/Auth/register-client", formData);
      navigate("/login");

    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || "System error: Registration failed. Please try again. ⚠️");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-500 via-red-500 to-pink-500 p-6">
      <div className="w-full max-w-lg bg-white/80 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-white/30">
        
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Create Account 🚀</h2>
        <p className="text-gray-500 mb-6">Join SmartExpress today</p>

        {/* Display Validation Errors */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-600 p-3 rounded-xl text-sm font-medium">
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="col-span-2 sm:col-span-1">
            <input type="text" name="name" onChange={handleChange} placeholder="Full Name" required className="w-full p-3 border border-gray-200 rounded-xl bg-transparent focus:ring-2 focus:ring-red-400 outline-none transition" />
          </div>
          <div className="col-span-2 sm:col-span-1">
            <input type="text" name="phone" onChange={handleChange} placeholder="Phone Number (10 Digits)" required className="w-full p-3 border border-gray-200 rounded-xl bg-transparent focus:ring-2 focus:ring-red-400 outline-none transition" />
          </div>
          <div className="col-span-2">
            <input type="email" name="email" onChange={handleChange} placeholder="Email Address" required className="w-full p-3 border border-gray-200 rounded-xl bg-transparent focus:ring-2 focus:ring-red-400 outline-none transition" />
          </div>
          <div className="col-span-2 sm:col-span-1">
            <input type="text" name="nic" onChange={handleChange} placeholder="NIC Number" required className="w-full p-3 border border-gray-200 rounded-xl bg-transparent focus:ring-2 focus:ring-red-400 outline-none transition" />
          </div>
          <div className="col-span-2 sm:col-span-1">
            <input type="password" name="password" onChange={handleChange} placeholder="Secure Password" required className="w-full p-3 border border-gray-200 rounded-xl bg-transparent focus:ring-2 focus:ring-red-400 outline-none transition" />
          </div>
          <div className="col-span-2">
            <input type="text" name="address" onChange={handleChange} placeholder="Home Address" required className="w-full p-3 border border-gray-200 rounded-xl bg-transparent focus:ring-2 focus:ring-red-400 outline-none transition" />
          </div>
        </div>

        <button
          onClick={handleRegister}
          disabled={loading}
          className="w-full bg-gradient-to-r from-red-500 to-orange-500 text-white py-3.5 rounded-xl font-bold transition-all duration-300 hover:shadow-lg disabled:opacity-50"
        >
          {loading ? "Registering System Account..." : "Sign Up Securely"}
        </button>

        <p className="text-center text-sm mt-6 text-gray-600">
          Already have an account?{" "}
          <Link to="/login" className="text-red-500 font-bold hover:underline transition">
            Login
          </Link>
        </p>

      </div>
    </div>
  );
}

export default Register;