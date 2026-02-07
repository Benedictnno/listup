"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import axios from "axios";
import Image from "next/image";

interface Advertisement {
    id: string;
    title: string;
    imageUrl: string;
    targetUrl?: string;
}

export default function HeroCarousel() {
    const [advertisements, setAdvertisements] = useState<Advertisement[]>([]);
    const [currentAdIndex, setCurrentAdIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const hasFetchedRef = useRef(false);

    useEffect(() => {
        if (hasFetchedRef.current) return;
        hasFetchedRef.current = true;
        fetchAds();
    }, []);

    useEffect(() => {
        if (advertisements.length <= 1) return;

        const interval = setInterval(() => {
            handleNext();
        }, 6000);

        return () => clearInterval(interval);
    }, [advertisements.length]);

    const fetchAds = async () => {
        try {
            setLoading(true);
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.listup.ng/api';
            const response = await axios.get(`${apiUrl}/advertisements/carousel`);

            if (response.data?.success && response.data.data?.advertisements && response.data.data.advertisements.length > 0) {
                setAdvertisements(response.data.data.advertisements);
            } else {
                // Fallback placeholder if no ads found
                setAdvertisements([
                    {
                        id: 'placeholder',
                        title: 'Welcome to ListUp Marketplace',
                        imageUrl: '/images/mainImg.jpg',
                        targetUrl: '/listings'
                    }
                ]);
            }
        } catch (error) {
            console.error('Error fetching hero ads:', error);
            setAdvertisements([
                {
                    id: 'error',
                    title: 'Discover Great Deals',
                    imageUrl: '/images/mainImg.jpg'
                }
            ]);
        } finally {
            setLoading(false);
        }
    };

    const handleNext = () => {
        setIsTransitioning(true);
        setTimeout(() => {
            setCurrentAdIndex((prev) => (prev + 1) % advertisements.length);
            setIsTransitioning(false);
        }, 400);
    };

    const handlePrev = () => {
        setIsTransitioning(true);
        setTimeout(() => {
            setCurrentAdIndex((prev) => (prev - 1 + advertisements.length) % advertisements.length);
            setIsTransitioning(false);
        }, 400);
    };

    if (loading) {
        return (
            <div className="w-full h-[300px] md:h-full bg-slate-800 animate-pulse rounded-2xl flex items-center justify-center">
                <div className="text-slate-600 font-medium">Loading deals...</div>
            </div>
        );
    }

    const currentAd = advertisements[currentAdIndex];

    return (
        <div className="relative group w-full h-[300px] md:h-full bg-slate-800 rounded-2xl overflow-hidden shadow-2xl">
            <div className={`w-full h-full relative transition-opacity duration-500 ${isTransitioning ? 'opacity-50' : 'opacity-100'}`}>
                <Image
                    src={currentAd.imageUrl}
                    alt={currentAd.title}
                    fill
                    priority
                    className="object-cover"
                />
                {/* Overlays */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent" />

                <div className="absolute bottom-6 left-6 right-6">
                    <h3 className="text-white text-xl md:text-2xl font-bold font-montserrat drop-shadow-lg">
                        {currentAd.title}
                    </h3>
                    {currentAd.targetUrl && (
                        <a
                            href={currentAd.targetUrl}
                            className="inline-block mt-3 px-6 py-2 bg-lime-400 text-slate-900 font-bold rounded-lg hover:bg-lime-300 transition-colors text-sm font-montserrat"
                        >
                            Learn More
                        </a>
                    )}
                </div>
            </div>

            {/* Navigation arrows (only show if multiple ads) */}
            {advertisements.length > 1 && (
                <>
                    <button
                        onClick={handlePrev}
                        className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/10 backdrop-blur-md text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/20"
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button
                        onClick={handleNext}
                        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/10 backdrop-blur-md text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/20"
                    >
                        <ChevronRight className="w-6 h-6" />
                    </button>
                </>
            )}

            {/* Dots */}
            {advertisements.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                    {advertisements.map((_, idx) => (
                        <div
                            key={idx}
                            className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentAdIndex ? 'w-6 bg-lime-400' : 'w-1.5 bg-white/30'}`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
