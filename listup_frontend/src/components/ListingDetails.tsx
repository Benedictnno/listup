"use client";
import Image from "next/image";
import Link from "next/link";
import { Phone, ClipboardCopy, Heart, Send, ChevronDown } from "lucide-react";
import VerifiedBadge from "./VerifiedBadge";
import { useState, useEffect } from "react";
import { getFavourites, toggleFavourite, removeFavourite } from "../lib/api/favourites";
import { trackListingView, trackListingSave, trackListingMessageClick } from "@/lib/api/analytics";
import { useAuthStore } from "@/store/authStore";
import LoginPromptDialog from "@/components/LoginPromptDialog";
import { copyToClipboard } from "@/utils/copyText";
import { SectionEyebrow } from "@/utils/helpers";

type Seller = {
  id: string;
  name: string;
  phone?: string | null;
  isKYCVerified?: boolean;
  profileImage?: string;
  vendorProfile?: {
    storeName?: string;
    logo?: string;
  };
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
  const [showPhone, setShowPhone] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [selectedQuickMessage, setSelectedQuickMessage] = useState<string>("Is this still available?");
  const [customMessage, setCustomMessage] = useState<string>("");
  const { user } = useAuthStore();

  console.log(listing);

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

    // Track view
    try {
      const sessionKey = 'listup_session_id';
      let sessionId = '';

      if (typeof window !== 'undefined') {
        const cookieValue = document.cookie
          .split("; ")
          .find((row) => row.startsWith(`${sessionKey}=`));

        sessionId = cookieValue ? cookieValue.split("=")[1] : "";

        if (!sessionId) {
          sessionId =
            Math.random().toString(36).substring(2) +
            Date.now().toString(36);

          document.cookie = `${sessionKey}=${sessionId}; path=/; max-age=${60 * 60 * 24 * 7
            }; secure; samesite=strict`;
        }
      }

      trackListingView(listing.id, sessionId);
    } catch (e) {
      console.error('Failed to track listing view', e);
    }

    return () => { mounted = false; };
  }, [listing.id]);


  const handleCopy = async (text: any) => {
    const success = await copyToClipboard(text);
    if (success) {
      alert("Copied to clipboard ✅");
    }
  }

  return (
    <>
      <div className="grid md:grid-cols-5 gap-0 p-6 lg:mx-24">
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
          {/* <div className="flex gap-3 mt-4">
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
          </div> */}

          <div className="my-2">
            {/* <VerifiedBadge seller={listing.seller} /> */}
            {/* <LocationMarkerIcon className="w-5 h-5 text-gray-600" /> */}
            {listing.location}
          </div>
          <div>
            <h2 className="text-3xl font-bold mt-4">Product description</h2>
            <p className="text-gray-700">{listing.description}</p>
          </div>

        </div>

        {/* Right - Info */}
        <div className="col-span-3 flex flex-col gap-4 lg:mx-24">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-semibold">
                {listing.title || "Untitled"}
              </h1>
              <p className="text-3xl font-bold text-green-600 mt-2">
                ₦ {listing.price.toLocaleString()}
              </p>
              <SectionEyebrow > <span className="text-sm text-gray-500">{listing.condition}</span> </SectionEyebrow>
              {/* <span className="text-sm text-gray-500">{listing.condition}</span> */}
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
                      trackListingSave(listing.id);
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
              <div className="flex items-center gap-3">
                <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                  {(listing.seller.vendorProfile?.logo || listing.seller.profileImage) ? (
                    <Image
                      src={listing.seller.vendorProfile?.logo || listing.seller.profileImage || ''}
                      alt={listing.seller.vendorProfile?.storeName || listing.seller.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-lime-100 text-lime-700 font-bold">
                      {(listing.seller.vendorProfile?.storeName || listing.seller.name).charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{listing.seller.vendorProfile?.storeName || listing.seller.name}</span>
                    {listing.seller.isKYCVerified && <VerifiedBadge size="sm" />}
                  </div>
                  <div className="text-xs text-green-600 hover:text-green-700 font-medium">View Store →</div>
                </div>
              </div>
            </Link>
            <div className="flex gap-2 mt-3">
              {showPhone ? <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl shadow hover:bg-green-700" onClick={() => setShowPhone(false)}>
                <Phone size={18} /> {listing.seller.phone}
              </button> : <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl shadow hover:bg-green-700" onClick={() => setShowPhone(true)}>
                <Phone size={18} /> Show Contact
              </button>}
              <button
                className="flex items-center gap-2 px-2 py-1 border rounded-xl shadow hover:bg-gray-100"
                onClick={() => {
                  handleCopy(listing.seller.phone)
                }}
              >
                <ClipboardCopy size={24} /> copy number
              </button>

            </div>

            {/* Quick WhatsApp message composer */}
            <div className="mt-4 space-y-2">
              <label className="text-sm text-gray-600">Quick message</label>
              <div className="flex flex-col gap-2 sm:flex-row">
                <div className="relative flex-1">
                  <select
                    value={selectedQuickMessage}
                    onChange={(e) => setSelectedQuickMessage(e.target.value)}
                    className="w-full appearance-none rounded-xl border px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
                  >
                    <option>Is this still available?</option>
                    <option>Is the price negotiable?</option>
                    <option>Can you share more photos or details?</option>
                    <option>What is the condition and warranty?</option>
                    <option>Where can we meet for inspection?</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                </div>
                <button
                  onClick={() => {
                    const raw = (listing.seller.phone || "").replace(/[^0-9]/g, "");
                    if (!raw) {
                      alert("Seller has no WhatsApp number available.");
                      return;
                    }
                    // Try to normalize Nigerian numbers (11 digits starting with 0)
                    let phone = raw;
                    if (phone.length === 11 && phone.startsWith("0")) {
                      phone = `234${phone.slice(1)}`;
                    }

                    const origin = typeof window !== 'undefined' ? window.location.origin : '';
                    const listingUrl = `${origin}/listings/${listing.id}`;
                    // const productImage = listing.images?.[0] || '';

                    const parts = [
                      `Hi ${listing.seller.name}.I got your number from Listup.ng`,
                      `\n\nProduct: ${listing.title}`,
                      '\n\n', customMessage ? customMessage : selectedQuickMessage,
                      `Price: ₦${listing.price.toLocaleString()}`,
                      // productImage ? `Image: ${productImage}` : undefined,
                      `Link: ${listingUrl}`,
                      // customMessage ? `\n${customMessage}` : undefined,
                    ].filter(Boolean);

                    const text = encodeURIComponent(parts.join("\n"));
                    const url = `https://wa.me/${phone}?text=${text}`;
                    trackListingMessageClick(listing.id);
                    window.open(url, '_blank');
                  }}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-green-600 px-4 py-2 text-white shadow hover:bg-green-700"
                >
                  <Send size={16} /> Send on WhatsApp
                </button>
              </div>
              <textarea
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                placeholder="Add an optional message..."
                className="mt-2 w-full rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
                rows={2}
              />
              <p className="text-xs text-gray-500">Note: WhatsApp deep links cannot attach files. We include the product image URL and page link in the message.</p>
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
