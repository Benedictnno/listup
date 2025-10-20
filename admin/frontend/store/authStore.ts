"use client";

import { useEffect, useState } from "react";

export interface AdminUser {
  id?: string;
  name?: string;
  email?: string;
  role?: string;
}

interface AuthState {
  user: AdminUser | null;
  isInitialized: boolean;
  login: (token: string, user?: AdminUser) => void;
  logout: () => void;
}

export function useAdminAuth(): AuthState {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("admin_token") : null;
      const raw = typeof window !== "undefined" ? localStorage.getItem("admin_user") : null;
      if (token && raw) {
        const parsed = JSON.parse(raw);
        setUser(parsed);
      } else {
        setUser(null);
      }
    } catch (e) {
      setUser(null);
    } finally {
      setIsInitialized(true);
    }
  }, []);

  const login = (token: string, nextUser?: AdminUser) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("admin_token", token);
      if (nextUser) {
        localStorage.setItem("admin_user", JSON.stringify(nextUser));
        setUser(nextUser);
      }
    }
  };

  const logout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("admin_token");
      localStorage.removeItem("admin_user");
    }
    setUser(null);
  };

  return { user, isInitialized, login, logout };
}