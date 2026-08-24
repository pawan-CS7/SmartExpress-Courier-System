import { Navigate } from "react-router-dom";
import { getToken, getCurrentUser } from "../utils/auth";

function ProtectedRoute({ children, role, roles }: any) {
  const token = getToken();
  const currentUser = getCurrentUser();

  if (!token) return <Navigate to="/" />;

  let allowedRoles: string[] = [];
  if (roles) {
    allowedRoles = roles;
  } else if (role) {
    if (role === "Admin") {
      allowedRoles = ["Admin", "BranchManager"];
    } else {
      allowedRoles = [role];
    }
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(currentUser?.role ?? "")) {
    return <Navigate to="/" />;
  }

  return children;
}

export default ProtectedRoute;
