import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "https://student-task-manager-jyjf.onrender.com",
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor to attach the JWT token to every request if it exists in localStorage
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default API;
