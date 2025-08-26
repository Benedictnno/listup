"use client";
import React from "react";
import Image from "next/image";
import Link from "next/link";

interface SimilarListingProps {
  listings: {
    id: string;
    title: string;
    price: number;
    image: string;
    location: string;
  }[];
}

const SimilarListings: React.FC<SimilarListingProps> = ({ listings }) => {
  return (
    <div className="w-full lg:w-1/4 bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-lg font-semibold mb-4">Similar Listings</h2>
      <div className="grid gap-4">
        {listings.map((item) => (
          <Link
            key={item.id}
            href={`/listing/${item.id}`}
            className="flex items-center space-x-3 hover:bg-gray-50 p-2 rounded-lg"
          >
            <div className="relative w-16 h-16 rounded-md overflow-hidden">
              <Image
                src={item.image}
                alt={item.title}
                fill
                className="object-cover"
              />
            </div>
            <div>
              <p className="text-sm font-medium line-clamp-1">{item.title}</p>
              <p className="text-green-600 font-semibold text-sm">
                ₦{item.price.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500">{item.location}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default SimilarListings;
