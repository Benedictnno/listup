import axios from 'axios';

const BASE_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001/api';

export const api = axios.create({
  baseURL: BASE_API_URL,
  withCredentials: true, // set if backend uses cookies for JWT
  headers: { 'Content-Type': 'application/json' },
});

// Interceptor for attaching token if stored in localStorage
api.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

// Response interceptor for handling errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle specific error codes
    if (error.response) {
      const { status } = error.response;
      
      // Handle 401 Unauthorized - redirect to login
      if (status === 401) {
        localStorage.removeItem('accessToken');
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
      }
    }
    
    return Promise.reject(error);
  }
);