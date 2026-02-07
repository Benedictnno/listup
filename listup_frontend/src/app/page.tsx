"use client";
import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, Search } from "lucide-react";
import { tips } from "@/utils/constants";
import { PrimaryButton, SectionEyebrow } from "@/utils/helpers";
import AdsPage from "@/components/TrendingAds";
import Image from "next/image";
import MiniListings from "@/components/MiniListings";
import Link from "next/link";
import { GhostButton } from "@/utils/helpers";
import { useAuthStore } from "@/store/authStore";
import OutsideAd from "@/components/OutsideAd";
import CategorySidebar from "@/components/CategorySidebar";
import HeroCarousel from "@/components/HeroCarousel";
import PromoCards from "@/components/PromoCards";
import { useRouter } from "next/navigation";
import { useFilterStore } from "@/store/useFilterStore";
/**
 * Marketplace Landing Page
 * Framework: Next.js (app router ready) + TailwindCSS
 * Notes:
 * - Replace <img> with Next/Image in your Next.js app for optimized images.
 * - This file can be used directly as `app/page.tsx` in a Next.js project.
 */

export default function MarketplaceLanding() {
  const user = useAuthStore((state) => state.user);
  const router = useRouter();
  const setSearch = useFilterStore((state) => state.setSearch);

  return (
    <div className="min-h-screen w-full text-slate-800 font-montserrat realative">
      {/* NAVBAR */}

      {/* HERO SECTION */}
      <section className="bg-[#0f172a] py-6 md:py-10">
        <div className="mx-auto max-w-7xl px-4 md:px-6">

          {/* Mobile Search Bar - Visible only on mobile as per mockup */}
          <div className="md:hidden mb-6">
            <form onSubmit={(e) => {
              e.preventDefault();
              const searchInput = e.currentTarget.querySelector('input');
              const searchValue = searchInput?.value || '';
              if (searchValue.trim()) {
                setSearch(searchValue.trim());
                router.push(`/listings?q=${encodeURIComponent(searchValue.trim())}`);
              }
            }} className="flex w-full items-center bg-[#1e293b] border border-slate-700 rounded-xl overflow-hidden h-14">
              <div className="pl-4">
                <Search className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="text"
                placeholder="Search listings..."
                className="flex-1 bg-transparent text-white outline-none px-3 font-montserrat text-base"
              />
              <button
                type="submit"
                className="h-full px-6 bg-lime-400 text-slate-900 font-bold font-montserrat hover:bg-lime-300 transition-colors"
              >
                Search
              </button>
            </form>
          </div>

          <div className="flex flex-col md:flex-row gap-6 h-auto md:h-[420px] lg:h-[480px]">
            {/* 1. Category Sidebar (Desktop Only) */}
            <CategorySidebar />

            {/* 2. Hero Carousel (Main) */}
            <div className="flex-1 h-[300px] md:h-full">
              <HeroCarousel />
            </div>

            {/* 3. Promo Cards (Desktop Only) */}
            <PromoCards />
          </div>

          {/* Mobile Promo Buttons (Visible only on mobile) */}
          <div className="grid grid-cols-2 gap-3 mt-6 md:hidden">
            <Link
              href="/signup?redirect=dashboard"
              className="bg-white text-slate-900 font-bold py-4 rounded-2xl text-center font-montserrat text-sm shadow-lg active:scale-95 transition-transform"
            >
              Start Selling
            </Link>
            <a
              href="https://wa.me/2348012345678"
              className="bg-lime-400 text-slate-900 font-bold py-4 rounded-2xl text-center font-montserrat text-sm shadow-lg active:scale-95 transition-transform"
            >
              Join WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* <AdsPage/> */}

      <MiniListings />

      {/* <Category /> */}

      {/* FEATURED STORY */}
      <section id="deals" className="bg-slate-50">
        <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-8 px-4 py-14 md:grid-cols-2 md:px-6">
          <div>
            <SectionEyebrow>Blog</SectionEyebrow>
            <h3 className="text-2xl font-semibold text-slate-900 md:text-3xl font-montserrat">
              Find Your Next Great Deal Today!
            </h3>
            <p className="mt-2 text-sm text-slate-600 font-montserrat">
              Discover hidden gems and smart tips for buying pre‑loved items.
              We curate the best deals so you don’t have to.
            </p>
            <ul className="mt-4 space-y-2 text-sm text-slate-600">
              <li className="flex items-start gap-2"><span className="mt-1 h-1.5 w-1.5 rounded-full bg-lime-400"></span> Weekly highlights across top categories</li>
              <li className="flex items-start gap-2"><span className="mt-1 h-1.5 w-1.5 rounded-full bg-lime-400"></span> Verified sellers and protected checkout</li>
              <li className="flex items-start gap-2"><span className="mt-1 h-1.5 w-1.5 rounded-full bg-lime-400"></span> Buyer and seller safety guidelines</li>
            </ul>

            <div className="mt-5 flex items-center gap-3">
              <PrimaryButton>Read More</PrimaryButton>
              <button className="text-sm font-semibold text-slate-700 underline-offset-4 hover:underline">Share</button>
            </div>

            <div className="mt-4 flex gap-4 text-[11px] text-slate-500">
              <span>5 min read</span>
              <span>•</span>
              <span>Updated today</span>
            </div>
          </div>

          <div>
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <Image
                src={"/images/nextDeal.jpg"}
                alt="Happy couple shopping online"
                width={500}
                height={600}
                className="h-64 w-full object-cover md:h-80"
              />
            </div>
          </div>
        </div>
      </section>

      {/* PARALLAX BANNER */}
      <section className="relative">
        <div
          className="relative h-56 w-full bg-fixed bg-cover bg-center md:h-64"
          style={{
            backgroundImage:
              "url(https://images.unsplash.com/photo-1517816743773-6e0fd518b4a6?q=80&w=1600&auto=format&fit=crop)",
          }}
        >
          <div className="absolute inset-0 bg-slate-900/60" />
          <div className="relative flex max-sm:flex-col max-sm:p-8 z-10 mx-auto h-full max-w-7xl items-center justify-between px-4 md:px-6">
            <div >
              <h3 className="text-lg font-semibold text-white md:text-2xl font-montserrat">Discover Amazing Deals Today!</h3>
              <p className="mt-1 text-sm text-slate-200 font-montserrat">Limited‑time offers across popular categories.</p>
            </div>
            <div className=" m-auto">
              <PrimaryButton>Explore Now</PrimaryButton>
            </div>
          </div>
        </div>
      </section>

      {/* TIPS SECTION */}
      <section id="blog" className="bg-slate-900">
        <div className="mx-auto max-w-7xl px-4 py-14 md:px-6">
          <div className="mb-8 text-center">
            <SectionEyebrow>Tips</SectionEyebrow>
            <h3 className="text-2xl font-semibold text-white md:text-3xl font-montserrat">Buying and Selling Tips</h3>
            <p className="mt-2 text-sm text-slate-300 font-montserrat">Actionable insights to help you transact with confidence.</p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {tips.map((t, i) => (
              <article key={i} className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-sm">
                <Image src={t.img} alt={t.title} width={500} height={300} className="h-44 w-full object-cover" />
                <div className="p-4">
                  <h4 className="text-base font-semibold text-white font-montserrat">{t.title}</h4>
                  <div className="mt-3 flex items-center justify-between text-[11px] text-slate-300">
                    <span>3 min read</span>
                    <a href="#" className="inline-flex items-center gap-1 font-semibold text-white/90 hover:text-white">
                      Read <ArrowRight className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
      <OutsideAd />

    </div>
  );
}
