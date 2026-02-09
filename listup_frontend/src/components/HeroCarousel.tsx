"use client";

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';
import axios from '@/utils/axios';

interface Advertisement {
    id: string;
    title: string;
    imageUrl: string;
    targetUrl?: string;
}

export default function HeroCarousel() {
    const [ads, setAds] = useState<Advertisement[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAds = async () => {
            try {
                setLoading(true);
                // Try the carousel-specific endpoint from feature branch
                const response = await axios.get('/advertisements/carousel');

                if (response.data?.success && response.data.data?.advertisements && response.data.data.advertisements.length > 0) {
                    setAds(response.data.data.advertisements);
                } else {
                    // Try the fallback general list endpoint from main
                    const res = await axios.get('/advertisements/list');
                    if (res.data && res.data.success && Array.isArray(res.data.data.advertisements)) {
                        setAds(res.data.data.advertisements);
                    }
                }
            } catch (error) {
                console.error("Failed to fetch hero ads", error);
            } finally {
                setLoading(false);
            }
        };
        fetchAds();
    }, []);

    // Auto-advance
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

    if (loading) {
        return <div className="h-full min-h-[300px] w-full animate-pulse rounded-2xl bg-white/5" />;
    }

    // Fallback if no ads
    if (ads.length === 0) {
        return (
            <div className="relative flex h-full min-h-[300px] w-full flex-col items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-[#1e293b] to-[#0f172a] p-8 text-center text-slate-300">
                <h3 className="mb-2 text-2xl font-bold text-white font-montserrat tracking-tight">Promote Your Business Here</h3>
                <p className="max-w-md font-montserrat">Reach thousands of customers daily. Contact us to place your ad.</p>
                <button className="mt-6 rounded-full bg-lime-500 px-6 py-2 font-bold text-[#0b101b] hover:bg-lime-400 font-montserrat transition-all active:scale-95 shadow-lg shadow-lime-500/20">
                    Contact Support
                </button>
            </div>
        );
    }

    return (
        <div className="relative h-full min-h-[300px] md:min-h-[400px] w-full overflow-hidden rounded-2xl bg-[#0b101b] shadow-2xl">
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
                            className="object-cover"
                            priority
                        />
                        {/* Overlay Gradient for text readability */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                        {/* Content */}
                        <div className="absolute bottom-0 left-0 w-full p-6 md:p-10">
                            <h3 className="text-2xl font-bold text-white md:text-4xl font-montserrat tracking-tight drop-shadow-lg">
                                {ads[currentIndex].title}
                            </h3>
                            {ads[currentIndex].targetUrl && (
                                <a
                                    href={ads[currentIndex].targetUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="mt-6 inline-flex items-center gap-2 rounded-lg bg-lime-500 px-6 py-2.5 text-sm font-bold text-[#0b101b] transition-all hover:scale-105 active:scale-95 shadow-xl shadow-lime-500/20 font-montserrat"
                                >
                                    Visit Link <ExternalLink className="h-4 w-4" />
                                </a>
                            )}
                        </div>
                    </div>
                </motion.div>
            </AnimatePresence>

            {/* Navigation arrows (only if multiple) */}
            {ads.length > 1 && (
                <>
                    <button
                        onClick={prevSlide}
                        className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-2.5 text-white/50 backdrop-blur-md hover:bg-white/20 hover:text-white transition-all active:scale-90 z-10"
                    >
                        <ChevronLeft className="h-6 w-6" />
                    </button>
                    <button
                        onClick={nextSlide}
                        className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-2.5 text-white/50 backdrop-blur-md hover:bg-white/20 hover:text-white transition-all active:scale-90 z-10"
                    >
                        <ChevronRight className="h-6 w-6" />
                    </button>

                    {/* Dots */}
                    <div className="absolute bottom-6 right-0 left-0 flex justify-center gap-2 z-10">
                        {ads.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => setCurrentIndex(idx)}
                                className={`h-2 rounded-full transition-all duration-300 ${idx === currentIndex ? 'w-8 bg-lime-400' : 'w-2 bg-white/30 hover:bg-white/50'}`}
                                aria-label={`Go to slide ${idx + 1}`}
                            />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
