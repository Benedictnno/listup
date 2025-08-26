import api from "@/utils/axios";

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
    const response = await api.get('/settings');
    return response.data;
  },

  // Update store settings
  updateStoreSettings: async (data: StoreSettings) => {
    const response = await api.put('/settings/store', data);
    return response.data;
  },

  // Update personal information
  updatePersonalInfo: async (data: PersonalInfo) => {
    const response = await api.put('/settings/personal', data);
    return response.data;
  },

  // Update password
  updatePassword: async (data: SecuritySettings) => {
    const response = await api.put('/settings/password', data);
    return response.data;
  },

  // Update notification settings
  updateNotificationSettings: async (data: NotificationSettings) => {
    const response = await api.put('/settings/notifications', data);
    return response.data;
  },

  // Update user preferences
  updateUserPreferences: async (data: UserPreferences) => {
    const response = await api.put('/settings/preferences', data);
    return response.data;
  },

  // Update store preferences
  updateStorePreferences: async (data: StorePreferences) => {
    const response = await api.put('/settings/store-preferences', data);
    return response.data;
  },

  // Upload profile image
  uploadProfileImage: async (data: ImageUpload) => {
    const response = await api.put('/settings/profile-image', data);
    return response.data;
  },

  // Upload store image
  uploadStoreImage: async (data: ImageUpload) => {
    const response = await api.put('/settings/store-image', data);
    return response.data;
  },

  // Get user profile (alternative endpoint)
  getUserProfile: async () => {
    const response = await api.get('/users/profile');
    return response.data;
  },

  // Update user profile (alternative endpoint)
  updateUserProfile: async (data: PersonalInfo) => {
    const response = await api.put('/users/profile', data);
    return response.data;
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
