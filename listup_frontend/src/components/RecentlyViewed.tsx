"use client";

import { useEffect, useState } from "react";
import MasonryGrid from "./MasonryGrid";
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
      <h2 className="text-xl font-semibold mb-4 text-slate-900 font-montserrat">Recently Viewed</h2>
      <MasonryGrid listings={viewed} />
    </section>
  );
}
