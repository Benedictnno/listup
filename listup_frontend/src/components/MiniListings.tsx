"use client";
import React from "react";
import Link from "next/link";
import ListingCard from "@/components/ListingCard";
import { fetchListings } from "@/lib/api/listing";
import { useQuery } from "@tanstack/react-query";

import { Listing } from "@/types/listing";

// Fetch function for React Query
async function fetchFeaturedListings(): Promise<Listing[]> {
  try {
    const data = await fetchListings();
    // Backend returns paging shape: { items, total, page, pages }
    let items = Array.isArray(data?.items) ? data.items : Array.isArray(data) ? data : [];
    return items.slice(-12);
  } catch (err: unknown) {
    console.error('Failed to load listings:', err);
    throw new Error(err instanceof Error ? err.message : "Failed to load listings");
  }
}

export default function MiniListings() {
  // Use React Query for data fetching with caching
  const { data: listings = [], isLoading, error, refetch } = useQuery({
    queryKey: ['featured-listings'],
    queryFn: fetchFeaturedListings,
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    gcTime: 15 * 60 * 1000, // Keep in cache for 15 minutes
  });

  if (error) {
    return (
      <section className="bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 py-12 md:px-6 flex items-center justify-between">
          <div className="text-sm text-red-600">Experience network issues, please try again</div>
          <button onClick={() => refetch()} className="text-sm font-medium text-lime-600 hover:underline border border-lime-800 px-2 py-1 rounded cursor-pointer">Retry</button>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-12 md:px-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-slate-900 font-montserrat">Featured Listings</h3>
          <Link href="/listings" className="text-sm font-medium text-lime-600 hover:underline">View more</Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-44 animate-pulse rounded bg-white/60" />
            ))}
          </div>
        ) : listings.length === 0 ? (
          <div className="text-sm text-slate-600">No listings available.</div>
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-6">
            {listings.map(raw => {
              // normalize category/seller null -> undefined to match ListingCard props
              const listing = {
                ...raw,
                category: raw.category ?? undefined,
                seller: raw.seller ?? undefined,
              } as Listing;
              return (
                <div key={listing.id} className="col-span-1">
                  <ListingCard listing={listing} />
                </div>
              );
            })}
          </div>
        )}

        {/* extra CTA for small screens */}
        <div className="mt-6 text-center md:hidden">
          <Link href="/listings" className="inline-block rounded bg-lime-400 px-4 py-2 text-sm font-semibold text-slate-900">View more listings</Link>
        </div>
      </div>
    </section>
  );
}
