'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  ShoppingBag, 
  Tag, 
  Settings, 
  BarChart3, 
  LogOut, 
  ChevronRight, 
  Menu, 
  X 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Button  from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface SidebarProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

interface NavItem {
  title: string;
  href: string;
  icon: React.ReactNode;
  submenu?: { title: string; href: string }[];
}

export default function Sidebar({ open, setOpen }: SidebarProps) {
  const pathname = usePathname();
  const [expandedItem, setExpandedItem] = useState<string | null>(null);

  const navItems: NavItem[] = [
    {
      title: 'Dashboard',
      href: '/dashboard',
      icon: <LayoutDashboard className="h-5 w-5" />,
    },
    {
      title: 'Users',
      href: '/users',
      icon: <Users className="h-5 w-5" />,
    },
    {
      title: 'Listings',
      href: '/dashboard/listings',
      icon: <ShoppingBag className="h-5 w-5" />,
    },
    {
      title: 'Addresses',
      href: '/dashboard/addresses',
      icon: <ShoppingBag className="h-5 w-5" />,
    },
    {
      title: 'Categories',
      href: '/dashboard/categories',
      icon: <ShoppingBag className="h-5 w-5" />,
    },
    {
      title: 'Vendors',
      href: '/dashboard/vendors',
      icon: <Tag className="h-5 w-5" />,
    },
    {
      title: 'Analytics',
      href: '/analytics',
      icon: <BarChart3 className="h-5 w-5" />,
    },
    {
      title: 'Settings',
      href: '/settings',
      icon: <Settings className="h-5 w-5" />,
    },
  ];

  const toggleSubmenu = (title: string) => {
    setExpandedItem(expandedItem === title ? null : title);
  };

  const isActive = (href: string) => {
    return pathname === href || pathname.startsWith(href + '/');
  };

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col bg-white border-r border-gray-200 transition-all duration-300 ease-in-out",
          open ? "w-64" : "w-20",
          !open && "items-center",
          "lg:relative lg:z-auto"
        )}
      >
        {/* Logo and toggle */}
        <div className={cn(
          "flex items-center h-16 px-4 border-b border-gray-200",
          !open && "justify-center"
        )}>
          {open ? (
            <div className="flex items-center">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-md bg-lime-500 flex items-center justify-center">
                  <span className="text-white font-bold">L</span>
                </div>
                <span className="text-xl font-semibold">ListUp</span>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                className="ml-auto lg:hidden"
                onClick={() => setOpen(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          ) : (
            <div className="h-8 w-8 rounded-md bg-lime-500 flex items-center justify-center">
              <span className="text-white font-bold">L</span>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-2">
            {navItems.map((item) => (
              <li key={item.title}>
                <TooltipProvider delayDuration={300}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div>
                        <Link
                          href={item.href}
                          className={cn(
                            "flex items-center h-10 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                            isActive(item.href) 
                              ? "bg-gray-100 text-lime-600" 
                              : "text-gray-700 hover:bg-gray-100 hover:text-lime-600",
                            !open && "justify-center"
                          )}
                          onClick={(e) => {
                            if (item.submenu && item.submenu.length > 0) {
                              e.preventDefault();
                              toggleSubmenu(item.title);
                            }
                          }}
                        >
                          <span className="flex items-center">
                            {item.icon}
                            {open && <span className="ml-3">{item.title}</span>}
                          </span>
                          {open && item.submenu && item.submenu.length > 0 && (
                            <ChevronRight 
                              className={cn(
                                "ml-auto h-4 w-4 transition-transform",
                                expandedItem === item.title && "transform rotate-90"
                              )} 
                            />
                          )}
                        </Link>
                      </div>
                    </TooltipTrigger>
                    {!open && (
                      <TooltipContent side="right">
                        {item.title}
                      </TooltipContent>
                    )}
                  </Tooltip>
                </TooltipProvider>

                {/* Submenu */}
                {open && item.submenu && expandedItem === item.title && (
                  <ul className="mt-1 pl-10 space-y-1">
                    {item.submenu.map((subItem) => (
                      <li key={subItem.title}>
                        <Link
                          href={subItem.href}
                          className={cn(
                            "flex items-center h-8 text-sm font-medium transition-colors",
                            isActive(subItem.href)
                              ? "text-lime-600"
                              : "text-gray-600 hover:text-lime-600"
                          )}
                        >
                          {subItem.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </nav>

        {/* Footer */}
        <div className={cn(
          "p-4 border-t border-gray-200",
          !open && "flex justify-center"
        )}>
          <Button 
            variant="ghost" 
            size={open ? "default" : "icon"} 
            className={cn(
              "w-full text-red-500 hover:text-red-600 hover:bg-red-50",
              !open && "w-auto"
            )}
          >
            <LogOut className="h-5 w-5" />
            {open && <span className="ml-2">Logout</span>}
          </Button>
        </div>
      </aside>
    </>
  );
}