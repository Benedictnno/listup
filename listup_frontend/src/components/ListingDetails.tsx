"use client";
import Image from "next/image";
import Link from "next/link";
import { Phone, MessageSquare, Heart } from "lucide-react";
import { useState, useEffect } from "react";
import { getFavourites, toggleFavourite, removeFavourite } from "../lib/api/favourites";
import { useAuthStore } from "@/store/authStore";
import LoginPromptDialog from "@/components/LoginPromptDialog";

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
  const [isSaved, setIsSaved] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const { user } = useAuthStore();

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const favs = await getFavourites();
        if (!mounted) return;
        const found = favs.find((f: any) => f.listing && f.listing.id === listing.id);
        setIsSaved(Boolean(found));
      } catch (e) {
        // ignore - probably unauthenticated
      }
    })();
    return () => { mounted = false; };
  }, [listing.id]);

  return (
    <>
      <div className="grid md:grid-cols-4 gap-6 p-6 lg:mx-24">
      {/* Left - Images */}
      <div className="col-span-2">
        {/* Main Image */}
        <div className="relative w-full rounded-xl overflow-hidden shadow">
          <div className="w-full h-[360px] md:h-[520px] lg:h-[640px] bg-gray-50">
            <Image
              src={selectedImage}
              alt={listing.title}
              fill
              style={{ objectFit: 'contain', objectPosition: 'center' }}
              sizes="(min-width:1024px) 700px, (min-width:768px) 500px, 100vw"
              className="rounded-xl"
            />
          </div>
        </div>

        {/* Thumbnail Gallery */}
        <div className="flex gap-3 mt-4">
          {listing.images.map((img, idx) => (
            <button key={idx} onClick={() => setSelectedImage(img)} className={`rounded-lg overflow-hidden border-2 ${selectedImage === img ? 'border-green-600' : 'border-transparent'}`}>
              <Image
                src={img}
                alt={`Thumbnail ${idx + 1}`}
                width={80}
                height={80}
                className="w-20 h-20 object-cover object-center"
              />
            </button>
          ))}
        </div>

        <div>
          <h2 className="text-3xl font-bold mt-4">Product description</h2>
        <p className="text-gray-700">{listing.description}</p>
        </div>

      </div>

      {/* Right - Info */}
      <div className="col-span-2 flex flex-col gap-4 lg:mx-24">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-semibold">
              {listing.title || "Untitled"}
            </h1>
            <p className="text-3xl font-bold text-green-600 mt-2">
              ₦ {listing.price.toLocaleString()}
            </p>
            <span className="text-sm text-gray-500">{listing.condition}</span>
          </div>
          <div className="ml-4">
            <button
              className="flex items-center gap-2 px-4 py-2 border rounded-xl shadow hover:bg-gray-100"
              onClick={async () => {
                try {
                  if (!user) {
                    setShowLoginPrompt(true);
                    return;
                  }
                  if (isSaved) {
                    await removeFavourite(listing.id);
                    setIsSaved(false);
                  } else {
                    await toggleFavourite(listing.id);
                    setIsSaved(true);
                  }
                } catch (e) {
                  console.error('Failed to toggle saved', e);
                }
              }}
            >
              <Heart size={18} className={`${isSaved ? 'text-red-500' : 'text-gray-500'}`} /> <span>Save</span>
            </button>
          </div>
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
    <LoginPromptDialog open={showLoginPrompt} onOpenChange={setShowLoginPrompt} />
    </>
  );
}
