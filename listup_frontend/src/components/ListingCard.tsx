"use client";

import Image from "next/image";
import Link from "next/link";
import { Package, MapPin } from "lucide-react";
import VerifiedBadge from "./VerifiedBadge";
import ChatButton from "./chat/ChatButton";

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
          <div className="absolute top-2 right-2 z-10">
            <span className="px-3 py-1 bg-white text-slate-900 text-xs font-bold rounded-md shadow-md uppercase font-montserrat tracking-tight">
              New
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-3 bg-white">
          {/* Title */}
          <h3 className="font-bold text-slate-900 text-base mb-2 line-clamp-1">
            {listing.title}
          </h3>

          {/* Price & Chat Icon */}
          <div className="flex items-center justify-between mb-3">
            <p className="text-xl font-bold text-lime-600">
              ₦{listing.price.toLocaleString()}
            </p>
            <ChatButton
              sellerId={listing.seller?.id || ''}
              listingId={listing.id}
              variant="ghost"
              size="icon"
              label=""
              className="text-slate-900 hover:text-lime-600 hover:bg-transparent p-0 h-auto w-auto"
            />
          </div>

          {/* Meta information - vertical stack */}
          <div className="space-y-2">
            {/* Location */}
            {listing.location && (
              <div className="flex items-center gap-1.5 text-slate-400">
                <MapPin className="h-4 w-4 shrink-0" />
                <span className="text-sm font-montserrat">{listing.location}</span>
              </div>
            )}

            {/* Category Badge */}
            <div className="inline-block px-3 py-1 bg-lime-100/50 rounded-full">
              <span className="text-xs font-medium text-lime-700">All Categories</span>
            </div>

            {/* Seller */}
            {listing.seller && (
              <div className="flex items-center gap-2 pt-1">
                <div className="relative w-5 h-5 rounded-full overflow-hidden bg-slate-900 flex-shrink-0">
                  <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-white uppercase">
                    {(listing.seller.vendorProfile?.storeName || listing.seller.name).charAt(0)}
                  </div>
                </div>
                <span className="truncate text-slate-400 text-xs font-montserrat">
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
