"use client";
import React from "react";
// import { motion } from "framer-motion"; // Removed unused import to save bundle size if not used elsewhere, or keep if needed. It was used in original file.
import { ArrowRight, Search, Store, MessageCircle } from "lucide-react";
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
// import HeroCarousel from "@/components/HeroCarousel"; // Replaced with dynamic import
import PromoCards from "@/components/PromoCards";
import { useRouter } from "next/navigation";
import { useFilterStore } from "@/store/useFilterStore";
import dynamic from "next/dynamic";
import CarouselSkeleton from "@/components/skeletons/CarouselSkeleton";

const HeroCarousel = dynamic(() => import("@/components/HeroCarousel"), {
  loading: () => <CarouselSkeleton />,
  ssr: false // Disable SSR for carousel since it's client-side heavy
});

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
    <div className="min-h-screen w-full text-slate-800 font-montserrat relative overflow-x-hidden">
      {/* NAVBAR */}

      {/* HERO SECTION */}
      <section className="bg-slate-950 py-6 md:py-12 border-b border-white/5">
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
            }} className="flex w-full items-center bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden h-14 shadow-2xl">
              <div className="pl-4">
                <Search className="h-5 w-5 text-slate-500" />
              </div>
              <input
                type="text"
                placeholder="Search listings..."
                className="flex-1 bg-transparent text-white outline-none px-3 font-montserrat text-sm"
              />
              <button
                type="submit"
                className="h-full px-6 bg-lime-400 text-slate-950 font-bold font-montserrat hover:bg-lime-300 transition-colors"
              >
                Search
              </button>
            </form>
          </div>



          <div className="flex flex-col lg:flex-row gap-6">
            {/* 1. Category Sidebar (Desktop Only) */}
            <div className="hidden lg:block w-58 h-[440px]">
              <CategorySidebar />
            </div>

            {/* 2. Hero Carousel (Main) */}
            <div className="flex-1 min-h-[250px] lg:h-[430px]">
              <HeroCarousel />
            </div>

            {/* 3. Vertical Promo Cards (Desktop Only) */}
            <div className="hidden lg:flex flex-col gap-4 w-52">
              <Link
                href="/signup?redirect=dashboard"
                className="relative overflow-hidden rounded-2xl bg-white border border-slate-200 p-6 hover:shadow-xl transition-all group h-[215px] flex flex-col justify-center"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-lime-400 to-lime-500 opacity-10 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110" />
                <div className="inline-flex p-3 rounded-xl bg-gradient-to-br from-lime-400 to-lime-500 text-white mb-4 shadow-lg shadow-lime-500/20 w-fit">
                  <Store className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2 font-montserrat tracking-tight">Start Selling</h3>
                <p className="text-slate-500 text-sm font-montserrat">Turn your items into cash today</p>
              </Link>

              <a
                href="https://wa.me/2349011022509"
                target="_blank"
                rel="noopener noreferrer"
                className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-lime-400 to-lime-500 p-6 hover:shadow-xl transition-all group h-[215px] flex flex-col justify-center"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110" />
                <div className="inline-flex p-3 rounded-xl bg-white/20 backdrop-blur-sm text-white mb-4 shadow-lg w-fit">
                  <MessageCircle className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2 font-montserrat tracking-tight">Join WhatsApp</h3>
                <p className="text-white/90 text-sm font-montserrat">Get exclusive deals & updates</p>
              </a>
            </div>
          </div>

          {/* Mobile Promo Buttons (Below Hero Carousel on Mobile) */}
          <div className="grid grid-cols-2 gap-3 mt-6 lg:hidden">
            <Link
              href="/signup?redirect=dashboard"
              className="bg-white text-slate-900 font-bold py-4 px-6 rounded-2xl text-center font-montserrat text-sm shadow-lg active:scale-95 transition-transform border border-slate-700"
            >
              Start Selling
            </Link>
            <a
              href="https://wa.me/2349011022509"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-lime-400 text-slate-900 font-bold py-4 px-6 rounded-2xl text-center font-montserrat text-sm shadow-lg active:scale-95 transition-transform"
            >
              Join WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* <PromoCards /> */}

      {/* <AdsPage/> */}

      < MiniListings />

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
      <section className="relative h-56 md:h-64 w-full overflow-hidden">
        {/* Optimized Background Image using Next.js Image */}
        <div className="absolute inset-0">
          <Image
            src="/images/parallax-banner.jpg"
            alt="Discover Amazing Deals"
            fill
            className="object-cover object-center"
            quality={80}
            priority={false}
          />
        </div>

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

    </div >
  );
}
