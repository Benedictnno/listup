// lib/axios.ts
"use client";

import axios from "axios";

// Get base URL from environment variable, with proper fallback
const getBaseURL = () => {
  // Use environment variable or fallback to your actual backend domain
  return process.env.NEXT_PUBLIC_API_URL || "https://listup-api.onrender.com/api";
};

const api = axios.create({
  baseURL: getBaseURL(),
  headers: {
    "Content-Type": "application/json",
  },
  // Use cookie-based auth (HttpOnly cookies set by the backend)
  withCredentials: true,
});

// Add response interceptor to handle errors properly
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Ensure error has proper structure
    if (error.response) {
      // Server responded with error status
      const message = error.response.data?.message || error.response.data?.error || "An error occurred";
      error.message = message;
    } else if (error.request) {
      // Request was made but no response received
      error.message = "Network error. Please check your connection and try again.";
    } else {
      // Something else happened
      error.message = error.message || "An unexpected error occurred";
    }
    
    return Promise.reject(error);
  }
);

export default api;
