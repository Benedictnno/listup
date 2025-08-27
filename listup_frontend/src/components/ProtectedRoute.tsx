"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireVendor?: boolean;
}

export default function ProtectedRoute({ children, requireVendor = true }: ProtectedRouteProps) {
  const { user, isInitialized } = useAuthStore();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (!isInitialized) return; // Wait for auth to initialize

    if (!user) {
      // User is not logged in, redirect to login
      router.push("/login");
      return;
    }

    if (requireVendor && user.role !== "VENDOR") {
      // User is not a vendor, redirect to home or show error
      router.push("/");
      return;
    }

    // User is authenticated and has proper role
    setIsChecking(false);
  }, [user, isInitialized, requireVendor, router]);

  // Show loading while checking authentication
  if (!isInitialized || isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-lime-600" />
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // If we get here, user is authenticated and authorized
  return <>{children}</>;
}
