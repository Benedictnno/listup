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
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,

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
      localStorage.setItem("email", user.email);
      localStorage.setItem("role", user.role);

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
      localStorage.setItem("email", user.email);
      localStorage.setItem("role", user.role);

      set({ user });
    } catch (error) {
      console.error("Signup error:", error);
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("id");
    localStorage.removeItem("email");
    localStorage.removeItem("role");
    set({ user: null });
  },

  setAuth: (user: User) => set({ user }),
}));

export const useAuth = () => {
  const { user, login, logout } = useAuthStore();
  return { user, login, logout };
};
