"use client"
import api from "@/utils/axios";

// Define proper types for ad data
interface AdData {
  type: string;
  startDate: string;
  endDate: string;
  vendorId: string;
  amount: number;
  status: string;
  paymentStatus: string;
  storeId?: string;
  productId?: string;
  appliesToAllProducts?: boolean;
}

// Ads
export const fetchActiveAds = async () => {
  try {
    console.log("🔄 Fetching active ads...");
    const response = await api.get("/ads/active");
    console.log(`✅ Fetched ${response.data.length} active ads`);
    return response.data;
  } catch (error) {
    console.error("❌ Error fetching active ads:", error);
    throw new Error("Failed to fetch active ads");
  }
};

export const createAd = async (adData: AdData) => {
  try {
    console.log("🚀 Creating ad with data:", adData);
    const response = await api.post("/ads", adData);
    
    console.log("✅ Ad created successfully:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Error creating ad:", error);
    throw new Error("Failed to create ad");
  }
};

export const fetchAdById = async (adId: string) => {
  try {
    console.log(`🔍 Fetching ad by ID: ${adId}`);
    const response = await api.get(`/ads/${adId}`);
    console.log("✅ Ad fetched successfully:", response.data);
    return response.data;
  } catch (error) {
    console.error(`❌ Error fetching ad ${adId}:`, error);
    throw new Error("Failed to fetch ad");
  }
};

export const fetchVendorAds = async (vendorId: string) => {
  try {
    console.log(`🔍 Fetching ads for vendor: ${vendorId}`);
    const response = await api.get(`/ads/vendor/${vendorId}`);
    
    console.log(`✅ Fetched ${response.data.length} ads for vendor`);
    return response.data;
  } catch (error) {
    console.error(`❌ Error fetching vendor ads:`, error);
    throw new Error("Failed to fetch vendor ads");
  }
};

export default api;
export const fetchAdPlans = async () => {
  const { data } = await api.get("/adPlans");
  return data;
};