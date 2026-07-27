import { Navigate } from "react-router-dom";
import { getToken } from "../utils/auth";

function ProtectedRoute({ children }: any) {
  const token = getToken();

  if (!token) return <Navigate to="/" />;

  return children;
}

export default ProtectedRoute;