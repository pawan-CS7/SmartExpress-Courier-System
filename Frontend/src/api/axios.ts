import axios from "axios";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

// Add JWT automatically
api.interceptors.request.use(
    (config) => {

        const token =
            localStorage.getItem("token");

        console.log("JWT TOKEN:", token);

        if (token) {
            config.headers.Authorization =
                `Bearer ${token}`;
        }

        return config;
    },

    (error) => Promise.reject(error)
);

export default api;