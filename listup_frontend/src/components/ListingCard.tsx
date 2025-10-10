"use client";

import Image from "next/image";
import Link from "next/link";
import { Package, MapPin } from "lucide-react";

interface Listing {
  id: string;
  title: string;
  description: string;
  price: number;
  images: string[];
  location?: string;
  condition?: string;
  category?: {
    name: string;
  };
  seller?: {
    name: string;
  };
}

interface ListingCardProps {
  listing: Listing;
}

export default function ListingCard({ listing }: ListingCardProps) {
  const mainImage = listing.images && listing.images.length > 0 
    ? listing.images[0] 
    : null;

  return (
    <Link href={`/listings/${listing.id}`} className="group">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200">
        {/* Image */}
        <div className="aspect-square relative overflow-hidden bg-gray-100">
          {mainImage ? (
            <Image
              src={mainImage}
              alt={listing.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-200"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Package className="h-12 w-12 text-gray-300" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-3 md:p-4">
          {/* (Save button intentionally removed; saved/unsaved actions are available on the single listing page) */}
          <h3 className="font-semibold text-gray-900 text-base md:text-lg mb-1 md:mb-2 line-clamp-2 group-hover:text-lime-600 transition-colors">
            {listing.title}
          </h3>

          <p className="text-xl md:text-3xl font-bold text-lime-600 mb-1 md:mb-2">
            ₦{listing.price.toLocaleString()}
          </p>

          <p className="text-gray-600 text-sm mb-2 line-clamp-2">
            {listing.description}
          </p>

          {/* Meta information - stack on mobile */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-sm text-gray-500 gap-2">
              <div className="flex items-center gap-2 text-sm min-w-0">
                {listing.location && (
                  <div className="flex items-center gap-1 min-w-0">
                    <MapPin className="h-4 w-4 flex-shrink-0" />
                    <span className="text-sm truncate block min-w-0">{listing.location}</span>
                  </div>
                )}
                {listing.condition && (
                  <span className="px-2 py-0.5 bg-gray-100 rounded-full text-xs flex-shrink-0">
                    {listing.condition}
                  </span>
                )}
              </div>

            {/* Category and Seller - place below on small screens */}
            <div className="flex items-center justify-end gap-3 text-xs text-gray-500 flex-wrap">
              {listing.category && (
                <span className="px-2 py-1 bg-lime-50 text-lime-700 rounded-full">
                  {listing.category.name}
                </span>
              )}
              {listing.seller && (
                <span className="truncate">by {listing.seller.name}</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
