"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { fetchCategories, Category } from "@/lib/api/categories";
import { fetchListingsWithFilters } from "@/lib/api/listing";
import ListingCard from "@/components/ListingCard";
import { Card, CardContent } from "@/components/ui/card";

export default function CategoryPage() {
  const params = useParams();
  const slug = (params && (params as any).slug) || '';
  const [category, setCategory] = useState<Category | null>(null);
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const cats = await fetchCategories();
        if (!mounted) return;
        const found = cats.find((c: Category) => c.slug === slug);
        setCategory(found || null);
        if (found) {
          const res = await fetchListingsWithFilters({ categoryId: found.id, limit: 24 });
          if (!mounted) return;
          setListings(res.items || res);
        }
      } catch (e) {
        console.error('Failed to load category or listings', e);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [slug]);

  if (loading) return <div className="p-6">Loading...</div>;

  if (!category) return (
    <div className="p-6">
      <Card>
        <CardContent>
          <p className="text-gray-600">Category not found.</p>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">{category.name}</h1>
      {listings.length === 0 ? (
        <Card>
          <CardContent>
            <p className="text-gray-600">No products found in this category.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {listings.map((l: any) => (
            <ListingCard key={l.id} listing={l} />
          ))}
        </div>
      )}
    </div>
  );
}
