"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import SavedListings from "@/components/SavedListings";

export default function SavedPage() {
  const { user, isInitialized } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isInitialized) return; // wait for auth to be initialized

    if (!user) {
      // not logged in -> send to login
      router.push("/login");
      return;
    }

    if (user.role !== "USER") {
      // not a plain user -> not allowed here
      router.push("/");
      return;
    }
  }, [user, isInitialized, router]);

  // while auth is initializing show a spinner
  if (!isInitialized || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-lime-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // At this point user exists and is a USER
  return (
    <div className="p-4 md:p-6">
      <h1 className="text-2xl font-semibold mb-4">Saved posts</h1>
      <SavedListings />
    </div>
  );
}
