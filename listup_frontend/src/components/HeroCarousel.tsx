"use client";

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';
import axios from '@/utils/axios';
import { useQuery } from '@tantml:parameter>react-query';

interface Advertisement {
    id: string;
    title: string;
    imageUrl: string;
    targetUrl?: string;
}

const ContactCTA = () => (
    <div className="relative flex h-full min-h-[300px] w-full flex-col items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-[#1e293b] to-[#0f172a] p-8 text-center text-slate-300">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
        <h3 className="mb-2 text-2xl font-bold text-white font-montserrat tracking-tight z-10">Promote Your Business</h3>
        <p className="max-w-md font-montserrat z-10 mb-6">Reach thousands of customers daily. Get your brand in front of the right audience.</p>
        <a
            href="https://wa.me/2349011022509"
            target="_blank"
            className="z-10 rounded-full bg-lime-400 px-8 py-3 font-bold text-[#0b101b] hover:bg-lime-300 font-montserrat transition-all active:scale-95 shadow-xl shadow-lime-400/20 flex items-center gap-2"
        >
            Contact Support
        </a>
    </div>
);

// Fetch function for React Query
async function fetchCarouselAds(): Promise<Advertisement[]> {
    try {
        // Try the carousel-specific endpoint
        const response = await axios.get('/advertisements/carousel');

        if (response.data?.success && response.data.data?.advertisements && response.data.data.advertisements.length > 0) {
            return response.data.data.advertisements;
        }

        // Fallback to general list endpoint
        const fallbackRes = await axios.get('/advertisements/list');
        if (fallbackRes.data?.success && Array.isArray(fallbackRes.data.data.advertisements)) {
            return fallbackRes.data.data.advertisements;
        }

        return [];
    } catch (error) {
        console.error("Failed to fetch hero ads", error);
        return [];
    }
}

export default function HeroCarousel() {
    const [currentIndex, setCurrentIndex] = useState(0);

    // Use React Query for data fetching with automatic caching
    const { data: ads = [], isLoading } = useQuery({
        queryKey: ['carousel-ads'],
        queryFn: fetchCarouselAds,
        staleTime: 10 * 60 * 1000, // Consider data fresh for 10 minutes
        gcTime: 30 * 60 * 1000, // Keep in cache for 30 minutes
    });

    // Auto-advance carousel
    useEffect(() => {
        if (ads.length <= 1) return;
        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % ads.length);
        }, 6000); // 6 seconds
        return () => clearInterval(interval);
    }, [ads.length]);

    const nextSlide = () => {
        if (ads.length > 0) setCurrentIndex((prev) => (prev + 1) % ads.length);
    };

    const prevSlide = () => {
        if (ads.length > 0) setCurrentIndex((prev) => (prev - 1 + ads.length) % ads.length);
    };

    if (isLoading) {
        return (
            <div className="h-full min-h-[300px] w-full overflow-hidden rounded-2xl bg-slate-800 animate-shimmer relative">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
            </div>
        );
    }

    // Fallback if no ads
    if (ads.length === 0) {
        return <ContactCTA />;
    }

    return (
        <div className="relative h-full min-h-[250px] md:min-h-[400px] w-full overflow-hidden rounded-2xl bg-[#0b101b] shadow-2xl">
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentIndex}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    className="absolute inset-0 h-full w-full"
                >
                    {/* Ad Image */}
                    <div className="relative h-full w-full">
                        <Image
                            src={ads[currentIndex].imageUrl}
                            alt={ads[currentIndex].title}
                            fill
                            className="object-fit"
                            priority
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                        {/* Content Overlay */}
                        {/* <div className="absolute bottom-10 left-6 right-6 md:left-12 md:right-12 z-20">
                            <motion.div
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.2 }}
                                className="inline-block p-1 px-3 mb-4 rounded-full bg-lime-400/20 border border-lime-400/30 backdrop-blur-md"
                            >
                                <span className="text-lime-400 text-[10px] font-bold uppercase tracking-widest">Featured Offer</span>
                            </motion.div>

                            <motion.h3
                                initial={{ y: 10, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.3 }}
                                className="text-3xl font-extrabold text-white md:text-5xl lg:text-6xl font-montserrat leading-tight mb-4 drop-shadow-2xl max-w-2xl"
                            >
                                {ads[currentIndex].title}
                            </motion.h3>

                            {ads[currentIndex].targetUrl && (
                                <motion.div
                                    initial={{ y: 10, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.4 }}
                                >
                                    <a
                                        href={ads[currentIndex].targetUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 rounded-xl bg-lime-400 px-8 py-4 text-sm font-bold text-[#0b101b] transition-all hover:bg-lime-300 hover:scale-105 active:scale-95 shadow-2xl shadow-lime-400/30 font-montserrat"
                                    >
                                        Explore Now <ChevronRight className="h-5 w-5" />
                                    </a>
                                </motion.div>
                            )}
                        </div> */}
                    </div>
                </motion.div>
            </AnimatePresence>

            {/* Navigation arrows (only if multiple) */}
            {ads.length > 1 && (
                <>
                    <button
                        onClick={prevSlide}
                        className="absolute left-6 top-1/2 -translate-y-1/2 rounded-full h-12 w-12 bg-white/10 flex items-center justify-center text-white backdrop-blur-lg border border-white/20 hover:bg-white/20 hover:border-white/40 transition-all active:scale-90 z-30 group"
                    >
                        <ChevronLeft className="h-6 w-6 group-hover:-translate-x-0.5 transition-transform" />
                    </button>
                    <button
                        onClick={nextSlide}
                        className="absolute right-6 top-1/2 -translate-y-1/2 rounded-full h-12 w-12 bg-white/10 flex items-center justify-center text-white backdrop-blur-lg border border-white/20 hover:bg-white/20 hover:border-white/40 transition-all active:scale-90 z-30 group"
                    >
                        <ChevronRight className="h-6 w-6 group-hover:translate-x-0.5 transition-transform" />
                    </button>

                    {/* Progress Dots */}
                    <div className="absolute bottom-8 right-6 left-6 flex justify-center md:justify-end gap-3 z-30">
                        {ads.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => setCurrentIndex(idx)}
                                className={`group relative h-1.5 rounded-full overflow-hidden transition-all duration-500 ${idx === currentIndex ? 'w-12 bg-lime-400' : 'w-3 bg-white/30 hover:bg-white/50'}`}
                                aria-label={`Go to slide ${idx + 1}`}
                            >
                                {idx === currentIndex && (
                                    <motion.div
                                        initial={{ x: '-100%' }}
                                        animate={{ x: '0%' }}
                                        transition={{ duration: 6, ease: "linear" }}
                                        className="absolute inset-0 bg-white/40"
                                    />
                                )}
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
