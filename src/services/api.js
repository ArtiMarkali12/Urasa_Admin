import axios from "axios";

const API = import.meta.env.VITE_API_BASE_URL;
const API_URL = `${API}/api`;

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("admin");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

// Admin Auth APIs
export const adminAPI = {
  register: (data) => api.post("/admin/register", data),
  login: (data) => api.post("/admin/login", data),
  getProfile: () => api.get("/admin/profile"),
  updateProfile: (data) => api.put("/admin/profile", data),
  changePassword: (data) => api.put("/admin/change-password", data),
};

// Booklet APIs
export const bookletAPI = {
  getAll: () => api.get("/booklet-quote"),
  getById: (id) => api.get(`/booklet-quote/${id}`),
  create: (data) =>
    api.post("/booklet-quote", data, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  update: (id, data) =>
    api.put(`/booklet-quote/${id}`, data, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  delete: (id) => api.delete(`/booklet-quote/${id}`),
};

// Booklet Options APIs
export const bookletOptionsAPI = {
  getAll: () => api.get("/booklet-quote/options"),
  // Category management APIs
  addCategory: (data) => api.post("/booklet-quote/category", data),
  deleteCategory: (data) => api.delete("/booklet-quote/category", { data }),
  // Generic APIs for dynamic categories
  addGenericOption: (category, data) =>
    api.post(`/booklet-quote/options/${category}`, data),
  updateGenericOption: (category, index, data) =>
    api.put(`/booklet-quote/options/${category}/${index}`, data),
  deleteGenericOption: (category, index) =>
    api.delete(`/booklet-quote/options/${category}/${index}`),
};

// Notebook APIs
export const notebookAPI = {
  getAll: () => api.get("/notebook-quote"),
  getById: (id) => api.get(`/notebook-quote/${id}`),
  create: (data) =>
    api.post("/notebook-quote", data, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  delete: (id) => api.delete(`/notebook-quote/${id}`),
};

// Ledger Register APIs
export const ledgerAPI = {
  getAll: () => api.get("/ledger-register"),
  getById: (id) => api.get(`/ledger-register/${id}`),
  create: (data) =>
    api.post("/ledger-register", data, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  delete: (id) => api.delete(`/ledger-register/${id}`),
};

// Letterhead APIs
export const letterheadAPI = {
  getAll: () => api.get("/letterhead"),
  getById: (id) => api.get(`/letterhead/${id}`),
  create: (data) =>
    api.post("/letterhead", data, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  delete: (id) => api.delete(`/letterhead/${id}`),
};

// Shopping Bags APIs
export const shoppingBagsAPI = {
  getAll: () => api.get("/shopping-bags"),
  getById: (id) => api.get(`/shopping-bags/${id}`),
  create: (data) =>
    api.post("/shopping-bags", data, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  delete: (id) => api.delete(`/shopping-bags/${id}`),
};

export default api;
