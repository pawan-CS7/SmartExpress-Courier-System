import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import api from "../../services/api";

function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    setMessage("");

    if (!password || !confirmPassword) {
      setMessage("Please fill all fields");
      return;
    }

    if (password !== confirmPassword) {
      setMessage("Passwords do not match");
      return;
    }

    if (!token) {
      setMessage("Invalid or missing token");
      return;
    }

    try {
      setLoading(true);

      await api.post("/Auth/reset-password", {
        token,
        newPassword: password,
      });

      setMessage("Password reset successful ✅");

      setTimeout(() => {
        navigate("/");
      }, 2000);

    } catch (err: any) {
      setMessage(
        err.response?.data || "Something went wrong ❌"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-500 to-red-500">

      <div className="bg-white/90 backdrop-blur-xl p-8 rounded-2xl shadow-xl w-96">

        <h2 className="text-2xl font-bold mb-4 text-center">
          Reset Password 🔐
        </h2>

        {message && (
          <div className="mb-4 text-sm text-center text-red-500">
            {message}
          </div>
        )}

        <input
          type="password"
          placeholder="New Password"
          className="w-full p-3 border rounded-lg mb-4"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <input
          type="password"
          placeholder="Confirm Password"
          className="w-full p-3 border rounded-lg mb-4"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />

        <button
          onClick={handleReset}
          disabled={loading}
          className="w-full bg-red-500 text-white p-3 rounded-lg hover:bg-red-600 transition"
        >
          {loading ? "Resetting..." : "Reset Password"}
        </button>

      </div>
    </div>
  );
}

export default ResetPassword;