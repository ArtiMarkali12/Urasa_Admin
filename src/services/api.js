import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('admin');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Admin Auth APIs
export const adminAPI = {
  register: (data) => api.post('/admin/register', data),
  login: (data) => api.post('/admin/login', data),
  getProfile: () => api.get('/admin/profile'),
  updateProfile: (data) => api.put('/admin/profile', data),
  changePassword: (data) => api.put('/admin/change-password', data),
};

// Booklet APIs
export const bookletAPI = {
  getAll: () => api.get('/booklet-quote'),
  getById: (id) => api.get(`/booklet-quote/${id}`),
  create: (data) => api.post('/booklet-quote', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  delete: (id) => api.delete(`/booklet-quote/${id}`),
};

// Notebook APIs
export const notebookAPI = {
  getAll: () => api.get('/notebook-quote'),
  getById: (id) => api.get(`/notebook-quote/${id}`),
  create: (data) => api.post('/notebook-quote', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  delete: (id) => api.delete(`/notebook-quote/${id}`),
};

// Ledger Register APIs
export const ledgerAPI = {
  getAll: () => api.get('/ledger-register'),
  getById: (id) => api.get(`/ledger-register/${id}`),
  create: (data) => api.post('/ledger-register', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  delete: (id) => api.delete(`/ledger-register/${id}`),
};

// Letterhead APIs
export const letterheadAPI = {
  getAll: () => api.get('/letterhead'),
  getById: (id) => api.get(`/letterhead/${id}`),
  create: (data) => api.post('/letterhead', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  delete: (id) => api.delete(`/letterhead/${id}`),
};

// Shopping Bags APIs
export const shoppingBagsAPI = {
  getAll: () => api.get('/shopping-bags'),
  getById: (id) => api.get(`/shopping-bags/${id}`),
  create: (data) => api.post('/shopping-bags', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  delete: (id) => api.delete(`/shopping-bags/${id}`),
};

export default api;
