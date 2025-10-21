"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import ListingCard from "@/components/ListingCard";
import { fetchListings } from "@/lib/api/listing";

interface Listing {
  id: string;
  title: string;
  description: string;
  price: number;
  images: string[];
  location?: string;
  condition?: string;
  category?: { name: string };
  seller?: { name: string };
}

export default function MiniListings() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        setLoading(true);
        const data = await fetchListings();
        if (!mounted) return;
        // Backend returns paging shape: { items, total, page, pages }
        let items = Array.isArray(data?.items) ? data.items : Array.isArray(data) ? data : [];
        // take first 12 listings
        // fetchListings returns parsed JSON (likely an array or {data}) — handle common shapes
        // const items = Array.isArray(data) ? data : data?.data || data?.listings || [];

        setListings( items.slice(-12));
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to load listings");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, []);

  return (
    <section className="bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-12 md:px-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-slate-900 font-montserrat">Featured Listings</h3>
          <Link href="/listings" className="text-sm font-medium text-lime-600 hover:underline">View more</Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-44 animate-pulse rounded bg-white/60" />
            ))}
          </div>
        ) : error ? (
          <div className="text-sm text-red-600">{error}</div>
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
