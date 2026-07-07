import axios from "axios";
import { BASE_URL } from "../constants/endpoints";

// ─── Global Axios Instance ────────────────────────────────────────────────────
// Instead of calling axios.get("http://localhost:5000/issues") in every component,
// every service imports THIS instance and just calls axiosInstance.get("/issues").
// The baseURL, headers and token logic are configured ONCE here.

const axiosInstance = axios.create({
  baseURL: BASE_URL,       // pulled from constants — change the URL in one place
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,   // sends cookies with every request (needed for auth)
});

// ─── Request Interceptor ──────────────────────────────────────────────────────
// Runs BEFORE every request is sent.
// If a JWT token exists in localStorage, it is automatically added to the
// Authorization header so we never have to remember to do it manually in each service.
axiosInstance.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response Interceptor ─────────────────────────────────────────────────────
// Runs AFTER every response comes back.
// If the server returns 401 (Unauthorized), we clear the stored token and
// redirect to the login page automatically — again, in one place, not in every page.
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Don't redirect if we're already on the login page
      if (typeof window !== "undefined" && !window.location.pathname.startsWith("/login")) {
        console.warn("Unauthorized — clearing token and redirecting to login.");
        localStorage.removeItem("token");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;

