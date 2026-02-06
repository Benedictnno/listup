"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Layers, ChevronRight } from 'lucide-react';
import axios from '@/utils/axios';

interface Category {
    id: string;
    name: string;
    slug: string;
}

const STATIC_CATEGORIES = [
    { name: 'Audio', slug: 'audio' },
    { name: 'Beauty & Personal Care', slug: 'beauty-personal-care' },
    { name: 'Computers', slug: 'computers' },
    { name: 'Electronics', slug: 'electronics' },
    { name: 'Fashion & Clothing', slug: 'fashion-clothing' },
    { name: 'Food & Snacks', slug: 'food-snacks' },
    { name: 'Handmade & Crafts', slug: 'handmade-crafts' },
    { name: 'Mobile', slug: 'mobile' },
    { name: 'Utensils', slug: 'utensils' },
];

export default function CategorySidebar() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await axios.get('/categories');
                if (res.data && Array.isArray(res.data)) {
                    setCategories(res.data);
                } else if (res.data && Array.isArray(res.data.data)) {
                    setCategories(res.data.data);
                } else {
                    // If API structure varies or fails, fallback will apply if empty
                }
            } catch (error) {
                console.error("Failed to fetch categories", error);
            } finally {
                setLoading(false);
            }
        };

        fetchCategories();
    }, []);

    const displayCategories = categories.length > 0 ? categories : STATIC_CATEGORIES.map(c => ({ ...c, id: c.slug }));

    return (
        <aside className="hidden w-64 flex-col gap-1 rounded-lg bg-[#0f172a] p-4 lg:flex h-full min-h-[400px]">
            <div className="mb-2 flex items-center gap-2 px-2 text-white">
                <Layers className="h-5 w-5 text-lime-400" />
                <h2 className="text-lg font-bold">Categories</h2>
            </div>

            <div className="flex flex-col gap-1 overflow-y-auto">
                {displayCategories.slice(0, 12).map((cat) => (
                    <Link
                        key={cat.id}
                        href={`/categories/${cat.slug}`}
                        className="group flex items-center justify-between rounded-md px-3 py-2 text-sm text-slate-300 transition-colors hover:bg-white/5 hover:text-lime-400"
                    >
                        <span>{cat.name}</span>
                        <ChevronRight className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100" />
                    </Link>
                ))}
                <Link href="/categories" className="mt-2 px-3 text-xs font-medium text-lime-500 hover:text-lime-400 hover:underline">
                    View All Categories
                </Link>
            </div>
        </aside>
    );
}
