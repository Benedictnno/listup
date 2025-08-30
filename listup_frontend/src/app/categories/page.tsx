"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { fetchCategories, Category } from "@/lib/api/categories";
import { Package, ShoppingBag, Heart, Utensils, Palette, Monitor, Smartphone, Headphones } from "lucide-react";
import Link from "next/link";

const categoryIcons: Record<string, React.ReactNode> = {
  "Food & Snacks": <Utensils className="w-8 h-8" />,
  "Beauty & Personal Care": <Heart className="w-8 h-8" />,
  "Fashion & Clothing": <ShoppingBag className="w-8 h-8" />,
  "electronics": <Monitor className="w-8 h-8" />,
  "computers": <Monitor className="w-8 h-8" />,
  "mobile-phones": <Smartphone className="w-8 h-8" />,
  "audio": <Headphones className="w-8 h-8" />,
  "Handmade & Crafts": <Palette className="w-8 h-8" />,
};

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCategories() {
      try {
        const fetchedCategories = await fetchCategories();
        // Filter out "All Categories" as it's not a real category
        const filteredCategories = fetchedCategories.filter(cat => cat.slug !== "all-categories");
        setCategories(filteredCategories);
      } catch (error) {
        console.error('Error loading categories:', error);
      } finally {
        setLoading(false);
      }
    }
    loadCategories();
  }, []);

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Product Categories</h1>
        <p className="text-gray-600 mt-2">Browse products by category</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category) => (
          <Link key={category.id} href={`/categories/${category.slug}`}>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
              <CardContent className="p-6 text-center">
                <div className="flex justify-center mb-4">
                  <div className="p-3 bg-blue-100 rounded-full text-blue-600 group-hover:bg-blue-200 transition-colors">
                    {categoryIcons[category.name] || <Package className="w-8 h-8" />}
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {category.name}
                </h3>
                <p className="text-sm text-gray-500">
                  Browse {category.name.toLowerCase()} products
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {categories.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No categories found</h3>
            <p className="text-gray-500">Categories will appear here once they're available.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
