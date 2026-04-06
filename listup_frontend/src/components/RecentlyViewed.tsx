"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ListingGrid from "./ListingGrid";
import { useRecentlyViewed } from "@/hooks/useRecentlyViewed";
import { Listing } from "@/types/listing";

export default function RecentlyViewed() {
  const [viewed, setViewed] = useState<Listing[]>([]);
  const { getViewed } = useRecentlyViewed();

  useEffect(() => {
    setViewed(getViewed());
  }, [getViewed]);

  if (viewed.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 md:px-6 mt-8 border-t border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-slate-900 font-montserrat">Recently Viewed</h2>
        <Link href="/listings" className="text-sm font-medium text-lime-600 hover:underline">View more</Link>
      </div>
      <ListingGrid listings={viewed} />
    </section>
  );
}
