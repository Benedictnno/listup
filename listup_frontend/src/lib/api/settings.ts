import { safeLocalStorage } from "@/utils/helpers";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

// Helper function to get token safely
const getToken = () => {
  try {
    return safeLocalStorage.getItem("token");
  } catch (error) {
    console.error("Error getting token:", error);
    return null;
  }
};

// Helper function to make authenticated API calls
const makeAuthenticatedRequest = async (endpoint: string, options: RequestInit = {}) => {
  const token = getToken();
  
  if (!token) {
    throw new Error('No authentication token found');
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }

  return response.json();
};

// Types for settings data
export interface StoreSettings {
  storeName: string;
  storeDescription?: string;
  businessCategory: string;
  storeAddress: string;
  website?: string;
  businessHours?: {
    monday: { open: string; close: string; closed: boolean };
    tuesday: { open: string; close: string; closed: boolean };
    wednesday: { open: string; close: string; closed: boolean };
    thursday: { open: string; close: string; closed: boolean };
    friday: { open: string; close: string; closed: boolean };
    saturday: { open: string; close: string; closed: boolean };
    sunday: { open: string; close: string; closed: boolean };
  };
  socialMedia?: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    linkedin?: string;
  };
}

export interface PersonalInfo {
  name: string;
  phone?: string;
  profileImage?: string;
  bio?: string;
  dateOfBirth?: string;
  gender?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
}

export interface SecuritySettings {
  currentPassword: string;
  newPassword: string;
}

export interface NotificationSettings {
  orderUpdates: boolean;
  newMessages: boolean;
  lowStockAlerts: boolean;
  paymentNotifications: boolean;
  marketingEmails: boolean;
  weeklyReports: boolean;
  monthlyReports: boolean;
  emailNotifications: boolean;
  smsNotifications: boolean;
}

export interface UserPreferences {
  language: string;
  timezone: string;
  currency: string;
  dateFormat: string;
  theme: 'light' | 'dark' | 'auto';
}

export interface StorePreferences {
  autoSave: boolean;
  emailDigest: boolean;
}

export interface ImageUpload {
  imageUrl: string;
  imageType?: 'logo' | 'cover';
}

// API functions
export const settingsApi = {
  // Get all user settings
  getUserSettings: async () => {
    return makeAuthenticatedRequest('/settings');
  },

  // Update store settings
  updateStoreSettings: async (data: StoreSettings) => {
    return makeAuthenticatedRequest('/settings/store', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Update personal information
  updatePersonalInfo: async (data: PersonalInfo) => {
    return makeAuthenticatedRequest('/settings/personal', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Update password
  updatePassword: async (data: SecuritySettings) => {
    return makeAuthenticatedRequest('/settings/password', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Update notification settings
  updateNotificationSettings: async (data: NotificationSettings) => {
    return makeAuthenticatedRequest('/settings/notifications', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Update user preferences
  updateUserPreferences: async (data: UserPreferences) => {
    return makeAuthenticatedRequest('/settings/preferences', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Update store preferences
  updateStorePreferences: async (data: StorePreferences) => {
    return makeAuthenticatedRequest('/settings/store-preferences', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Upload profile image
  uploadProfileImage: async (data: ImageUpload) => {
    return makeAuthenticatedRequest('/settings/profile-image', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Upload store image
  uploadStoreImage: async (data: ImageUpload) => {
    return makeAuthenticatedRequest('/settings/store-image', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Get user profile (alternative endpoint)
  getUserProfile: async () => {
    return makeAuthenticatedRequest('/users/profile');
  },

  // Update user profile (alternative endpoint)
  updateUserProfile: async (data: PersonalInfo) => {
    return makeAuthenticatedRequest('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
};

// Export individual functions for convenience
export const {
  getUserSettings,
  updateStoreSettings,
  updatePersonalInfo,
  updatePassword,
  updateNotificationSettings,
  updateUserPreferences,
  updateStorePreferences,
  uploadProfileImage,
  uploadStoreImage,
  getUserProfile,
  updateUserProfile,
} = settingsApi;
