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
    Grid,
    MessageSquare
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { useChat } from "@/context/ChatContext";
import { cn } from "@/lib/utils";


const BottomNav = () => {
    const pathname = usePathname();
    const { user } = useAuthStore();
    const { unreadCount } = useChat();

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
            label: "Messages",
            icon: MessageSquare,
            href: "/chat",
            authRequired: true
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
                    if (item.authRequired && !user) return null;
                    const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.label}
                            href={item.href}
                            className={cn(
                                "flex flex-col items-center gap-1 rounded-lg px-2 py-1 transition-colors relative",
                                isActive ? "text-lime-400" : "text-white/60 hover:text-white"
                            )}
                        >
                            <div className="relative">
                                <Icon className={cn("h-6 w-6", isActive && "stroke-[2.5px]")} />
                                {item.label === "Messages" && unreadCount > 0 && (
                                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[8px] font-bold text-white border border-slate-900">
                                        {unreadCount > 9 ? '9+' : unreadCount}
                                    </span>
                                )}
                            </div>
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
