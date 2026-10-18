import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach token from localStorage if present
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('placeconnect_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Normalize error messages
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If 401 Unauthorized, token might be invalid/expired
    if (error.response && error.response.status === 401) {
      // If needed, remove token
      // localStorage.removeItem('placeconnect_token');
    }
    return Promise.reject(error);
  }
);

export default api;
