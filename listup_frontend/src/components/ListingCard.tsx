"use client";

import Image from "next/image";
import Link from "next/link";
import { Package, MapPin } from "lucide-react";
import VerifiedBadge from "./VerifiedBadge";
import ChatButton from "./chat/ChatButton";

import { Listing } from "@/types/listing";

interface ListingCardProps {
  listing: Listing;
}

export default function ListingCard({ listing }: ListingCardProps) {
  const mainImage = listing.images && listing.images.length > 0
    ? listing.images[0]
    : null;

  return (
    <Link href={`/listings/${listing.id}`} className="group block break-inside-avoid mb-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-200 h-full flex flex-col">
        {/* Image */}
        <div className="aspect-[3/3] relative overflow-hidden bg-gray-100">
          {mainImage ? (
            <Image
              src={mainImage}
              alt={listing.title}
              fill
              priority
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
              className="object-cover group-hover:scale-110 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Package className="h-12 w-12 text-gray-300" />
            </div>
          )}
          {listing.condition && (
            <div className="absolute top-2 right-2 z-10">
              <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-slate-900 text-[10px] font-bold rounded-md shadow-md uppercase font-montserrat tracking-tight">
                {listing.condition}
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4 bg-white">
          {/* Title */}
          <h3 className="font-bold text-slate-900 text-sm mb-2 line-clamp-1 font-montserrat group-hover:text-lime-600 transition-colors">
            {listing.title}
          </h3>

          {/* Price & Chat Icon */}
          <div className="flex items-center justify-between mb-3">
            <p className="text-xl font-black text-lime-600 font-montserrat">
              ₦{listing.price.toLocaleString()}
            </p>
            <ChatButton
              sellerId={listing.seller?.id || ''}
              listingId={listing.id}
              variant="ghost"
              size="icon"
              label=""
              className="text-slate-400 hover:text-lime-600 hover:bg-lime-50 rounded-full transition-all"
            />
          </div>

          {/* Meta information - vertical stack */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            {/* Location */}
            {listing.location && (
              <div className="flex items-center gap-1.5 text-slate-400">
                <MapPin className="h-3.5 w-3.5 shrink-0" />
                <span className="text-xs font-montserrat truncate">{listing.location}</span>
              </div>
            )}

            {/* Seller */}
            {listing.seller && (
              <div className="flex items-center gap-2">
                <div className="relative w-5 h-5 rounded-full overflow-hidden bg-slate-100 flex-shrink-0 border border-slate-200">
                  {(listing.seller.profileImage || listing.seller.vendorProfile?.logo) ? (
                    <Image
                      src={listing.seller.profileImage || listing.seller.vendorProfile?.logo || ""}
                      alt={listing.seller.vendorProfile?.storeName || listing.seller.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-slate-600 uppercase">
                      {(listing.seller.vendorProfile?.storeName || listing.seller.name).charAt(0)}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-1 min-w-0">
                  <span className="truncate text-slate-500 text-[11px] font-montserrat font-medium">
                    {listing.seller.vendorProfile?.storeName || listing.seller.name}
                  </span>
                  {listing.seller.isKYCVerified && <VerifiedBadge size="sm" />}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

