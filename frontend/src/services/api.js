import axios from 'axios';

const API_BASE_URL = '/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for injecting JWT Bearer Token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('hotel_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for handling 401 Unauthorized globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('hotel_token');
      localStorage.removeItem('hotel_user');
      if (window.location.pathname.startsWith('/admin') || window.location.pathname.startsWith('/profile') || window.location.pathname.startsWith('/my-bookings')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
