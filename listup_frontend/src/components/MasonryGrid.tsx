"use client";

import React, { useState, useEffect } from "react";
import ListingCard from "./ListingCard";
import { Listing } from "@/types/listing";

export default function MasonryGrid({ listings }: { listings: Listing[] }) {
  const [cols, setCols] = useState(2);

  useEffect(() => {
    const updateCols = () => {
      if (window.innerWidth >= 1024) setCols(5);
      else if (window.innerWidth >= 768) setCols(3);
      else setCols(2);
    };
    updateCols();
    window.addEventListener("resize", updateCols);
    return () => window.removeEventListener("resize", updateCols);
  }, []);

  // Split listings into columns
  const columns: Listing[][] = Array.from({ length: cols }, () => []);

  // Round-robin distribution
  listings.forEach((listing, i) => {
    columns[i % cols].push(listing);
  });

  return (
    <div className="flex w-full gap-2 md:gap-4 lg:gap-6">
      {columns.map((col, idx) => (
        <div key={idx} className="flex flex-col flex-1 gap-4 md:gap-6">
          {col.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      ))}
    </div>
  );
}
