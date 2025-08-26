// lib/axios.ts
"use client";

import axios from "axios";

// Get base URL from environment variable, with proper fallback
const getBaseURL = () => {
  const envURL = process.env.NEXT_PUBLIC_API_URL;
  if (envURL) {
    // If the env URL already ends with /api, use it as is
    if (envURL.endsWith('/api')) {
      return envURL;
    }
    // If it doesn't end with /api, append it
    return envURL.endsWith('/') ? `${envURL}api` : `${envURL}/api`;
  }
  // Fallback to localhost
  return "http://localhost:4000/api";
};

const api = axios.create({
  baseURL: getBaseURL(),
  headers: {
    "Content-Type": "application/json",
  },
});

// Optional: attach token automatically if in localStorage or Zustand
api.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token"); // or from Zustand
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
