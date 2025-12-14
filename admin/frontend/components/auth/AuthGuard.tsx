"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { fetchCurrentUser } from "@/features/auth/authSlice";

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const dispatch = useDispatch();
  const { isAuthenticated, isLoading, user } = useSelector((state: RootState) => state.auth);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      // If we are already authenticated, we are good
      if (isAuthenticated && user) {
        setIsChecking(false);
        return;
      }

      // Try to fetch the current user (relies on HttpOnly cookie)
      try {
        await dispatch(fetchCurrentUser() as any).unwrap();
        // If successful, the store will update, and we stop checking
        setIsChecking(false);
      } catch (error) {
        // If failed, redirect to login
        router.push("/");
      }
    };

    checkAuth();
  }, [dispatch, isAuthenticated, user, router]);

  // Show loading spinner while checking authentication or if redux is loading
  if (isChecking || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lime-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If not authenticated (and not loading), don't render children
  if (!isAuthenticated) {
    return null;
  }

  // If authenticated, render children
  return <>{children}</>;
}