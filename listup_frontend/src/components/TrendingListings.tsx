"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import Link from "next/link";
import ListingGrid from "./ListingGrid";
import { Listing } from "@/types/listing";
import { useAuthStore } from "@/store/authStore";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.listup.ng/api";

export default function TrendingListings() {
  const { user } = useAuthStore();

  const { data: listings = [] } = useSuspenseQuery({
    queryKey: ['trending-listings', !!user],
    queryFn: async () => {
      const endpoint = user ? "/recommendations/for-you" : "/recommendations/trending";
      const res = await fetch(`${API_BASE_URL}${endpoint}?limit=10`, {
        headers: { "Content-Type": "application/json" },
        credentials: user ? "include" : "same-origin"
      });
      if (!res.ok) return [];
      return await res.json();
    },
    staleTime: 5 * 60 * 1000,
  });

  if (listings.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 md:px-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-slate-900 font-montserrat">
          {user ? "Recommended For You" : "Trending on Listup"}
        </h2>
        <Link href="/listings" className="text-sm font-medium text-lime-600 hover:underline">View more</Link>
      </div>
      <ListingGrid listings={listings as Listing[]} />
    </section>
  );
}

