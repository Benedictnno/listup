"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    Home,
    ShoppingBag,
    Search,
    Heart,
    LayoutDashboard,
    Grid
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { cn } from "@/lib/utils";


const BottomNav = () => {
    const pathname = usePathname();
    const { user } = useAuthStore();

    const navItems = [
        {
            label: "Home",
            icon: Home,
            href: "/",
        },
        {
            label: "Market",
            icon: ShoppingBag,
            href: "/listings",
        },
        {
            label: "Search",
            icon: Search,
            href: "/listings?focus=true",
        },
        {
            label: "Saved",
            icon: Heart,
            href: "/saved",
        },
        {
            label: user?.role === "VENDOR" ? "Dashboard" : "Categories",
            icon: user?.role === "VENDOR" ? LayoutDashboard : Grid,
            href: user?.role === "VENDOR" ? "/dashboard" : "/categories",
        },
    ];

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-200/20 bg-slate-900/90 backdrop-blur-md md:hidden">
            <div className="flex items-center justify-around py-2 px-1">
                {navItems.map((item) => {
                    const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.label}
                            href={item.href}
                            className={cn(
                                "flex flex-col items-center gap-1 rounded-lg px-2 py-1 transition-colors",
                                isActive ? "text-lime-400" : "text-white/60 hover:text-white"
                            )}
                        >
                            <Icon className={cn("h-6 w-6", isActive && "stroke-[2.5px]")} />
                            <span className="text-[10px] font-medium">{item.label}</span>
                        </Link>
                    );
                })}
            </div>
            {/* Safe area offset for mobile browsers */}
            <div className="h-[env(safe-area-inset-bottom)]" />
        </nav>
    );
};

export default BottomNav;
