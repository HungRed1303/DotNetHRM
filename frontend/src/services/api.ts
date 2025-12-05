import axios from 'axios';

const API_PORT = import.meta.env.VITE_API_PORT || '5258';
const api = axios.create({
  baseURL: `http://localhost:${API_PORT}/api/v1`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor để thêm auth token
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

// Response interceptor để handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
