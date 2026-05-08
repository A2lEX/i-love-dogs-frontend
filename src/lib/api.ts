import axios from 'axios';

// Create a configured axios instance
export const api = axios.create({
  baseURL: '/api/v1',
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

// Request interceptor to attach region/country filter
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const match = document.cookie.match(/(?:^|; )x-country=([^;]*)/);
      const country = match ? decodeURIComponent(match[1]) : null;
      if (country && config.url) {
        if (config.url.includes('/dogs')) {
          config.params = { ...config.params, country };
        }
      }
    }
    return config;
  },
  (error) => Promise.reject(error),
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
