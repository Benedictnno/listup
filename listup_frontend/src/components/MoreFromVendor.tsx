"use client";

import { useEffect, useState } from "react";
import MasonryGrid from "./MasonryGrid";
import { Listing } from "@/types/listing";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.listup.ng/api";

export default function MoreFromVendor({ vendorId, currentListingId }: { vendorId: string, currentListingId: string }) {
  const [listings, setListings] = useState<Listing[]>([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/listings/vendors/${vendorId}/public?limit=5&sort=newest`);
        if (!res.ok) return;
        const result = await res.json();
        
        if (mounted && result.success && result.data && result.data.listings) {
          // Exclude current listing and limit to 4
          const filtered = result.data.listings
            .filter((l: Listing) => l.id !== currentListingId)
            .slice(0, 4);
          setListings(filtered);
        }
      } catch (e) {
        console.error("Failed to load vendor listings", e);
      }
    })();
    
    return () => { mounted = false; };
  }, [vendorId, currentListingId]);

  if (listings.length === 0) return null;

  return (
    <section className="px-4 py-8 lg:mx-24 border-t border-gray-100">
      <h2 className="text-xl font-bold mb-4 font-montserrat">More From This Seller</h2>
      <MasonryGrid listings={listings} />
    </section>
  );
}
