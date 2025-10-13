import { create } from "zustand";

type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: "ADMIN";
  token: string;
};

type AuthState = {
  user: AdminUser | null;
  isInitialized: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  setAuth: (user: AdminUser) => void;
  initializeAuth: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isInitialized: false,

  initializeAuth: () => {
    if (typeof window === "undefined") return; // Server-side check
    
    try {
      const token = localStorage.getItem("admin_token");
      const id = localStorage.getItem("admin_id");
      const email = localStorage.getItem("admin_email");
      const role = localStorage.getItem("admin_role");
      const name = localStorage.getItem("admin_name");
      
      if (token && id && email && role && name && role === "ADMIN") {
        const user: AdminUser = {
          id,
          name,
          email,
          role: role as "ADMIN",
          token
        };
        
        set({ user, isInitialized: true });
      } else {
        set({ isInitialized: true });
      }
    } catch (error) {
      console.error("Error initializing admin auth:", error);
      set({ isInitialized: true });
    }
  },

  login: async (email: string, password: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_ADMIN_API_URL || 'http://localhost:4001'}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || "Login failed");
      }

      const { token, user: userData } = data.data;
      
      const user: AdminUser = {
        id: userData.id,
        name: userData.name,
        email: userData.email,
        role: userData.role,
        token
      };

      // Save admin data
      localStorage.setItem("admin_token", token);
      localStorage.setItem("admin_id", user.id);
      localStorage.setItem("admin_name", user.name);
      localStorage.setItem("admin_email", user.email);
      localStorage.setItem("admin_role", user.role);

      set({ user });
    } catch (error) {
      console.error("Admin login error:", error);
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_id");
    localStorage.removeItem("admin_name");
    localStorage.removeItem("admin_email");
    localStorage.removeItem("admin_role");
    set({ user: null });
  },

  setAuth: (user: AdminUser) => set({ user }),
}));

export const useAdminAuth = () => {
  const { user, login, logout, initializeAuth, isInitialized } = useAuthStore();
  return { user, login, logout, initializeAuth, isInitialized };
};
