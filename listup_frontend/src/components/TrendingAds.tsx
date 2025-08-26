"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { fetchActiveAds } from "../lib/api/ad";

interface Ad {
  id: string;
  type: "STOREFRONT" | "PRODUCT_PROMOTION" | "SEARCH_BOOST";
  amount: number;
  status: string;
  paymentStatus: string;
  startDate: string;
  endDate: string;
  vendor: {
    id: string;
    name: string;
    email: string;
  };
  store?: {
    id: string;
    storeName: string;
    description: string;
    location: string;
    businessCategory: string;
    coverImage: string;
  };
  product?: {
    id: string;
    title: string;
    description: string;
    price: number;
    location: string;
    images: string[];
    condition: string;
  };
}

export default function AdsPage() {
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const loadAds = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log("🔄 Loading active ads...");
        
        const activeAds = await fetchActiveAds();
        console.log(`✅ Loaded ${activeAds.length} active ads`);
        
        setAds(activeAds);
      } catch (err) {
        console.error("❌ Error loading ads:", err);
        setError(err instanceof Error ? err.message : "Failed to load ads");
      } finally {
        setLoading(false);
      }
    };

    loadAds();
  }, []);

  // Filter ads by type
  const storefrontAds = ads.filter(ad => ad.type === "STOREFRONT");
  const productAds = ads.filter(ad => ad.type === "PRODUCT_PROMOTION");
  const searchBoostAds = ads.filter(ad => ad.type === "SEARCH_BOOST");

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-4 md:p-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lime-400 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading featured content...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto p-4 md:p-6">
        <div className="text-center py-12">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Something went wrong</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-lime-400 text-white px-6 py-2 rounded-lg hover:bg-lime-300 transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (ads.length === 0) {
    return (
      <div className="max-w-7xl mx-auto p-4 md:p-6">
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">📢</div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">No Featured Content Yet</h3>
          <p className="text-gray-600">Be the first to promote your store or products!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-10">
        {/* Featured Storefronts */}
        <main>
          <h2 className="text-xl font-semibold mb-4">Featured Storefronts ({storefrontAds.length})</h2>
          {storefrontAds.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No featured storefronts available yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {storefrontAds.map((ad) => (
                <div
                  key={ad.id}
                  className="bg-white rounded-lg shadow hover:shadow-lg transition p-3 cursor-pointer"
                  onClick={() => router.push(`/stores/${ad.store?.id || ad.id}`)}
                >
                  <div className="relative w-full h-40 mb-3 bg-gradient-to-br from-blue-100 to-purple-100 rounded-md flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-2xl mb-2">🏪</div>
                      <span className="text-blue-600 text-sm font-medium">Storefront Ad</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-md font-semibold truncate">
                      {ad.store?.storeName || 'Featured Store'}
                    </h3>
                    <p className="text-gray-600 text-sm line-clamp-2">
                      {ad.store?.description || 'Premium store promotion'}
                    </p>
                    <p className="text-gray-400 text-xs">
                      {ad.store?.location || 'Location'}
                    </p>
                    <div className="flex justify-between items-center text-xs text-gray-500">
                      <span>₦{ad.amount?.toLocaleString() || 'N/A'}</span>
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                        Active
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="flex justify-end mt-4">
            <button className="inline-flex text-white items-center gap-2 cursor-pointer rounded-xl bg-lime-400 px-4 py-2 text-sm font-semibold shadow-[inset_0_-2px_0_rgba(0,0,0,0.15)] transition hover:-translate-y-0.5 hover:bg-lime-300 focus:outline-none focus:ring-4 focus:ring-lime-200">
              View More
            </button>
          </div>
        </main>

        {/* Featured Products */}
        <main>
          <h2 className="text-xl font-semibold mb-4">Featured Products ({productAds.length})</h2>
          {productAds.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No featured products available yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {productAds.map((ad) => (
                <div
                  key={ad.id}
                  className="bg-white rounded-lg shadow hover:shadow-lg transition p-3 cursor-pointer"
                  onClick={() => router.push(`/products/${ad.product?.id || ad.id}`)}
                >
                  <div className="relative w-full h-40 mb-3 bg-gradient-to-br from-green-100 to-blue-100 rounded-md flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-2xl mb-2">🛍️</div>
                      <span className="text-green-600 text-sm font-medium">Product Ad</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-green-600 font-bold">₦{ad.product?.price?.toLocaleString() || 'N/A'}</p>
                    <h3 className="text-md font-semibold truncate">
                      {ad.product?.title || 'Featured Product'}
                    </h3>
                    <p className="text-gray-600 text-sm line-clamp-2">
                      {ad.product?.description || 'Premium product promotion'}
                    </p>
                    <p className="text-gray-400 text-xs">
                      {ad.product?.location || 'Location'}
                    </p>
                    <div className="flex justify-between items-center text-xs text-gray-500">
                      <span>Ad: ₦{ad.amount?.toLocaleString() || 'N/A'}</span>
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                        Active
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="flex justify-end mt-4">
            <button className="inline-flex text-white items-center gap-2 cursor-pointer rounded-xl bg-lime-400 px-4 py-2 text-sm font-semibold shadow-[inset_0_-2px_0_rgba(0,0,0,0.15)] transition hover:-translate-y-0.5 hover:bg-lime-300 focus:outline-none focus:ring-4 focus:ring-lime-200">
              View More
            </button>
          </div>
        </main>

        {/* Search Boost Ads */}
        <main>
          <h2 className="text-xl font-semibold mb-4">Trending in Search ({searchBoostAds.length})</h2>
          {searchBoostAds.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No search boost ads available yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {searchBoostAds.map((ad) => (
                <div
                  key={ad.id}
                  className="bg-white rounded-lg shadow hover:shadow-lg transition p-3 cursor-pointer"
                  onClick={() => router.push(`/listings/${ad.id}`)}
                >
                  <div className="relative w-full h-40 mb-3 bg-gradient-to-br from-yellow-100 to-orange-100 rounded-md flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-2xl mb-2">🔍</div>
                      <span className="text-orange-600 text-sm font-medium">Search Boost</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-md font-semibold truncate">
                      {ad.vendor?.name || 'Featured Vendor'}
                    </h3>
                    <p className="text-gray-600 text-sm line-clamp-2">
                      Boosted visibility in search results
                    </p>
                    <p className="text-gray-400 text-xs">
                      {ad.vendor?.email || 'Contact vendor'}
                    </p>
                    <div className="flex justify-between items-center text-xs text-gray-500">
                      <span>Ad: ₦{ad.amount?.toLocaleString() || 'N/A'}</span>
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                        Active
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="flex justify-end mt-4">
            <button className="inline-flex text-white items-center gap-2 cursor-pointer rounded-xl bg-lime-400 px-4 py-2 text-sm font-semibold shadow-[inset_0_-2px_0_rgba(0,0,0,0.15)] transition hover:-translate-y-0.5 hover:bg-lime-300 focus:outline-none focus:ring-4 focus:ring-lime-200">
              View More
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}
