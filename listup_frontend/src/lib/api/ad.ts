"use client"
import axios from "axios";
import { safeLocalStorage } from "../../utils/helpers";

const api = axios.create({
  baseURL: "http://localhost:4000/api",
  withCredentials: true,
});

// Helper function to get token safely
const getToken = () => {
  try {
    return safeLocalStorage.getItem("token");
  } catch (error) {
    console.error("Error getting token:", error);
    return null;
  }
};

// Ads
export const fetchActiveAds = async () => {
  try {
    console.log("🔄 Fetching active ads...");
    const response = await api.get("/ads/active");
    console.log(`✅ Fetched ${response.data.length} active ads`);
    return response.data;
  } catch (error) {
    console.error("❌ Error fetching active ads:", error);
    if (axios.isAxiosError(error)) {
      console.error("Response data:", error.response?.data);
      console.error("Response status:", error.response?.status);
    }
    throw new Error("Failed to fetch active ads");
  }
};

export const createAd = async (adData: any) => {
  try {
    const token = getToken();
    if (!token) {
      throw new Error("No authentication token found");
    }

    console.log("🚀 Creating ad with data:", adData);
    const response = await api.post("/ads", adData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log("✅ Ad created successfully:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Error creating ad:", error);
    if (axios.isAxiosError(error)) {
      console.error("Response data:", error.response?.data);
      console.error("Response status:", error.response?.status);
      
      // Return user-friendly error message
      const errorMessage = error.response?.data?.message || "Failed to create ad";
      throw new Error(errorMessage);
    }
    throw new Error("Failed to create ad");
  }
};

export const fetchAdById = async (adId: string) => {
  try {
    const token = getToken();
    if (!token) {
      throw new Error("No authentication token found");
    }

    console.log(`🔍 Fetching ad by ID: ${adId}`);
    const response = await api.get(`/ads/${adId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log("✅ Ad fetched successfully:", response.data);
    return response.data;
  } catch (error) {
    console.error(`❌ Error fetching ad ${adId}:`, error);
    if (axios.isAxiosError(error)) {
      console.error("Response data:", error.response?.data);
      console.error("Response status:", error.response?.status);
    }
    throw new Error("Failed to fetch ad");
  }
};

export const fetchVendorAds = async (vendorId: string) => {
  try {
    const token = getToken();
    if (!token) {
      throw new Error("No authentication token found");
    }

    console.log(`🔍 Fetching ads for vendor: ${vendorId}`);
    const response = await api.get(`/ads/vendor/${vendorId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log(`✅ Fetched ${response.data.length} ads for vendor`);
    return response.data;
  } catch (error) {
    console.error(`❌ Error fetching vendor ads:`, error);
    if (axios.isAxiosError(error)) {
      console.error("Response data:", error.response?.data);
      console.error("Response status:", error.response?.status);
    }
    throw new Error("Failed to fetch vendor ads");
  }
};

export default api;
export const fetchAdPlans = async () => {
  const { data } = await api.get("/adPlans");
  return data;
};