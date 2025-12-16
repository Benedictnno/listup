import { create } from "zustand";
import api from "@/utils/axios";

type User = {
  id: string;
  name: string;
  email: string;
  role: "USER" | "VENDOR";
  phone?: string;
  isKYCVerified?: boolean;
  listingLimit?: number;
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

    // Cookie-based auth: ask backend who the current user is
    api
      .get("/auth/me")
      .then((response) => {
        if (!response.data?.success || !response.data?.data) {
          set({ user: null, isInitialized: true });
          return;
        }

        const userData = response.data.data;
        console.log(userData);
        
        const user: User = {
          id: userData.id,
          name: userData.name,
          email: userData.email,
          role: userData.role.toUpperCase() as "USER" | "VENDOR",
          phone: userData.phone,
          isKYCVerified: userData.isKYCVerified,
          listingLimit: userData.listingLimit,
          ...(userData.vendorProfile && {
            vendorProfile: userData.vendorProfile,
          }),
        };

        set({ user, isInitialized: true });
      })
      .catch((error) => {
        // Don't log 401 errors as they're expected for non-logged-in users
        if (error.response?.status !== 401) {
          console.error("Error initializing auth:", error);
        }
        // On 401 or any error, treat as logged out but mark initialized
        set({ user: null, isInitialized: true });
      });
  },

  login: async (email: string, password: string) => {
    try {
      const response = await api.post("/auth/login", { email, password });

      if (!response.data.success) {
        const errorMessage = response.data.message || "Login failed";
        const error: any = new Error(errorMessage);
        error.response = { data: { message: errorMessage } };
        throw error;
      }

      const { user: userData } = response.data.data;

      const user: User = {
        id: userData.id,
        name: userData.name,
        email: userData.email,
        role: userData.role.toUpperCase() as "USER" | "VENDOR",
        phone: userData.phone,
        isKYCVerified: userData.isKYCVerified,
        listingLimit: userData.listingLimit,
        ...(userData.vendorProfile && {
          vendorProfile: userData.vendorProfile,
        }),
      };

      // Backend sets HttpOnly cookie; just keep user in memory
      set({ user });
    } catch (error: any) {
      console.error("Login error:", error);

      // Ensure error has proper structure for the UI to display
      if (!error.response) {
        const enhancedError: any = new Error(error.message || "Login failed");
        enhancedError.response = {
          data: {
            message: error.message || "Invalid email or password. Please try again."
          }
        };
        throw enhancedError;
      }

      throw error;
    }
  },

  signup: async (userData) => {
    try {
      const response = await api.post("/auth/register", userData);

      if (!response.data.success) {
        throw new Error(response.data.message || "Signup failed");
      }

      // Registration successful - NO automatic login!
      // User must verify their email before they can login
      // We don't save any token or user data to localStorage

      return response.data; // Return data for the signup page to handle
    } catch (error) {
      console.error("Signup error:", error);
      throw error;
    }
  },

  logout: () => {
    // Ask backend to clear cookie-based session and then clear client state
    api
      .post("/auth/logout")
      .catch((error) => {
        console.error("Logout error:", error);
      })
      .finally(() => {
        set({ user: null });
      });
  },

  setAuth: (user: User) => set({ user }),
}));

export const useAuth = () => {
  const { user, login, logout } = useAuthStore();
  return { user, login, logout };
};
