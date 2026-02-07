"use client";

import Link from "next/link";
import React from "react";
import {
    Headphones,
    Sparkles,
    Laptop,
    Smartphone,
    Shirt,
    Utensils,
    Palette,
    Zap,
    Pizza
} from "lucide-react";

const categories = [
    { name: "Audio", href: "/categories/audio", icon: Headphones },
    { name: "Beauty & Personal care", href: "/categories/beauty-personal-care", icon: Sparkles },
    { name: "Computers", href: "/categories/computers", icon: Laptop },
    { name: "Electronics", href: "/categories/electronics", icon: Zap },
    { name: "Fashion & Clothing", href: "/categories/fashion-clothing", icon: Shirt },
    { name: "Food & Snacks", href: "/categories/food-snacks", icon: Pizza },
    { name: "Handmade & Crafts", href: "/categories/handmade-crafts", icon: Palette },
    { name: "Mobile", href: "/categories/mobile", icon: Smartphone },
    { name: "Utensils", href: "/categories/utensils", icon: Utensils },
];

export default function CategorySidebar() {
    return (
        <aside className="hidden lg:block w-64 h-full shrink-0 overflow-hidden shadow-2xl">
            <div className="p-4">
                <h2 className="text-white font-bold text-lg font-montserrat tracking-tight">Categories</h2>
            </div>
            <nav className="py-2">
                {categories.map((cat, idx) => (
                    <Link
                        key={idx}
                        href={cat.href}
                        className="flex items-center gap-3 px-4 py-2.5 text-slate-300 hover:text-white hover:bg-white/5 transition-all group font-montserrat text-sm"
                    >
                        <cat.icon className="w-4 h-4 text-slate-400 group-hover:text-lime-400 transition-colors" />
                        <span>{cat.name}</span>
                    </Link>
                ))}
            </nav>
        </aside>
    );
}
