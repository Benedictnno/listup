"use client";

import React from "react";
import ListingCard from "./ListingCard";
import { Listing } from "@/types/listing";

interface ListingGridProps {
  listings: Listing[];
  className?: string;
}

/**
 * Standard CSS Grid for Listing Cards
 */
export default function ListingGrid({ listings, className = "" }: ListingGridProps) {
  return (
    <div className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6 ${className}`}>
      {listings.map((listing) => (
        <ListingCard key={listing.id} listing={listing} />
      ))}
    </div>
  );
}
