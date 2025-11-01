'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { TopNav } from '@/components/layout/TopNav';
import Sidebar from '@/components/layout/Sidebar';
import { AuthGuard } from '@/components/auth/AuthGuard';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Start with sidebar closed on mobile, open on desktop
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    // Set initial sidebar state based on screen size
    const handleResize = () => {
      setSidebarOpen(window.innerWidth >= 1024);
    };
    
    // Set initial state
    handleResize();
    
    // Listen for resize events
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
<AuthGuard>
      <div className="flex h-screen overflow-hidden">
        <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
        
        <div className="flex flex-1 flex-col overflow-hidden">
          <TopNav onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
          
          <main className="flex-1 overflow-auto p-4 md:p-6">
            <div className="w-full h-full">
              {children}
            </div>
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}