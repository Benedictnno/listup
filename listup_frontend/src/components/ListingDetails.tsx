"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Phone, MessageSquare } from "lucide-react";

type Seller = {
  id: string;
  name: string;
  phone?: string | null;
};

type Listing = {
  id: string;
  title: string;
  description: string;
  price: number;
  condition: string;
  images: string[];
  location: string;
  category?: string | null;
  isActive: boolean;
  createdAt: string;
  seller: Seller;
};

export default function ListingDetails({ listing }: { listing: Listing }) {
  const [selectedImage, setSelectedImage] = useState(listing.images[0]);
  const [showPhone , setShowPhone] = useState(false);

  return (
      <div className="grid md:grid-cols-3 gap-6 p-6">
      {/* Left - Images */}
      <div className="col-span-2">
        {/* Main Image */}
        <Image
          src={selectedImage}
          alt={listing.title}
          width={600}
          height={400}
          className="w-full h-[400px] object-cover rounded-xl shadow"
        />

        {/* Thumbnail Gallery */}
        <div className="flex gap-3 mt-4">
          {listing.images.map((img, idx) => (
            <Image
              key={idx}
              src={img}
              alt={`Thumbnail ${idx + 1}`}
              width={80}
              height={80}
              className={`w-20 h-20 object-cover object-center rounded-lg cursor-pointer border-2 ${
                selectedImage === img ? "border-green-600" : "border-transparent"
              }`}
              onClick={() => setSelectedImage(img)}
            />
          ))}
        </div>

        <div>
          <h2 className="text-3xl font-bold mt-4">Product description</h2>
        <p className="text-gray-700">{listing.description}</p>
        </div>

      </div>

      {/* Right - Info */}
      <div className="col-span-1 flex flex-col gap-4">
        <div>
          <h1 className="text-2xl font-semibold">
            {listing.title || "Untitled"}
          </h1>
          <p className="text-3xl font-bold text-green-600 mt-2">
            ₦ {listing.price.toLocaleString()}
          </p>
          <span className="text-sm text-gray-500">{listing.condition}</span>
        </div>


        <div className="p-4 border rounded-xl shadow-sm">
          <h2 className="font-semibold">Seller Info</h2>
          <Link 
            href={`/vendors/${listing.seller.id}`}
            className="mt-1 block text-green-600 hover:text-green-700 font-medium cursor-pointer hover:underline transition-colors"
          >
            {listing.seller.name}
            <span className="text-xs ml-2">→ View Store</span>
          </Link>
          <div className="flex gap-2 mt-3">
           {showPhone ? <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl shadow hover:bg-green-700" onClick={() => setShowPhone(false)}>
              <Phone size={18} /> {listing.seller.phone}
            </button> : <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl shadow hover:bg-green-700" onClick={() => setShowPhone(true)}>
              <Phone size={18} /> Show Contact 
            </button>}
            <button className="flex items-center gap-2 px-4 py-2 border rounded-xl shadow hover:bg-gray-100">
              <MessageSquare size={18} /> Start Chat
            </button>
          </div>
        </div>

        <div className="p-4 border rounded-xl mt-4">
          <h3 className="font-semibold">Safety Tips</h3>
          <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1 mt-2">
            <li>Avoid paying in advance, even for delivery</li>
            <li>Meet with the seller at a safe public place</li>
            <li>Inspect the item properly before buying</li>
            <li>Pay only when satisfied</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
