import React from "react";
import { Facebook, Twitter, Instagram, Linkedin } from "lucide-react"; // 👈 make sure you import icons

const Footer: React.FC = () => {
  return (
    <footer className="bg-[#0B0B0E] text-slate-300">
      {/* LOGO SECTION */}
      

      {/* FOOTER / NEWSLETTER */}
      <div className="mx-auto max-w-7xl px-4 py-14 md:px-6">
        {/* CTA */}
        <div className="mb-10 rounded-3xl border border-white/10 bg-white/5 p-6 md:p-8">
          <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
            <div>
              <h3 className="text-xl font-semibold text-white md:text-2xl">
                Stay Connected with Our Marketplace
              </h3>
              <p className="mt-1 text-sm text-slate-300">
                Get product updates, new deals, and helpful tips.
              </p>
            </div>
            <form className="flex w-full max-w-md items-center gap-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="h-11 w-full rounded-xl border border-white/10 bg-white/10 px-4 text-sm text-white placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-lime-300/20"
              />
              <button
                type="submit"
                className="h-11 rounded-xl bg-lime-400 px-4 text-sm font-semibold text-slate-900 shadow-[inset_0_-2px_0_rgba(0,0,0,0.15)] hover:bg-lime-300"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-2 gap-10 sm:grid-cols-3 md:grid-cols-5">
          {/* Marketplace */}
          <div>
            <h5 className="text-sm font-semibold text-white">Marketplace</h5>
            <ul className="mt-3 space-y-2 text-xs text-slate-400">
              <li><a href="#" className="hover:text-slate-200">About</a></li>
              <li><a href="#" className="hover:text-slate-200">Careers</a></li>
              <li><a href="#" className="hover:text-slate-200">Press</a></li>
              <li><a href="#" className="hover:text-slate-200">Contact</a></li>
            </ul>
          </div>

          {/* Buy */}
          <div>
            <h5 className="text-sm font-semibold text-white">Buy</h5>
            <ul className="mt-3 space-y-2 text-xs text-slate-400">
              <li><a href="#" className="hover:text-slate-200">Browse</a></li>
              <li><a href="#" className="hover:text-slate-200">Saved Items</a></li>
              <li><a href="#" className="hover:text-slate-200">Payments</a></li>
              <li><a href="#" className="hover:text-slate-200">Support</a></li>
            </ul>
          </div>

          {/* Sell */}
          <div>
            <h5 className="text-sm font-semibold text-white">Sell</h5>
            <ul className="mt-3 space-y-2 text-xs text-slate-400">
              <li><a href="#" className="hover:text-slate-200">Start Selling</a></li>
              <li><a href="#" className="hover:text-slate-200">Pricing</a></li>
              <li><a href="#" className="hover:text-slate-200">Seller Hub</a></li>
              <li><a href="#" className="hover:text-slate-200">Analytics</a></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h5 className="text-sm font-semibold text-white">Resources</h5>
            <ul className="mt-3 space-y-2 text-xs text-slate-400">
              <li><a href="#" className="hover:text-slate-200">Help Center</a></li>
              <li><a href="#" className="hover:text-slate-200">Safety</a></li>
              <li><a href="#" className="hover:text-slate-200">Guides</a></li>
              <li><a href="#" className="hover:text-slate-200">Community</a></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h5 className="text-sm font-semibold text-white">Legal</h5>
            <ul className="mt-3 space-y-2 text-xs text-slate-400">
              <li><a href="#" className="hover:text-slate-200">Privacy</a></li>
              <li><a href="#" className="hover:text-slate-200">Terms</a></li>
              <li><a href="#" className="hover:text-slate-200">Cookies</a></li>
              <li><a href="#" className="hover:text-slate-200">Licenses</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-6 text-xs text-slate-400 md:flex-row">
          <p>© {new Date().getFullYear()} ListUp, Inc. All rights reserved.</p>
          <div className="flex items-center gap-4 text-slate-300">
            <a href="#" aria-label="Facebook" className="hover:text-white"><Facebook className="h-4 w-4" /></a>
            <a href="#" aria-label="Twitter" className="hover:text-white"><Twitter className="h-4 w-4" /></a>
            <a href="#" aria-label="Instagram" className="hover:text-white"><Instagram className="h-4 w-4" /></a>
            <a href="#" aria-label="LinkedIn" className="hover:text-white"><Linkedin className="h-4 w-4" /></a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
