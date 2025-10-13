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
/**
 * Marketplace Landing Page
 * Framework: Next.js (app router ready) + TailwindCSS
 * Notes:
 * - Replace <img> with Next/Image in your Next.js app for optimized images.
 * - This file can be used directly as `app/page.tsx` in a Next.js project.
 */

export default function MarketplaceLanding() {

  return (
    <div className="min-h-screen w-full text-slate-800 font-montserrat">
      {/* NAVBAR */}

      {/* HERO */}
      <section className="relative overflow-hidden bg-slate-900">
        <div className="absolute inset-0 -z-0 bg-[radial-gradient(1200px_600px_at_20%_-10%,rgba(148,163,184,0.18),transparent_70%),radial-gradient(800px_400px_at_100%_10%,rgba(148,163,184,0.12),transparent_60%)]" />
        <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-4 py-16 md:grid-cols-2 md:px-6 md:py-24">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="relative z-10"
          >
            <SectionEyebrow>New</SectionEyebrow>
            <h1 className="text-3xl font-bold leading-tight text-white md:text-4xl font-montserrat">
              Find Your Next Great
              <br />
              Deal Today!
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-slate-300 font-montserrat">
              Browse thousands of verified listings across categories. Buy and sell
              smarter with our community-driven marketplace.
            </p>

     


            <form onSubmit={(e) => {
              e.preventDefault();
              const searchInput = e.currentTarget.querySelector('input');
              const searchValue = searchInput?.value || '';
              window.location.href = `/listings?q=${encodeURIComponent(searchValue)}`;
            }} className="border flex rounded h-10 items-center text-white bg-white/10 overflow-hidden">
                <Search className="h-5 w-10 ml-2" />
                <input 
                  type="text" 
                  className="w-full h-full bg-transparent text-white outline-0 px-2 font-montserrat" 
                  placeholder="Search listings..."
                />
                <button 
                  type="submit" 
                  className="h-full px-4 bg-lime-400 text-slate-900 font-medium hover:bg-lime-300 transition font-montserrat"
                >
                  Search
                </button>
            </form>
            <p className="mt-2 text-xs text-slate-400 font-montserrat">No fees to browse. Secure checkout on eligible items.</p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
              <Link href="/signup">
                <PrimaryButton>
                  Get Signed Up 
                </PrimaryButton>
              </Link>
              <Link href={"/login"}>
              <GhostButton>
                Login
              </GhostButton>
              </Link>
            </div>
          </motion.div>


          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="relative z-10"
          >
            <div className="relative mx-auto w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-2xl">
              <Image
                src={"/images/mainImg.jpg"}
                alt="Friends shopping in a cafe"
                width={500}
                height={600}
                className="h-72 w-full object-cover md:h-96"
              />
              <div className="absolute bottom-3 right-3 rounded-xl bg-slate-900/80 px-3 py-1.5 text-[11px] text-white backdrop-blur font-montserrat">
                Verified Sellers Only
              </div>
            </div>
          </motion.div>
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
          <div className="absolute inset-0 bg-slate-900/60"/>
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
    </div>
  );
}
