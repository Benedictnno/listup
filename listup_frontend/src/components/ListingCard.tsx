"use client";

import Image from "next/image";
import Link from "next/link";
import { Package, MapPin } from "lucide-react";
import VerifiedBadge from "./VerifiedBadge";

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
    isKYCVerified?: boolean;
    profileImage?: string;
    vendorProfile?: {
      storeName?: string;
      logo?: string;
    };
  };
}

interface ListingCardProps {
  listing: Listing;
}

export default function ListingCard({ listing }: ListingCardProps) {
  const mainImage = listing.images && listing.images.length > 0
    ? listing.images[0]
    : null;
  console.log(listing);

  return (
    <Link href={`/listings/${listing.id}`} className="group block break-inside-avoid mb-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200 h-full flex flex-col">
        {/* Image */}
        <div className="aspect-[3/3] relative overflow-hidden bg-gray-100">
          {mainImage ? (
            <Image
              src={mainImage}
              alt={listing.title}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
              className="object-cover group-hover:scale-105 transition-transform duration-200"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Package className="h-12 w-12 text-gray-300" />
            </div>
          )}
          {listing.condition && (
            <div className="absolute top-2 right-2 z-10">
              <span className="px-2 py-1 bg-white/90 backdrop-blur-sm text-gray-700 text-xs font-medium rounded-md shadow-sm border border-gray-100">
                {listing.condition}
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-3">
          {/* Title */}
          <h3 className="font-semibold text-gray-900 text-sm mb-2 line-clamp-2 group-hover:text-lime-600 transition-colors">
            {listing.title}
          </h3>

          {/* Price */}
          <p className="text-lg font-bold text-lime-600 mb-3">
            ₦{listing.price.toLocaleString()}
          </p>

          {/* Meta information - vertical stack */}
          <div className="space-y-2">
            {/* Location */}
            {listing.location && (
              <div className="flex items-center gap-1 text-gray-500">
                <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                <span className="text-xs truncate">{listing.location}</span>
              </div>
            )}

            {/* Category */}
            {listing.category && (
              <div className="flex items-start">
                <span className="text-xs text-gray-600">
                  <span className="text-gray-400">All Categories</span>
                </span>
              </div>
            )}

            {/* Seller */}
            {listing.seller && (
              <div className="flex items-center gap-1.5">
                <div className="relative w-4 h-4 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                  {(listing.seller.vendorProfile?.logo || listing.seller.profileImage) ? (
                    <Image
                      src={listing.seller.vendorProfile?.logo || listing.seller.profileImage || ''}
                      alt={listing.seller.vendorProfile?.storeName || listing.seller.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-lime-100 text-lime-700 text-[10px] font-bold">
                      {(listing.seller.vendorProfile?.storeName || listing.seller.name).charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <span className="truncate text-gray-600 text-xs">
                  {listing.seller.vendorProfile?.storeName || listing.seller.name}
                </span>
                {listing.seller.isKYCVerified && <VerifiedBadge size="sm" />}
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
