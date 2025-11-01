'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation'; 
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { cn } from '@/lib/utils';
import { useResponsive } from './ResponsiveUtils';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { isMobile, isTablet, windowSize } = useResponsive();
  const pathname = usePathname();

  // Handle responsive behavior
  useEffect(() => {
    // Automatically close sidebar on mobile and open on desktop
    setSidebarOpen(!isMobile);
  }, [isMobile, windowSize?.width]);

  // Close sidebar on mobile when navigating
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [pathname, isMobile]);

  // Handle theme preference
  useEffect(() => {
    // Check for dark mode preference
    const isDarkMode = localStorage.getItem('darkMode') === 'true' || 
                      window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  return (
    <div className="h-screen flex overflow-hidden bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        
        {/* Page Content */}
        <main 
          className={cn(
            "flex-1 overflow-y-auto overflow-x-hidden bg-gray-50 dark:bg-gray-900 transition-all duration-300",
            sidebarOpen ? "lg:ml" : "lg:"
          )}
        >
          <div className="container mx-auto px-4 py-6 max-w-7xl">
            {children}
          </div>
        </main>
        <footer className="py-4 px-6 border-t border-gray-200 dark:border-gray-800 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>© {new Date().getFullYear()} ListUp Admin Dashboard. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
}