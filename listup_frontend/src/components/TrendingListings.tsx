"use client";

import { useEffect, useState } from "react";
import MasonryGrid from "./MasonryGrid";
import { Listing } from "@/types/listing";
import { useAuthStore } from "@/store/authStore";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.listup.ng/api";

export default function TrendingListings() {
  const [listings, setListings] = useState<Listing[]>([]);
  const { user } = useAuthStore();

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const endpoint = user ? "/recommendations/for-you" : "/recommendations/trending";
        const headers: Record<string, string> = { "Content-Type": "application/json" };
        
        // Include credentials and auth header if logged in (depending on how auth works, usually cookies or token)
        const res = await fetch(`${API_BASE_URL}${endpoint}?limit=10`, {
          headers,
          credentials: user ? "include" : "same-origin"
        });
        
        if (!res.ok) return;
        const data = await res.json();
        
        if (mounted && Array.isArray(data)) {
          setListings(data);
        }
      } catch (e) {
        console.error("Failed to load trending listings", e);
      }
    })();
    
    return () => { mounted = false; };
  }, [user]);

  if (listings.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 md:px-6">
      <h2 className="text-xl font-bold mb-4 text-slate-900 font-montserrat">
        {user ? "Recommended For You" : "Trending on Listup"}
      </h2>
      <MasonryGrid listings={listings} />
    </section>
  );
}
