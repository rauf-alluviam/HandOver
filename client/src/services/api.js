// client/src/services/api.js
import axios from "axios";

const API_BASE_URL = "http://localhost:5000/api"; // Note: Added /api

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000,
});

export const authAPI = {
  login: (credentials) => api.post("/auth/login", credentials),
};

export const vgmAPI = {
  submit: (vgmData) => api.post("/vgm/submit", vgmData),
  getStatus: (statusData) => api.post("/vgm/status", statusData),
  getRequests: (filters) => api.get("/vgm/requests", { params: filters }),
  updateRequest: (vgmId, updateData) =>
    api.put(`/vgm/requests/${vgmId}`, updateData),
};

export const logAPI = {
  getById: (logId) => api.get(`/logs/${logId}`),
  getByModule: (moduleName, page = 1, limit = 10) =>
    api.get(`/logs/module/${moduleName}?page=${page}&limit=${limit}`),
  edit: (logId, updates) => api.patch(`/logs/${logId}/edit`, updates),
  update: (logId, completeData) =>
    api.put(`/logs/${logId}/update`, completeData),
};

// Enhanced response interceptor to handle the new format
api.interceptors.response.use(
  (response) => {
    // Handle the new response format from your server
    if (response.data && typeof response.data === "object") {
      // If the response has a success flag and data field, extract it
      if (response.data.success && response.data.data !== undefined) {
        return {
          ...response,
          data: response.data.data, // Extract the actual data
        };
      }
    }
    return response;
  },
  (error) => {
    console.error("API Error:", error);

    if (error.code === "ERR_NETWORK") {
      throw new Error("Network error: Unable to connect to server.");
    }

    if (error.response) {
      const message =
        error.response.data?.error ||
        error.response.data?.message ||
        `Server error: ${error.response.status}`;
      throw new Error(message);
    }

    throw error;
  }
);

// export const vgmAPI = axios.create({
//   baseURL: API_BASE_URL,
//   timeout: 10000,
//   headers: {
//     "Content-Type": "application/json",
//   },
// });

// // Add request interceptor for authentication if needed
// vgmAPI.interceptors.request.use(
//   (config) => {
//     const token = localStorage.getItem("authToken");
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//     return config;
//   },
//   (error) => {
//     return Promise.reject(error);
//   }
// );

// // Add response interceptor for error handling
// vgmAPI.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     console.error("API Error:", error);
//     return Promise.reject(error);
//   }
// );

export default api;
