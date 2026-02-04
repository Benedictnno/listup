"use client";

import { useState } from "react";
import { FiMenu, FiSettings, FiLogOut, FiX, FiHome } from "react-icons/fi";
import { CiBoxList } from "react-icons/ci";
import { AiOutlineRise } from "react-icons/ai";
import { Crown, ShoppingBag, Gift } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { safeLocalStorage } from "@/utils/helpers";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuthStore } from "@/store/authStore";
import Image from "next/image";

import { useFeatureFlag } from "@/context/FeatureFlagContext";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isEnabled } = useFeatureFlag();
  const { user, logout: authLogout } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false); // Start closed on mobile
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  const vendorName = user?.name || "Vendor";
  const storeName = user?.vendorProfile?.storeName || vendorName;
  const vendorEmail = user?.email || "";
  const storeLogo = user?.vendorProfile?.logo;

  const handleLogout = () => {
    authLogout();
    window.location.href = "/login";
  };

  const quickActions = [
    { icon: <ShoppingBag size={20} />, label: "My Products", href: "/dashboard/vendor-listing", color: "bg-green-500" },
    { icon: <CiBoxList size={20} />, label: "Add Listing", href: "/dashboard/create-list", color: "bg-lime-500" },
    ...(isEnabled('Paid_Listing_Promotion') ? [{ icon: <AiOutlineRise size={20} />, label: "Create Ad", href: "/dashboard/promote", color: "bg-blue-500" }] : []),
    ...(isEnabled('referral_system') ? [{ icon: <Gift size={20} />, label: "Earn Referrals", href: "/dashboard/referrals", color: "bg-purple-500" }] : []),
    { icon: <FiSettings size={20} />, label: "Settings", href: "/dashboard/settings", color: "bg-orange-500" },
  ];

  return (
    <ProtectedRoute requireVendor={true}>
      <div className="flex bg-gray-50 min-h-[calc(100vh-64px)]">
        {/* Mobile Overlay */}
        {isOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setIsOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={cn(
            "bg-white border-r border-slate-100 transition-all duration-300 flex flex-col",
            "fixed inset-y-0 left-0 z-50", // Mobile: fixed and on top
            "lg:sticky lg:top-[64px] lg:z-30 lg:h-[calc(100vh-64px)]", // Desktop: sticky below NavBar
            isOpen ? "w-64 translate-x-0" : "w-64 -translate-x-full lg:translate-x-0 lg:w-24"
          )}
        >
          {/* Mobile Close Button */}
          <div className="flex items-center justify-between p-4 border-b lg:hidden">
            <span className="text-lg font-bold">Dashboard</span>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-600 hover:text-black"
            >
              <FiX size={20} />
            </button>
          </div>


          {/* User Profile Section */}
          <div className="p-4 border-b bg-slate-50/50">
            <div className={cn("flex items-center space-x-3", !isOpen && "lg:justify-center")}>
              {storeLogo ? (
                <div className="w-10 h-10 rounded-full overflow-hidden border border-slate-200 flex-shrink-0">
                  <Image
                    src={storeLogo}
                    alt={storeName}
                    width={40}
                    height={40}
                    className="object-cover w-full h-full"
                  />
                </div>
              ) : (
                <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center text-white font-semibold flex-shrink-0">
                  {storeName.charAt(0).toUpperCase()}
                </div>
              )}
              {isOpen && (
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-slate-900 truncate text-sm">{storeName}</p>
                  <p className="text-[10px] text-slate-500 truncate">{vendorEmail}</p>
                </div>
              )}
            </div>
          </div>

          {/* Store Status Indicator */}
          {isOpen && (
            <div className="p-4 border-b">
              <div className="flex items-center gap-2 p-2 bg-green-50 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-green-700">Store Active</span>
              </div>
            </div>
          )}

          {/* Navigation Menu */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-4 space-y-2">
              <Link
                href="/"
                className={cn(
                  "flex items-center gap-3 p-3 rounded-xl transition-all duration-200 group hover:bg-lime-50 hover:text-lime-600",
                  !isOpen && "lg:justify-center lg:p-2"
                )}
              >
                <div className="p-2 rounded-lg bg-lime-100 text-lime-600 group-hover:bg-lime-400 group-hover:text-white transition-colors">
                  <FiHome size={20} />
                </div>
                {isOpen && <span className="font-semibold text-slate-700 group-hover:text-lime-700">Go Home</span>}
              </Link>

              <Link
                href="/dashboard"
                className={cn(
                  "flex items-center gap-3 p-3 rounded-xl transition-all duration-200 group hover:bg-blue-50 hover:text-blue-600",
                  !isOpen && "lg:justify-center lg:p-2"
                )}
              >
                <div className="p-2 rounded-lg bg-blue-100 text-blue-600 group-hover:bg-blue-400 group-hover:text-white transition-colors">
                  <AiOutlineRise size={20} />
                </div>
                {isOpen && <span className="font-semibold text-slate-700 group-hover:text-blue-700">Dashboard</span>}
              </Link>
            </div>

            {/* Quick Actions Menu */}
            <div className="px-4 py-2">
              {isOpen && <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 px-2">Manage Store</h3>}
              <div className="space-y-1">
                {quickActions.map((action, index) => (
                  <Link
                    key={index}
                    href={action.href}
                    className={cn(
                      "flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 transition-all duration-200 group",
                      !isOpen && "lg:justify-center"
                    )}
                    onClick={() => setIsOpen(false)}
                  >
                    <div className={cn(
                      "p-2 rounded-lg transition-colors text-white",
                      action.color
                    )}>
                      {action.icon}
                    </div>
                    {isOpen && <span className="text-sm font-medium text-slate-600 group-hover:text-slate-900">{action.label}</span>}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Logout Button */}
          <div className="p-2 border-t mt-auto">
            <button
              onClick={handleLogout}
              className="flex items-center space-x-3 w-full p-2 rounded-md hover:bg-red-50 text-red-600 transition-colors"
            >
              <FiLogOut />
              {isOpen && <span>Logout</span>}
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <div
          className={cn(
            "flex-1 flex flex-col min-w-0 transition-all duration-300"
          )}
        >
          {/* Topbar */}
          <header className="flex items-center justify-between bg-white shadow p-4">
            <div className="flex items-center space-x-4">
              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsOpen(true)}
                className="text-gray-600 hover:text-black lg:hidden"
              >
                <FiMenu size={22} />
              </button>

              {/* Desktop Collapse Button */}
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="text-gray-600 hover:text-black hidden lg:block"
              >
                <FiMenu size={22} />
              </button>

              <h1 className="font-bold text-lg"><Link href="/dashboard">Dashboard</Link></h1>
            </div>

            <div className="flex items-center space-x-4">
              {/* Post New Listing Button */}
              <Link
                href="/dashboard/create-list"
                className="bg-lime-600 text-white px-4 py-2 rounded-lg hover:bg-lime-700 transition-colors font-medium"
              >
                Post New Listing
              </Link>
            </div>
          </header>

          {/* Children (page content) */}
          <main className="flex-1 overflow-y-auto p-4 lg:p-6">{children}</main>
        </div>

        {/* Click outside to close dropdowns */}
        {showProfileDropdown && (
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowProfileDropdown(false)}
          />
        )}
      </div>
    </ProtectedRoute>
  );
}
