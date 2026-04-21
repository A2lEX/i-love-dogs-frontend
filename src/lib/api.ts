import axios from 'axios';

// Create a configured axios instance
export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'https://i-love-dog-api.girsa.ru/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('authToken');
      if (token) {
        // Use .set() for Axios 1.x compatibility
        config.headers.set('Authorization', `Bearer ${token}`);
        console.log(`[API] Attached token to ${config.url}`);
      } else {
        console.warn(`[API] No token found for ${config.url}`);
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for automatic error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Logic for handling unauthorized, e.g., redirecting to login or clearing token
      if (typeof window !== 'undefined') {
        localStorage.removeItem('authToken');
        // Optionally trigger a custom event that components can listen to
        window.dispatchEvent(new Event('auth:unauthorized'));
      }
    }
    return Promise.reject(error);
  }
);
