'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { Bell, Menu, Search, Settings, User } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Button  from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Image from 'next/image';

interface TopNavProps {
  onMenuToggle: () => void;
}

export function TopNav({ onMenuToggle }: TopNavProps) {
  const { user, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Implement search functionality
    console.log('Searching for:', searchQuery);
  };

  return (
    <div className="border-b bg-white shadow-sm">
      <div className="flex h-16 items-center px-4">
        {/* Hamburger Menu - Visible on mobile and tablet */}
        <Button 
          variant="ghost" 
          size={'sm'} 
          onClick={onMenuToggle} 
          className="mr-4 lg:hidden hover:bg-gray-100"
        >
          <Menu className="h-6 w-6" />
          <span className="sr-only">Toggle menu</span>
        </Button>
        
        {/* Logo - Visible on mobile */}
        <div className="flex lg:hidden items-center">
          {/* <div className="h-8 w-8 rounded-md bg-lime-500 flex items-center justify-center mr-2">
            <span className="text-white font-bold">L</span>
          </div>
          <span className="font-bold text-lg">ListUp</span> */}
          <Image src="/Listup.webp" alt="Logo" width={32} height={32} />
        </div>
        
        {/* Title - Hidden on mobile, visible on desktop */}
        <div className="hidden lg:flex">
          <span className="font-bold text-xl text-gray-800">Admin Dashboard</span>
        </div>

        <div className="flex flex-1 items-center justify-end space-x-4">
          <form onSubmit={handleSearch} className="relative hidden md:block">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search..."
              className="w-[200px] pl-8 md:w-[300px] lg:w-[400px]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>

          <Button variant="ghost" size="sm">
            <Bell className="h-5 w-5" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="rounded-full">
                <User className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>
                {user?.name || 'Admin User'}
                <p className="text-xs text-muted-foreground">{user?.email || 'admin@example.com'}</p>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Link href="/profile">Profile</Link>
              </DropdownMenuItem>
              <DropdownMenuItem >
                <Link href="/settings">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => logout()}>
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}