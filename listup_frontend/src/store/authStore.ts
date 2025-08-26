import { create } from "zustand";
import api from "@/utils/axios";
import { log } from "console";

type User = {
  id: string;
  name: string;
  email: string;
  role: "user" | "vendor";
  token: string;
};

type AuthState = {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (userData: any) => Promise<void>;
  logout: () => void;
  setAuth: (user: any) => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,

  login: async (email, password) => {
    const res = await api.post("/auth/login", { email, password });

    
    const userData: User = {
      id: res.data.id,
      name: res.data.name,
      email: res.data.email,
      role: res.data.role as "user" | "vendor", // 🔑 enforce type
      token: res.data.token,
    };


    // Save user data for interceptors and easy access
    localStorage.setItem("token", userData.token);
    localStorage.setItem("id", userData.id);
    localStorage.setItem("email", userData.email);

    set({ user: userData });
  },

  signup: async (userData) => {
    const res = await api.post("/auth/register", userData);
    
    const user: User = {
      id: res.data.id || "",
      name: userData.name,
      email: userData.email,
      role: userData.role.toLowerCase() as "user" | "vendor",
      token: res.data.token,
    };

    // Save user data for interceptors and easy access
    localStorage.setItem("token", user.token);
    localStorage.setItem("id", user.id);
    localStorage.setItem("email", user.email);

    set({ user });
  },

  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("id");
    localStorage.removeItem("email");
    set({ user: null });
  },
  setAuth: (user) => set({ user}),
}));

export const useAuth = () => {
  const { user, login, logout } = useAuthStore();
  return { user, login, logout };
};
