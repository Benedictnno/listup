import { create } from "zustand";
import api from "@/utils/axios";

type User = {
  id: string;
  name: string;
  email: string;
  role: "USER" | "VENDOR";
  phone?: string;
  token: string;
  vendorProfile?: {
    storeName: string;
    storeAddress: string;
    businessCategory: string;
  };
};

type AuthState = {
  user: User | null;
  isInitialized: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (userData: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    role?: string;
    storeName?: string;
    storeAddress?: string;
    businessCategory?: string;
  }) => Promise<void>;
  logout: () => void;
  setAuth: (user: User) => void;
  initializeAuth: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isInitialized: false,

  initializeAuth: () => {
    if (typeof window === "undefined") return; // Server-side check
    
    try {
      const token = localStorage.getItem("token");
      const id = localStorage.getItem("id");
      const email = localStorage.getItem("email");
      const role = localStorage.getItem("role");
      const name = localStorage.getItem("name");
      
      if (token && id && email && role && name) {
        const user: User = {
          id,
          name,
          email,
          role: role.toUpperCase() as "USER" | "VENDOR",
          phone: localStorage.getItem("phone") || undefined,
          token,
          ...(localStorage.getItem("storeName") && {
            vendorProfile: {
              storeName: localStorage.getItem("storeName") || "",
              storeAddress: localStorage.getItem("storeAddress") || "",
              businessCategory: localStorage.getItem("businessCategory") || ""
            }
          })
        };
        
        set({ user, isInitialized: true });
      } else {
        set({ isInitialized: true });
      }
    } catch (error) {
      console.error("Error initializing auth:", error);
      set({ isInitialized: true });
    }
  },

  login: async (email: string, password: string) => {
    try {
      const response = await api.post("/auth/login", { email, password });
      
      if (!response.data.success) {
        throw new Error(response.data.message || "Login failed");
      }

      const { token, user: userData } = response.data.data;
      
      const user: User = {
        id: userData.id,
        name: userData.name,
        email: userData.email,
        role: userData.role.toUpperCase() as "USER" | "VENDOR",
        phone: userData.phone,
        token,
        ...(userData.vendorProfile && {
          vendorProfile: userData.vendorProfile
        })
      };

      // Save user data for interceptors and easy access
      localStorage.setItem("token", token);
      localStorage.setItem("id", user.id);
      localStorage.setItem("name", user.name);
      localStorage.setItem("email", user.email);
      localStorage.setItem("role", user.role);
      if (user.phone) localStorage.setItem("phone", user.phone);
      if (user.vendorProfile) {
        localStorage.setItem("storeName", user.vendorProfile.storeName);
        localStorage.setItem("storeAddress", user.vendorProfile.storeAddress);
        localStorage.setItem("businessCategory", user.vendorProfile.businessCategory);
      }

      set({ user });
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  },

  signup: async (userData) => {
    try {
      const response = await api.post("/auth/register", userData);
      
      if (!response.data.success) {
        throw new Error(response.data.message || "Signup failed");
      }

      const { token, user: userResponse } = response.data.data;
      
      const user: User = {
        id: userResponse.id,
        name: userResponse.name,
        email: userResponse.email,
        role: userResponse.role.toUpperCase() as "USER" | "VENDOR",
        phone: userResponse.phone,
        token,
        ...(userResponse.vendorProfile && {
          vendorProfile: userResponse.vendorProfile
        })
      };

      // Save user data for interceptors and easy access
      localStorage.setItem("token", token);
      localStorage.setItem("id", user.id);
      localStorage.setItem("name", user.name);
      localStorage.setItem("email", user.email);
      localStorage.setItem("role", user.role);
      if (user.phone) localStorage.setItem("phone", user.phone);
      if (user.vendorProfile) {
        localStorage.setItem("storeName", user.vendorProfile.storeName);
        localStorage.setItem("storeAddress", user.vendorProfile.storeAddress);
        localStorage.setItem("businessCategory", user.vendorProfile.businessCategory);
      }

      set({ user });
    } catch (error) {
      console.error("Signup error:", error);
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("id");
    localStorage.removeItem("name");
    localStorage.removeItem("email");
    localStorage.removeItem("role");
    localStorage.removeItem("phone");
    localStorage.removeItem("storeName");
    localStorage.removeItem("storeAddress");
    localStorage.removeItem("businessCategory");
    set({ user: null });
  },

  setAuth: (user: User) => set({ user }),
}));

export const useAuth = () => {
  const { user, login, logout } = useAuthStore();
  return { user, login, logout };
};
