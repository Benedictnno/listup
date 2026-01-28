"use client"
import { PrimaryButton } from '@/utils/helpers';
import { Menu, X } from 'lucide-react';
import Link from 'next/link';
import React from 'react';
import { useAuthStore } from '@/store/authStore';
import { useChat } from '@/context/ChatContext';
import Image from 'next/image';
import { MessageSquare } from 'lucide-react';

function NavBar() {
  const [open, setOpen] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement | null>(null);

  // Use the proper auth store instead of local localStorage
  const { user, logout } = useAuthStore();
  const { unreadCount } = useChat();

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
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/20 bg-[#0f172a] backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center text-lg justify-between px-4 py-3 md:px-6">
        <Link href="/" className="flex items-center gap-2 text-white">
          {/* <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-lime-400 text-slate-900 font-black">LU</div>
          <span className="text-sm font-semibold tracking-wide">ListUp</span> */}
          <Image src="/images/Listup.png" alt="ListUp" width={80} height={32} className="object-contain h-auto w-auto max-h-8" priority />
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
        <div className="md:hidden">
          <div ref={menuRef} className="space-y-1 border-t border-white/10 bg-slate-900 px-4 py-3">
            {nav.map((n) => (
              <Link key={n.label} href={n.href} onClick={() => setOpen(false)} className="block rounded-lg px-3 py-2 text-lg text-white/80 hover:bg-white/5 hover:text-white">
                {n.label}
              </Link>
            ))}

            {/* Mobile Authentication Buttons - Fixed Logic */}
            <div className="mt-2 flex flex-col gap-2">
              {user ? (
                // User is logged in
                <>
                  <Link href="/chat" onClick={() => setOpen(false)} className="flex items-center justify-between rounded-lg px-3 py-2 text-lg text-white/80 hover:bg-white/5 hover:text-white">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-5 w-5" />
                      Messages
                    </div>
                    {unreadCount > 0 && (
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                        {unreadCount}
                      </span>
                    )}
                  </Link>
                  {user.role === 'VENDOR' ? (
                    <Link href="/dashboard" className="w-full" onClick={() => setOpen(false)}>
                      <PrimaryButton>Dashboard</PrimaryButton>
                    </Link>
                  ) : (
                    <Link href="/saved" className="w-full" onClick={() => setOpen(false)}>
                      <button className="rounded-xl px-3 py-2 text-lg font-semibold text-white/80 w-full text-left">Saved</button>
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="rounded-xl px-3 py-2 text-lg font-semibold text-white/80 transition hover:text-white"
                  >
                    Logout
                  </button>
                </>
              ) : (
                // User is not logged in - Show Login and Signup
                <div className="mt-2 flex gap-3 py-2">
                  <Link
                    href="/login"
                    className="flex-1 rounded-xl px-4 py-2 text-center text-lg font-semibold text-white/80 transition hover:text-white hover:bg-white/10"
                    onClick={() => setOpen(false)}
                  >
                    Log in
                  </Link>
                  <Link href="/signup" className="flex-1" onClick={() => setOpen(false)}>
                    <PrimaryButton>Sign up</PrimaryButton>
                  </Link>
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