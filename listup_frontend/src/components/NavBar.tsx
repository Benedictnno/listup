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
import { motion, AnimatePresence } from 'framer-motion';

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
    <>
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
                <span className="absolute top-0 right-0 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[12px] font-bold text-white border-2 border-[#0f172a]">
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

      </header>

      {/* Premium Mobile Menu with Framer Motion (Moved outside header for z-index safety) */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex md:hidden bg-slate-900/80 backdrop-blur-xl"
          >
            {/* Backdrop Close Click Area */}
            <div className="absolute inset-0" onClick={() => setOpen(false)} />

            {/* Menu Drawer */}
            <motion.div
              ref={menuRef}
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative ml-auto w-full max-w-[85%] flex flex-col bg-white h-full shadow-[-20px_0_50px_rgba(0,0,0,0.4)] overflow-hidden"
            >
              {/* Header section with Close Button */}
              <div className="pt-10 px-8 flex justify-between items-center">
                <button
                  onClick={() => setOpen(false)}
                  className="p-3 rounded-2xl bg-slate-50 text-slate-500 hover:text-black hover:bg-slate-100 transition-all active:scale-95"
                  aria-label="Close menu"
                >
                  <X className="h-7 w-7 stroke-[2.5]" />
                </button>
                <div className="text-right">
                  <h2 className="text-[32px] font-black tracking-tighter text-slate-900 leading-none">
                    Categories
                  </h2>
                  <div className="h-1.5 w-12 bg-lime-400 ml-auto mt-2 rounded-full" />
                </div>
              </div>

              {/* Scrollable Categories List */}
              <div className="flex-1 overflow-y-auto px-10 py-12 scrollbar-hide">
                <nav className="flex flex-col gap-8 items-end">
                  {[
                    { name: "Audio", href: "/categories/audio" },
                    { name: "Electronics", href: "/categories/electronics" },
                    { name: "Computers", href: "/categories/computers" },
                    { name: "Mobile", href: "/categories/mobile" },
                    { name: "Beauty & Care", href: "/categories/beauty-personal-care" },
                    { name: "Fashion", href: "/categories/fashion-clothing" },
                    { name: "Food", href: "/categories/food-snacks" },
                    { name: "Handmade", href: "/categories/handmade-crafts" },
                    { name: "Utensils", href: "/categories/utensils" }
                  ].map((cat, i) => (
                    <motion.div
                      key={cat.href}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <Link
                        href={cat.href}
                        onClick={() => setOpen(false)}
                        className="text-[22px] font-bold text-slate-800 hover:text-lime-600 transition-all group relative flex items-center gap-4"
                      >
                        <span className="text-[12px] text-slate-400 font-mono font-medium group-hover:text-lime-500 transition-colors">
                          0{i + 1}
                        </span>
                        {cat.name}
                        <span className="absolute -bottom-1 -right-1 w-0 h-1 bg-lime-400/20 transition-all group-hover:w-[calc(100%+8px)]" />
                      </Link>
                    </motion.div>
                  ))}
                </nav>
              </div>

              {/* Fixed Bottom Section */}
              <div className="mt-auto p-8 bg-slate-50 border-t border-slate-100/50">
                {user ? (
                  <div className="flex flex-col gap-4">
                    <Link
                      href={user.role === 'VENDOR' ? "/dashboard" : "/saved"}
                      onClick={() => setOpen(false)}
                      className="flex items-center justify-between p-5 bg-white border border-slate-200 rounded-[1.5rem] shadow-sm hover:shadow-md hover:border-lime-400 transition-all group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-lime-50 text-lime-600 rounded-xl group-hover:bg-lime-400 group-hover:text-white transition-colors">
                          <Layers className="h-6 w-6" />
                        </div>
                        <span className="text-[18px] font-black text-slate-900">
                          {user.role === 'VENDOR' ? 'Dashboard' : 'Saved Items'}
                        </span>
                      </div>
                      <X className="h-5 w-5 text-slate-300 group-hover:text-lime-500 rotate-45 transition-colors" />
                    </Link>

                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-4 p-5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-[1.5rem] transition-all group active:scale-95 w-full"
                    >
                      <div className="p-2 bg-slate-100 rounded-lg group-hover:bg-red-100 group-hover:text-red-600 transition-colors">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                          <polyline points="16 17 21 12 16 7"></polyline>
                          <line x1="21" y1="12" x2="9" y2="12"></line>
                        </svg>
                      </div>
                      <span className="text-[16px] font-bold">Logout</span>
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-4">
                    <Link
                      href="/login"
                      onClick={() => setOpen(false)}
                      className="flex items-center justify-center gap-3 py-5 bg-[#0f172a] text-white rounded-[2rem] text-[20px] font-black shadow-xl shadow-slate-200 hover:bg-slate-800 hover:scale-[1.02] active:scale-[0.98] transition-all"
                    >
                      <MessageSquare className="h-6 w-6 text-lime-400" />
                      Sign In
                    </Link>
                    <div className="flex items-center justify-center gap-2 text-slate-500 text-[14px]">
                      Don't have an account? 
                      <Link href="/signup" onClick={() => setOpen(false)} className="text-slate-900 font-bold hover:text-lime-600 transition-colors underline decoration-lime-400/40 decoration-2 underline-offset-4">
                        Sign Up
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default NavBar