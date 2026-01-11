import type { AxiosInstance } from 'axios';
import axios from 'axios';

const API_PORT = import.meta.env.VITE_API_PORT || '5258';
const API_PORT_SPRING = import.meta.env.VITE_API_PORT_SPRING || '8080';

// Axios instance cho .NET backend
const apiDotNet = axios.create({
  baseURL: `http://localhost:${API_PORT}/api/v1`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Axios instance cho Spring backend
const apiSpring = axios.create({
  baseURL: `http://localhost:${API_PORT_SPRING}/api/v1`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Helper function để setup interceptors
const setupInterceptors = (axiosInstance: AxiosInstance) => {
  // Request interceptor để thêm auth token
  axiosInstance.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('accessToken');
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
  axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        // Handle unauthorized access
        localStorage.removeItem('accessToken');
        window.location.href = '/login';
      }
      else if(error.response?.status === 403){
        // Handle forbidden access
        window.location.href = '/forbidden';
      }
      return Promise.reject(error);
    }
  );
};

// Setup interceptors cho tất cả instances
setupInterceptors(apiDotNet);
setupInterceptors(apiSpring);

// Export các instances
export { apiDotNet, apiSpring };
