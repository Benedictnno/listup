"use client";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export const useAuthGuard = () => {
  const { user } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!user  ) {
      router.push("/login");
    }
  }, [user, router]);
};
export const withAuthGuard = (Component: React.ComponentType) => {
  return (props: any) => {
    useAuthGuard();
    return <Component {...props} />;
  };
};