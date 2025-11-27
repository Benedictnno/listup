"use client";

import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import axios from "axios";

interface Advertisement {
  id: string;
  title: string;
  imageUrl: string;
  targetUrl?: string;
}

export default function FloatingAd() {
  const [showAd, setShowAd] = useState(false);
  const [advertisements, setAdvertisements] = useState<Advertisement[]>([]);
  const [currentAdIndex, setCurrentAdIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const hasFetchedRef = useRef(false);

  // Fetch all active advertisements on component mount
  useEffect(() => {
    // Guard against React StrictMode double-invoking effects in development
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;
    fetchAllAds();
  }, []);

  // Slideshow: Change ad every 5 seconds
  useEffect(() => {
    if (advertisements.length <= 1) return; // No slideshow if only one ad

    const interval = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentAdIndex((prevIndex) => (prevIndex + 1) % advertisements.length);
        setIsTransitioning(false);
      }, 300); // Transition duration
    }, 5000); // Change every 5 seconds

    return () => clearInterval(interval);
  }, [advertisements.length]);

  // Show ad on scroll
  useEffect(() => {
    const handleScroll = () => {
      setShowAd(true);
      window.removeEventListener("scroll", handleScroll);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const fetchAllAds = async () => {
    try {
      setLoading(true);
      // Fetch a single random advertisement to avoid excessive API calls
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/advertisements/random`
      );

      if (response.data?.success && response.data.data?.advertisement) {
        const ad = response.data.data.advertisement as Advertisement;
        setAdvertisements([ad]);
        // Track impression for first (and only) ad
        trackImpression(ad.id);
      } else {
        setAdvertisements([]);
      }
    } catch (error) {
      console.error('Error fetching advertisements:', error);
    } finally {
      setLoading(false);
    }
  };

  // Track impression when ad changes
  useEffect(() => {
    if (advertisements.length > 0 && currentAdIndex > 0) {
      trackImpression(advertisements[currentAdIndex].id);
    }
  }, [currentAdIndex]);

  const trackImpression = async (adId: string) => {
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/advertisements/${adId}/impression`
      );
    } catch (error) {
      console.error('Error tracking impression:', error);
    }
  };

  const handleAdClick = async () => {
    const currentAd = advertisements[currentAdIndex];
    if (!currentAd) return;

    try {
      // Track click
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/advertisements/${currentAd.id}/click`
      );

      // Redirect to target URL if available
      if (currentAd.targetUrl) {
        window.open(currentAd.targetUrl, '_blank', 'noopener,noreferrer');
      }
    } catch (error) {
      console.error('Error tracking click:', error);
    }
  };

  // Don't show if no ads available or still loading
  if (!showAd || loading || advertisements.length === 0) return null;

  const currentAd = advertisements[currentAdIndex];

  return (
    <div className="fixed bottom-0 left-0 w-full z-50">
      <div className="group mx-auto max-w-5xl bg-white border-t shadow-lg p-3 relative">
        {/* Advertisement Label with Counter */}
        <div className="absolute top-1 left-2 text-[10px] text-gray-400 uppercase tracking-wide flex items-center gap-2">
          <span>Advertisement</span>
          {advertisements.length > 1 && (
            <span className="text-[9px] bg-gray-100 px-1.5 py-0.5 rounded">
              {currentAdIndex + 1}/{advertisements.length}
            </span>
          )}
        </div>

        {/* Close Button */}
        <button
          onClick={() => setShowAd(false)}
          className="absolute top-2 right-2 text-gray-500 hover:text-black transition-colors"
          aria-label="Close advertisement"
        >
          <X size={18} />
        </button>

        {/* Advertisement Image with Transition */}
        <div 
          className="w-full h-20 overflow-hidden rounded-md border cursor-pointer hover:opacity-90 mt-4 relative"
          onClick={handleAdClick}
        >
          <img
            src={currentAd.imageUrl}
            alt={currentAd.title}
            className={`w-full h-auto max-h-20 object-cover transition-opacity duration-300 ${
              isTransitioning ? 'opacity-0' : 'opacity-100'
            }`}
          />
        </div>

        {/* Progress Indicators */}
        {advertisements.length > 1 && (
          <div className="flex gap-1 justify-center mt-2">
            {advertisements.map((_, index) => (
              <div
                key={index}
                className={`h-1 rounded-full transition-all duration-300 ${
                  index === currentAdIndex 
                    ? 'w-6 bg-lime-500' 
                    : 'w-1.5 bg-gray-300'
                }`}
              />
            ))}
          </div>
        )}

        {/* Hover Text */}
        <div className="max-h-0 opacity-0 overflow-hidden group-hover:max-h-16 group-hover:opacity-100 transition-all duration-300 ease-in-out mt-2">
          <p className="text-sm font-medium">{currentAd.title}</p>
          {currentAd.targetUrl && (
            <p className="text-xs text-gray-500">
              Click to learn more
            </p>
          )}
        </div>

          <p className="text-sm font-medium">contact support on Whatsapp for your ad's placement (090110225097)</p>
         
        {/* CTA Button */}
        {currentAd.targetUrl && (
          <button 
            onClick={handleAdClick}
            className="bg-lime-500 hover:bg-lime-600 text-white py-2 px-4 rounded-md text-sm mt-2 w-full transition-colors"
          >
            Learn More
          </button>
        )}
      </div>
    </div>
  );

}
