"use client";
import React from "react";
import Link from "next/link";
import ListingGrid from "@/components/ListingGrid";
import { fetchListings } from "@/lib/api/listing";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Listing } from "@/types/listing";

// Fetch function for React Query
async function fetchFeaturedListings(): Promise<Listing[]> {
  try {
    const data = await fetchListings();
    // Backend returns paging shape: { items, total, page, pages }
    let items = Array.isArray(data?.items) ? data.items : Array.isArray(data) ? data : [];
    return items.slice(-15);
  } catch (err: unknown) {
    console.error('Failed to load listings:', err);
    return [];
  }
}

export default function MiniListings() {
  // Use React Query for data fetching with Suspense integration
  const { data: listings = [] } = useSuspenseQuery({
    queryKey: ['featured-listings'],
    queryFn: fetchFeaturedListings,
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
  });

  return (
    <section className="bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-12 md:px-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-slate-900 font-montserrat">Featured Listings</h3>
          <Link href="/listings" className="text-sm font-medium text-lime-600 hover:underline">View more</Link>
        </div>

        {listings.length === 0 ? (
          <div className="text-sm text-slate-600">No listings available.</div>
        ) : (
          <ListingGrid listings={listings as Listing[]} />
        )}

        {/* extra CTA for small screens */}
        <div className="mt-6 text-center md:hidden">
          <Link href="/listings" className="inline-block rounded bg-lime-400 px-4 py-2 text-sm font-semibold text-slate-900">View more listings</Link>
        </div>
      </div>
    </section>
  );
}
