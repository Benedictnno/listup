import axios from 'axios';

const BASE_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001/api';

export const api = axios.create({
  baseURL: BASE_API_URL,
  withCredentials: true, // Cookie-based authentication
  headers: { 'Content-Type': 'application/json' },
});

// Response interceptor for handling errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle specific error codes
    if (error.response) {
      const { status } = error.response;

      // Handle 401 Unauthorized - redirect to login
      if (status === 401) {
        if (typeof window !== 'undefined') {
          window.location.href = '/';
        }
      }
    }

    return Promise.reject(error);
  }
);