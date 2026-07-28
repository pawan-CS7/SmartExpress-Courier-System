import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

// =========================
// REQUEST INTERCEPTOR
// Attach JWT token to headers automatically
// =========================

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    console.log("JWT TOKEN:", token);

    if (token) {
      config.headers = config.headers ?? {};
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// =========================
// RESPONSE INTERCEPTOR
// Handle unauthorized access (401)
// =========================

api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      console.log("Unauthorized - Token Expired, redirecting to login");
      localStorage.clear();
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;