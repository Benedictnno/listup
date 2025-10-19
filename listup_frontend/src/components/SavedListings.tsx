"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { getFavourites, removeFavourite } from "@/lib/api/favourites";
import ListingCard from "@/components/ListingCard";

export default function SavedListings() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const favs = await getFavourites();
        if (!mounted) return;
        setItems(favs.map((f: any) => f.listing));
      } catch (e) {
        console.error('Failed to load saved listings', e);
      } finally { if (mounted) setLoading(false); }
    })();
    return () => { mounted = false; };
  }, []);

  const handleRemove = async (listingId: string) => {
    try {
      await removeFavourite(listingId);
      setItems(prev => prev.filter(i => i.id !== listingId));
    } catch (e) { console.error('Failed to remove saved listing', e); }
  };

  if (loading) return (
    <div className="p-4">Loading saved posts...</div>
  );

  if (items.length === 0) return (
    <Card>
      <CardContent>
        <p className="text-gray-600">You have no saved posts yet. Save listings to view them later.</p>
      </CardContent>
    </Card>
  );
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {items.map((listing) => (
        <div key={listing.id} className="relative">
          <ListingCard listing={listing} />
          <button
            onClick={() => handleRemove(listing.id)}
            aria-label={`Remove saved listing ${listing.title}`}
            className="absolute top-2 right-2 bg-white/90 dark:bg-gray-800/80 border border-gray-200 rounded-full p-1 text-sm text-red-600 hover:bg-red-50"
          >
            Remove
          </button>
        </div>
      ))}
    </div>
  );
}
