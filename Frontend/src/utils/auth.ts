export interface AuthUser {
  id?: string;
  name?: string;
  email?: string;
  role?: string;
  branchId?: string;
  clientId?: string;
}

export function getToken(): string | null {
  return localStorage.getItem("token");
}

export function getUserRole(): string | null {
  const token = localStorage.getItem("token");
  if (!token) return localStorage.getItem("role");

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return (
      payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] ||
      payload["role"] ||
      localStorage.getItem("role")
    );
  } catch {
    return localStorage.getItem("role");
  }
}

export function getCurrentUser(): AuthUser {
  const token = localStorage.getItem("token");
  const storedName = localStorage.getItem("userName");
  const storedRole = localStorage.getItem("role") || undefined;

  if (!token) {
    return {
      name: storedName || storedRole || "Admin",
      role: storedRole || "Admin",
    };
  }

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const name =
      storedName ||
      payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"] ||
      payload["name"] ||
      payload["email"]?.split("@")[0] ||
      storedRole ||
      "Admin";

    const role =
      payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] ||
      payload["role"] ||
      storedRole ||
      "Admin";

    const email =
      payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"] ||
      payload["email"];

    const id = payload["userId"] || payload["nameid"] || payload["sub"];
    const branchId = payload["branchId"];
    const clientId = payload["clientId"];

    return { id, name, email, role, branchId, clientId };
  } catch {
    return {
      name: storedName || storedRole || "Admin",
      role: storedRole || "Admin",
    };
  }
}

export function getUserInitials(name?: string): string {
  if (!name) return "AD";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function getTimeOfDayGreeting(): { greeting: string; icon: string } {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) {
    return { greeting: "Good Morning", icon: "🌅" };
  } else if (hour >= 12 && hour < 17) {
    return { greeting: "Good Afternoon", icon: "🌤️" };
  } else {
    return { greeting: "Good Evening", icon: "🌙" };
  }
}