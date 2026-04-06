"use client";

import { useEffect, useState } from "react";
import ListingGrid from "./ListingGrid";
import { Listing } from "@/types/listing";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.listup.ng/api";

export default function SimilarListings({ listingId }: { listingId: string }) {
  const [similar, setSimilar] = useState<Listing[]>([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/listings/${listingId}/similar`);
        if (!res.ok) return;
        const data = await res.json();
        if (mounted) {
          setSimilar(data);
        }
      } catch (e) {
        console.error("Failed to load similar listings", e);
      }
    })();
    
    return () => { mounted = false; };
  }, [listingId]);

  if (similar.length === 0) return null;

  return (
    <section className="px-4 py-8 lg:mx-24 border-t border-gray-100">
      <h2 className="text-xl font-bold mb-4 font-montserrat">Similar Listings</h2>
      <ListingGrid listings={similar} />
    </section>
  );
}
