// client/src/api/axios.js
import axios from "axios";

const instance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "https://therpy-web.onrender.com/api",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000, // 15 seconds timeout
});

// ✅ Automatically add JWT token to every request
instance.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem("token"); // 👈 token le sessionStorage se
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`; // 👈 Header me token daal
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default instance;
