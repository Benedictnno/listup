"use client"
import { PrimaryButton } from '@/utils/helpers';
import { Menu, X, Layers } from 'lucide-react';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useChat } from '@/context/ChatContext';
import Image from 'next/image';
import { MessageSquare } from 'lucide-react';
import { fetchCategories, Category } from '@/lib/api/categories';

import SearchBar from './SearchBar';

function NavBar() {
  const [open, setOpen] = React.useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const menuRef = React.useRef<HTMLDivElement | null>(null);

  // Use the proper auth store instead of local localStorage
  const { user, logout } = useAuthStore();
  const { unreadCount } = useChat();

  // const nav = [
  //   { label: "Listings", href: "/listings" },
  //   { label: "Categories", href: "/categories" },
  //   { label: "Deals", href: "#deals" },
  //   { label: "Blog", href: "#blog" },
  // ];

  const handleLogout = () => {
    logout();
    // Optionally redirect to home page
    window.location.href = "/";
  };

  // Close menu when clicking outside or pressing Escape
  React.useEffect(() => {
    function onDocumentClick(e: MouseEvent) {
      if (!open) return;
      const target = e.target as Node | null;
      if (menuRef.current && target && !menuRef.current.contains(target)) {
        setOpen(false);
      }
    }

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }

    document.addEventListener('mousedown', onDocumentClick);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onDocumentClick);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  // Fetch and cache categories
  useEffect(() => {
    const loadCategories = async () => {
      // 1. Try to load from localStorage first
      const cached = localStorage.getItem('listup_categories');
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setCategories(parsed);
          }
        } catch (e) {
          console.error("Error parsing cached categories", e);
        }
      }

      // 2. Fetch from API to update cache
      try {
        const fetched = await fetchCategories();
        if (fetched && fetched.length > 0) {
          setCategories(fetched);
          localStorage.setItem('listup_categories', JSON.stringify(fetched));
        }
      } catch (error) {
        console.error("Failed to update categories from API", error);
      }
    };

    loadCategories();
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/20 bg-[#0f172a] backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center text-lg justify-between px-4 py-3 md:px-6">
        <Link href="/" className="flex items-center gap-2 text-white shrink-0">
          {/* <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-lime-400 text-slate-900 font-black">LU</div>
          <span className="text-sm font-semibold tracking-wide">ListUp</span> */}
          <Image src="/images/Listup.png" alt="ListUp" width={80} height={32} className="object-contain h-auto w-auto max-h-8" priority />
        </Link>

        {/* Desktop Search Bar - Centered */}
        <div className="hidden md:flex flex-1 justify-center max-w-[720px] mx-auto">
          <SearchBar />
        </div>

        {/* <nav className="hidden items-center gap-8 text-[13px] text-white/80 md:flex">
          {nav.map((n) => (
            <Link key={n.label} href={n.href} className="transition text-lg hover:text-white">
              {n.label}
            </Link>
          ))}

        </nav> */}

        {/* Authentication Buttons - show Dashboard for VENDOR, Saved for USER, or Login/Signup */}
        {user ? (
          <div className="hidden items-center gap-3 md:flex">
            <Link href="/chat" className="relative p-2 text-white/80 hover:text-white transition">
              <MessageSquare className="h-6 w-6" />
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white border-2 border-[#0f172a]">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Link>
            {user.role === 'VENDOR' ? (
              <Link href="/dashboard">
                <PrimaryButton>Dashboard</PrimaryButton>
              </Link>
            ) : (
              <Link href="/saved">
                <button className="rounded-xl px-3 py-2 text-lg font-semibold text-white/80 transition hover:text-white">Saved</button>
              </Link>
            )}
            <button
              onClick={handleLogout}
              className="rounded-xl px-3 py-2 text-lg font-semibold text-white/80 transition hover:text-white"
            >
              Logout
            </button>
          </div>
        ) : (
          <div className="hidden items-center gap-3 md:flex px-3 py-2">
            <Link href="/login" className="rounded-xl px-3 py-2 text-lg font-semibold text-white/80 transition hover:text-white">
              Log in
            </Link>
            <Link href="/signup">
              <PrimaryButton>Sign up</PrimaryButton>
            </Link>
          </div>
        )}

        <button
          className="inline-flex items-center justify-center rounded-lg p-2 text-white md:hidden"
          onClick={() => setOpen((s) => !s)}
          aria-label="Toggle menu"
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="fixed inset-0 z-50 flex md:hidden bg-black/50 backdrop-blur-sm">
          {/* Menu Drawer */}
          <div ref={menuRef} className="relative w-3/4 max-w-sm flex flex-col bg-white text-slate-900 h-full shadow-xl">

            {/* Header with Close Button */}
            <div className="flex items-center justify-center p-4 border-b border-slate-200 relative">
              <h2 className="text-xl font-bold text-slate-900">Categories</h2>
              <button onClick={() => setOpen(false)} className="absolute right-2 p-2 rounded-full hover:bg-slate-100 transition">
                <X className="h-5 w-5 text-slate-600" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto py-6">
              <div className="px-4">
                <div className="flex flex-col gap-1 text-center">
                  {categories.length > 0 ? (
                    categories.map((cat) => (
                      <Link
                        key={cat.id}
                        href={`/categories/${cat.slug}`}
                        onClick={() => setOpen(false)}
                        className="py-2.5 text-slate-900 hover:bg-slate-50 text-base transition-colors"
                      >
                        {cat.name}
                      </Link>
                    ))
                  ) : (
                    // Fallback categories if API fails or is loading
                    <>
                      <Link href="/categories/audio" onClick={() => setOpen(false)} className="py-2.5 text-slate-900 hover:bg-slate-50 text-base transition-colors">Audio</Link>
                      <Link href="/categories/electronics" onClick={() => setOpen(false)} className="py-2.5 text-slate-900 hover:bg-slate-50 text-base transition-colors">Electronics</Link>
                      <Link href="/categories/mobile" onClick={() => setOpen(false)} className="py-2.5 text-slate-900 hover:bg-slate-50 text-base transition-colors">Mobile</Link>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Separator Line */}
            <div className="border-t border-slate-200"></div>

            {/* Footer Section */}
            <div className="px-4 py-4 bg-white">
              {user ? (
                <div className="flex flex-col gap-2 text-center">
                  {user.role === 'VENDOR' ? (
                    <Link href="/dashboard" onClick={() => setOpen(false)} className="flex items-center justify-center gap-2 py-2.5 text-slate-900 hover:bg-slate-50 font-normal text-base transition-colors">
                      <Layers className="h-4 w-4" />
                      My DashBoard
                    </Link>
                  ) : (
                    <Link href="/saved" onClick={() => setOpen(false)} className="flex items-center justify-center gap-2 py-2.5 text-slate-900 hover:bg-slate-50 font-normal text-base transition-colors">
                      Saved Items
                    </Link>
                  )}
                  <button onClick={handleLogout} className="flex items-center justify-center gap-2 py-2.5 text-slate-900 hover:bg-slate-50 font-normal text-base w-full transition-colors">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                    Logout
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-2 text-center">
                  <Link href="/login" onClick={() => setOpen(false)} className="py-2.5 text-slate-900 hover:bg-slate-50 font-normal text-base transition-colors">Log in</Link>
                  <Link href="/signup" onClick={() => setOpen(false)} className="py-2.5 text-slate-900 hover:bg-slate-50 font-normal text-base transition-colors">Sign up</Link>
                </div>
              )}
            </div>

          </div>
        </div>
      )}
    </header>
  )
}

export default NavBar