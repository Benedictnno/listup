"use client"
import { PrimaryButton } from '@/utils/helpers';
import { Menu, X, Layers } from 'lucide-react';
import Link from 'next/link';
import React from 'react';
import { useAuthStore } from '@/store/authStore';
import Image from 'next/image';

import SearchBar from './SearchBar';

function NavBar() {
  const [open, setOpen] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement | null>(null);

  // Use the proper auth store instead of local localStorage
  const { user, logout } = useAuthStore();

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

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/20 bg-[#0f172a] backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center text-lg justify-between px-4 py-3 md:px-6">
        <Link href="/" className="flex items-center gap-2 text-white shrink-0">
          {/* <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-lime-400 text-slate-900 font-black">LU</div>
          <span className="text-sm font-semibold tracking-wide">ListUp</span> */}
          <Image src="/images/Listup.png" alt="ListUp" width={80} height={32} className="object-contain h-auto w-auto max-h-8" priority />
        </Link>

        {/* Desktop Search Bar - Centered */}
        <div className="hidden md:flex flex-1 justify-center max-w-2xl mx-auto">
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

<<<<<<< HEAD
            {/* Mobile Authentication Buttons - Fixed Logic */}
            <div className="mt-2 flex items-center gap-3">
              {user ? (
                // User is logged in - Show Dashboard and Logout
                <>
=======
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
                  <Link href="/categories/audio" onClick={() => setOpen(false)} className="py-2.5 text-slate-900 hover:bg-slate-50 text-base transition-colors">Audio</Link>
                  <Link href="/categories/beauty-personal-care" onClick={() => setOpen(false)} className="py-2.5 text-slate-900 hover:bg-slate-50 text-base transition-colors">Beauty & Personal care</Link>
                  <Link href="/categories/computers" onClick={() => setOpen(false)} className="py-2.5 text-slate-900 hover:bg-slate-50 text-base transition-colors">Computers</Link>
                  <Link href="/categories/electronics" onClick={() => setOpen(false)} className="py-2.5 text-slate-900 hover:bg-slate-50 text-base transition-colors">Electronics</Link>
                  <Link href="/categories/fashion-clothing" onClick={() => setOpen(false)} className="py-2.5 text-slate-900 hover:bg-slate-50 text-base transition-colors">Fashion & Clothing</Link>
                  <Link href="/categories/food-snacks" onClick={() => setOpen(false)} className="py-2.5 text-slate-900 hover:bg-slate-50 text-base transition-colors">Food & Snacks</Link>
                  <Link href="/categories/handmade-crafts" onClick={() => setOpen(false)} className="py-2.5 text-slate-900 hover:bg-slate-50 text-base transition-colors">Handmade & Crafts</Link>
                  <Link href="/categories/mobile" onClick={() => setOpen(false)} className="py-2.5 text-slate-900 hover:bg-slate-50 text-base transition-colors">Mobile</Link>
                  <Link href="/categories/utensils" onClick={() => setOpen(false)} className="py-2.5 text-slate-900 hover:bg-slate-50 text-base transition-colors">Utensils</Link>
                </div>
              </div>
            </div>

            {/* Separator Line */}
            <div className="border-t border-slate-200"></div>

            {/* Footer Section */}
            <div className="px-4 py-4 bg-white">
              {user ? (
                <div className="flex flex-col gap-2 text-center">
>>>>>>> 5d05430 (Fix Render deployment: Use Chromium instead of Chrome for WPPConnect\n\n- Remove Chrome installation from build script\n- Configure WPPConnect to use Chromium (useChrome: false)\n- Add executablePath support for PUPPETEER_EXECUTABLE_PATH env var\n- Enhanced browserArgs for containerized environments\n- Update product cards UI with simplified layout\n- Center search bar in NavBar and improve mobile menu)
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