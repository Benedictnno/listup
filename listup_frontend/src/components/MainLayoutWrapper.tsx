"use client";

import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export default function MainLayoutWrapper({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isDashboard = pathname.startsWith("/dashboard");

    return (
        <div className={cn(
            "transition-all duration-300",
            !isDashboard && "pb-20 md:pb-0"
        )}>
            {children}
        </div>
    );
}
