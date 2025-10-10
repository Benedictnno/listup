"use client"
import { PrimaryButton } from '@/utils/helpers';
import { Menu, X } from 'lucide-react';
import Link from 'next/link';
import React from 'react';
import { useAuthStore } from '@/store/authStore';
import Image from 'next/image';

function NavBar() {
  const [open, setOpen] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement | null>(null);
  
  // Use the proper auth store instead of local localStorage
  const { user, logout } = useAuthStore();

  const nav = [
    { label: "Listings", href: "/listings" },
    { label: "Categories", href: "/categories" },
    { label: "Deals", href: "#deals" },
    { label: "Blog", href: "#blog" },
  ];

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
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/20 bg-slate-900/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center text-lg justify-between px-4 py-3 md:px-6">
        <Link href="/" className="flex items-center gap-2 text-white">
          {/* <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-lime-400 text-slate-900 font-black">LU</div>
          <span className="text-sm font-semibold tracking-wide">ListUp</span> */}
          <Image src="/images/Listup.png" alt="ListUp" width={100} height={100}/>
        </Link>

        <nav className="hidden items-center gap-8 text-[13px] text-white/80 md:flex">
          {nav.map((n) => (
            <Link key={n.label} href={n.href} className="transition text-lg hover:text-white">
              {n.label}
            </Link>
          ))}
        
        </nav>

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
          <div className="hidden items-center gap-3 md:flex">
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
        <div className="md:hidden">
          <div ref={menuRef} className="space-y-1 border-t border-white/10 bg-slate-900 px-4 py-3">
            {nav.map((n) => (
              <Link key={n.label} href={n.href} onClick={() => setOpen(false)} className="block rounded-lg px-3 py-2 text-lg text-white/80 hover:bg-white/5 hover:text-white">
                {n.label}
              </Link>
            ))}
            
            {/* Mobile Authentication Buttons - Fixed Logic */}
            <div className="mt-2 flex items-center gap-3">
              {user ? (
                // User is logged in - Show Dashboard and Logout
                <>
                  {user.role === 'VENDOR' ? (
                    <Link href="/dashboard" className="w-full" onClick={() => setOpen(false)}>
                      <PrimaryButton>Dashboard</PrimaryButton>
                    </Link>
                  ) : (
                    <Link href="/saved" className="w-full" onClick={() => setOpen(false)}>
                      <button className="rounded-xl px-3 py-2 text-xs font-semibold text-white/80 w-full text-left">Saved</button>
                    </Link>
                  )}
                  <button 
                    onClick={handleLogout}
                    className="rounded-xl px-3 py-2 text-xs font-semibold text-white/80 transition hover:text-white"
                  >
                    Logout
                  </button>
                </>
              ) : (
                // User is not logged in - Show Login and Signup
                <>
                  <Link href="/login" className="rounded-xl px-3 py-2 text-xs font-semibold text-white/80 transition hover:text-white" onClick={() => setOpen(false)}>
                    Log in
                  </Link> 
                  <Link href="/signup" className="w-full" onClick={() => setOpen(false)}>
                    <PrimaryButton>Sign up</PrimaryButton>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  )
}

export default NavBar