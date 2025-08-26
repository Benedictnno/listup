"use client"
import { PrimaryButton } from '@/utils/helpers';
import { Menu, X } from 'lucide-react';
import Link from 'next/link';
import React from 'react'

function NavBar() {
  const [open, setOpen] = React.useState(false);
   const [token, setToken] = React.useState<string | null>(null);

  // Load token only on the client
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const storedToken = localStorage.getItem("token");
      setToken(storedToken);
    }
  }, []);

const nav = [
  { label: "Listings", href: "/listings" },
  { label: "Categories", href: "#categories" },
  { label: "Deals", href: "#deals" },
  { label: "Blog", href: "#blog" },
];
  return (
     <header className="sticky top-0 z-40 w-full border-b  border-slate-200/20 bg-slate-900/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center text-lg justify-between px-4 py-3 md:px-6">
          <Link href="/" className="flex items-center gap-2 text-white">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-lime-400 text-slate-900 font-black">LU</div>
            <span className="text-sm font-semibold tracking-wide">ListUp</span>
          </Link>

          <nav className="hidden items-center gap-8 text-[13px] text-white/80 md:flex">
            {nav.map((n) => (
              <Link key={n.label} href={n.href} className="transition text-lg hover:text-white">
                {n.label}
              </Link>
            ))}
          </nav>

            {
              token?  <Link href={'/dashboard'}><PrimaryButton> Dashboard</PrimaryButton></Link> :
          <div className="hidden items-center gap-3 md:flex">
           <Link href={'/login'} className="rounded-xl px-3 py-2 text-lg font-semibold text-white/80 transition hover:text-white">Log in</Link> 
            <Link href={'/signup'}><PrimaryButton> Sign up</PrimaryButton></Link> 
          </div>
            }

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
            <div className="space-y-1 border-t border-white/10 bg-slate-900 px-4 py-3">
              {nav.map((n) => (
                <Link key={n.label} href={n.href} className="block rounded-lg px-3 py-2 text-lg text-white/80 hover:bg-white/5 hover:text-white">
                  {n.label}
                </Link>
              ))}
              <div className="mt-2 flex items-center gap-3">
                <Link href={'/login'} className="rounded-xl px-3 py-2 text-xs font-semibold text-white/80 transition hover:text-white">Log in</Link> 
              <Link href={'/signup'}><PrimaryButton> Sign up</PrimaryButton></Link> 
              </div>
            </div>
          </div>
        )}
      </header>
  )
}

export default NavBar