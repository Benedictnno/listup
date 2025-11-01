"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { User, Settings, Shield } from "lucide-react";

type NavItem = {
  title: string;
  href: string;
  icon: React.ReactNode;
};

export default function SettingsNav() {
  const pathname = usePathname();
  
  const navItems: NavItem[] = [
    {
      title: "Profile",
      href: "/settings/profile",
      icon: <User className="h-4 w-4" />
    },
    {
      title: "Roles",
      href: "/settings/roles",
      icon: <Shield className="h-4 w-4" />
    },
    {
      title: "App Settings",
      href: "/settings/app",
      icon: <Settings className="h-4 w-4" />
    }
  ];

  return (
    <Card className="p-2">
      <nav className="flex flex-row md:flex-col space-x-2 md:space-x-0 md:space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all hover:bg-accent hover:text-accent-foreground ${
                isActive ? "bg-accent text-accent-foreground" : "text-muted-foreground"
              }`}
            >
              {item.icon}
              {item.title}
            </Link>
          );
        })}
      </nav>
    </Card>
  );
}