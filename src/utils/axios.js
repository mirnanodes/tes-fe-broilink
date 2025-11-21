import axios from 'axios';

// Helper function to get cookie value
const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return decodeURIComponent(parts.pop().split(';').shift());
  return null;
};

// Create axios instance with base configuration
// IMPORTANT: baseURL is empty because we use Vite Proxy
// All requests go through localhost:5173 and get proxied to localhost:8000
const axiosInstance = axios.create({
  baseURL: '', // Empty - services already have /api prefix, Vite proxy handles the rest
  timeout: import.meta.env.VITE_API_TIMEOUT || 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  withCredentials: true, // CRITICAL: Enables cookies for CSRF
  withXSRFToken: true    // CRITICAL: Auto-send XSRF token
});

// Request interceptor - adds Bearer token and XSRF token to all requests
axiosInstance.interceptors.request.use(
  (config) => {
    // Add Bearer token
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Add XSRF token from cookie
    const xsrfToken = getCookie('XSRF-TOKEN');
    if (xsrfToken) {
      config.headers['X-XSRF-TOKEN'] = xsrfToken;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handles 401 unauthorized globally
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear stored auth data
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('userRole');
      // Redirect to login
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// CSRF Cookie Fetcher
// MUST be called BEFORE login to get CSRF token
// Uses Vite Proxy to avoid CORS
export const getCsrfCookie = async () => {
  try {
    await axios.get('/sanctum/csrf-cookie', {
      withCredentials: true
    });
    console.log('CSRF cookie fetched successfully');
    // Wait a bit for cookie to be set
    await new Promise(resolve => setTimeout(resolve, 100));
  } catch (error) {
    console.error('Failed to fetch CSRF cookie:', error);
    throw error;
  }
};

export default axiosInstance;
