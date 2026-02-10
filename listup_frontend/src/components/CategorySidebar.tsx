"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
    Headphones,
    Sparkles,
    Laptop,
    Smartphone,
    Shirt,
    Utensils,
    Palette,
    Zap,
    Pizza,
    Layers,
    ChevronRight
} from "lucide-react";
import axios from '@/utils/axios';

interface Category {
    id: string;
    name: string;
    slug: string;
}

const ICON_MAP: Record<string, any> = {
    'audio': Headphones,
    'beauty-personal-care': Sparkles,
    'computers': Laptop,
    'electronics': Zap,
    'fashion-clothing': Shirt,
    'food-snacks': Pizza,
    'handmade-crafts': Palette,
    'mobile': Smartphone,
    'utensils': Utensils,
};

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
        <aside className="w-full h-full overflow-hidden shadow-2xl bg-[#0f172a]/50 backdrop-blur-lg  p-3">
            <div className="mb-4 flex items-center gap-2 px-2 text-white">
                <Layers className="h-5 w-5 text-lime-400" />
                <h2 className="text-lg font-bold font-montserrat tracking-tight">Categories</h2>
            </div>

            <nav className="flex flex-col gap-1 overflow-y-auto py-2">
                {displayCategories.slice(0, 12).map((cat) => {
                    const Icon = ICON_MAP[cat.slug] || Layers;
                    return (
                        <Link
                            key={cat.id}
                            href={`/categories/${cat.slug}`}
                            className="flex items-center justify-between px-4 py-2 text-slate-300 hover:text-white hover:bg-white/5 transition-all group font-montserrat text-sm rounded-md"
                        >
                            <div className="flex items-center gap-3">
                                <Icon className="w-4 h-4 text-slate-400 group-hover:text-lime-400 transition-colors" />
                                <span>{cat.name}</span>
                            </div>
                            <ChevronRight className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100 text-lime-400" />
                        </Link>
                    );
                })}
                <Link href="/categories" className="mt-4 px-4 text-xs font-medium text-lime-500 hover:text-lime-400 hover:underline font-montserrat">
                    View All Categories
                </Link>
            </nav>
        </aside>
    );
}
