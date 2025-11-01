'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';

export default function LogoutPage() {
  const { logout } = useAuth();
  const router = useRouter();
  const toast = useToast();

  useEffect(() => {
    const performLogout = async () => {
      try {
        await logout();
        toast.success('You have been logged out successfully');
      } catch (error) {
        toast.error('An error occurred during logout');
      } finally {
        router.push('/login');
      }
    };

    performLogout();
  }, [logout, router, toast]);

  return (
    <div className="flex h-screen w-full items-center justify-center">
      <div className="flex flex-col items-center space-y-4">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-primary"></div>
        <p className="text-sm text-muted-foreground">Logging out...</p>
      </div>
    </div>
  );
}