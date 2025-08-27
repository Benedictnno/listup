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
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 text-lg mb-2 line-clamp-2 group-hover:text-lime-600 transition-colors">
            {listing.title}
          </h3>
          
          <p className="text-3xl font-bold text-lime-600 mb-2">
            ₦{listing.price.toLocaleString()}
          </p>
          
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {listing.description}
          </p>
          
          {/* Meta information */}
          <div className="flex items-center justify-between text-sm text-gray-500">
            {listing.location && (
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                <span>{listing.location}</span>
              </div>
            )}
            
            {listing.condition && (
              <span className="px-2 py-1 bg-gray-100 rounded-full text-xs">
                {listing.condition}
              </span>
            )}
          </div>
          
          {/* Category and Seller */}
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="flex items-center justify-between text-xs text-gray-500">
              {listing.category && (
                <span className="px-2 py-1 bg-lime-50 text-lime-700 rounded-full">
                  {listing.category.name}
                </span>
              )}
              
              {listing.seller && (
                <span className="truncate">
                  by {listing.seller.name}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
