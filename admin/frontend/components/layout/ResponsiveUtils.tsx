'use client';

import { useEffect, useState } from 'react';

// Custom hook for responsive design
export function useResponsive() {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  });
  
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  
  useEffect(() => {
    // Handler to call on window resize
    function handleResize() {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
      
      // Update device type
      setIsMobile(window.innerWidth < 768);
      setIsTablet(window.innerWidth >= 768 && window.innerWidth < 1024);
      setIsDesktop(window.innerWidth >= 1024);
    }
    
    // Add event listener
    window.addEventListener('resize', handleResize);
    
    // Call handler right away so state gets updated with initial window size
    handleResize();
    
    // Remove event listener on cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  return {
    windowSize,
    isMobile,
    isTablet,
    isDesktop,
    // Utility breakpoint checks
    breakpoints: {
      sm: windowSize.width >= 640,
      md: windowSize.width >= 768,
      lg: windowSize.width >= 1024,
      xl: windowSize.width >= 1280,
      '2xl': windowSize.width >= 1536,
    },
  };
}

// Responsive container component
export function ResponsiveContainer({ 
  children, 
  className = '' 
}: { 
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`w-full px-4 md:px-6 lg:px-8 mx-auto ${className}`}>
      {children}
    </div>
  );
}

// Responsive grid component
export function ResponsiveGrid({ 
  children, 
  cols = { 
    default: 1, 
    sm: 2, 
    md: 3, 
    lg: 4 
  },
  gap = 4,
  className = ''
}: { 
  children: React.ReactNode;
  cols?: {
    default: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  gap?: number;
  className?: string;
}) {
  // Build grid template columns based on breakpoints
  const gridColsClass = `grid-cols-${cols.default} ${
    cols.sm ? `sm:grid-cols-${cols.sm}` : ''
  } ${
    cols.md ? `md:grid-cols-${cols.md}` : ''
  } ${
    cols.lg ? `lg:grid-cols-${cols.lg}` : ''
  } ${
    cols.xl ? `xl:grid-cols-${cols.xl}` : ''
  }`;
  
  return (
    <div className={`grid ${gridColsClass} gap-${gap} ${className}`}>
      {children}
    </div>
  );
}