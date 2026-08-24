import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import api from "../../services/api";
import { branchService } from "../../services/branchService";
import type { Branch } from "../../types/branch";
import SearchableSelect from "../../components/SearchableSelect";

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    nic: "",
    address: "",
    password: "",
    confirmPassword: "",
    branchId: ""
  });
  
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loadingBranches, setLoadingBranches] = useState(false);
  
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        setLoadingBranches(true);
        const data = await branchService.getBranches(undefined, true); // Active only
        setBranches(data);
      } catch (err) {
        console.error("Failed to load branches:", err);
      } finally {
        setLoadingBranches(false);
      }
    };
    fetchBranches();
  }, []);

  // Validates all inputs against strict formats before pushing to API
  const validateForm = () => {
    if (!formData.name || !formData.email || !formData.phone || !formData.nic || !formData.address || !formData.password || !formData.branchId) {
      setError("Please complete all required fields including selecting a branch.");
      return false;
    }

    if (!acceptedTerms) {
      setError("You must accept the Terms and Conditions to register.");
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

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
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
      <div className="w-full max-w-lg bg-white/90 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-white/40">
        
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Create Account 🚀</h2>
        <p className="text-gray-500 mb-6">Join SmartExpress today</p>

        {/* Display Validation Errors */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-600 p-3 rounded-xl text-sm font-medium">
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="col-span-2 sm:col-span-1">
            <input type="text" name="name" onChange={handleChange} placeholder="Full Name" required className="w-full p-3 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-red-400 outline-none transition shadow-sm" />
          </div>
          <div className="col-span-2 sm:col-span-1">
            <input type="text" name="phone" onChange={handleChange} placeholder="Phone Number (10 Digits)" required className="w-full p-3 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-red-400 outline-none transition shadow-sm" />
          </div>
          <div className="col-span-2">
            <input type="email" name="email" onChange={handleChange} placeholder="Email Address" required className="w-full p-3 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-red-400 outline-none transition shadow-sm" />
          </div>
          <div className="col-span-2">
            <SearchableSelect
              label="Nearest Branch *"
              placeholder="Select your nearest branch"
              options={branches.map(b => ({ value: b.id, label: b.name, sublabel: b.address }))}
              value={formData.branchId}
              onChange={(val) => setFormData({ ...formData, branchId: val })}
              required
              loading={loadingBranches}
            />
          </div>
          <div className="col-span-2 sm:col-span-1">
            <input type="text" name="nic" onChange={handleChange} placeholder="NIC Number" required className="w-full p-3 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-red-400 outline-none transition shadow-sm" />
          </div>
          <div className="col-span-2 sm:col-span-1">
             <input type="text" name="address" onChange={handleChange} placeholder="Home Address" required className="w-full p-3 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-red-400 outline-none transition shadow-sm" />
          </div>
          <div className="col-span-2 sm:col-span-1 relative">
            <input 
              type={showPassword ? "text" : "password"} 
              name="password" 
              onChange={handleChange} 
              placeholder="Secure Password" 
              required 
              className="w-full p-3 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-red-400 outline-none transition pr-10 shadow-sm" 
            />
            <button 
              type="button" 
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600 transition"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          <div className="col-span-2 sm:col-span-1 relative">
            <input 
              type={showConfirmPassword ? "text" : "password"} 
              name="confirmPassword" 
              onChange={handleChange} 
              placeholder="Confirm Password" 
              required 
              className="w-full p-3 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-red-400 outline-none transition pr-10 shadow-sm" 
            />
            <button 
              type="button" 
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600 transition"
            >
              {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <div className="mb-6 flex items-center gap-2">
          <input 
            type="checkbox" 
            id="terms" 
            checked={acceptedTerms} 
            onChange={(e) => setAcceptedTerms(e.target.checked)}
            className="w-4 h-4 text-red-500 rounded focus:ring-red-400 cursor-pointer"
          />
          <label htmlFor="terms" className="text-sm text-gray-600 cursor-pointer select-none">
            I accept the <a href="#" className="text-red-500 font-bold hover:underline" onClick={(e) => { e.preventDefault(); alert("Terms and Conditions placeholder"); }}>Terms and Conditions</a>
          </label>
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