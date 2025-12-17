"use client";

import { useState } from "react";
import { FiMenu, FiSettings, FiLogOut, FiX } from "react-icons/fi";
import { CiBoxList } from "react-icons/ci";
import { AiOutlineRise } from "react-icons/ai";
import { Crown, ShoppingBag, Gift } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { safeLocalStorage } from "@/utils/helpers";
import ProtectedRoute from "@/components/ProtectedRoute";

import { useFeatureFlag } from "@/context/FeatureFlagContext";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isEnabled } = useFeatureFlag();
  const [isOpen, setIsOpen] = useState(false); // Start closed on mobile
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  const vendorName = safeLocalStorage.getItem("name") || "Vendor";
  const storeName = safeLocalStorage.getItem("storeName") || vendorName;
  const vendorEmail = safeLocalStorage.getItem("email") || "";

  const handleLogout = () => {
    safeLocalStorage.clear();
    window.location.href = "/login";
  };

  const quickActions = [
    { icon: <ShoppingBag size={20} />, label: "My Products", href: "/dashboard/vendor-listing", color: "bg-green-500" },
    { icon: <CiBoxList size={20} />, label: "Add Listing", href: "/dashboard/create-list", color: "bg-lime-500" },
    ...(isEnabled('Paid_Listing_Promotion') ?  [{ icon: <AiOutlineRise size={20} />, label: "Create Ad", href: "/dashboard/promote", color: "bg-blue-500" }] : []),
    ...(isEnabled('referral_system') ? [{ icon: <Gift size={20} />, label: "Earn Referrals", href: "/dashboard/referrals", color: "bg-purple-500" }] : []),
    { icon: <FiSettings size={20} />, label: "Settings", href: "/dashboard/settings", color: "bg-orange-500" },
  ];

  return (
    <ProtectedRoute requireVendor={true}>
      <div className="flex h-screen bg-gray-50">
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
            "fixed lg:relative inset-y-0 left-0 z-50 bg-white shadow-md transition-all duration-300 flex flex-col",
            isOpen ? "w-64 translate-x-0" : "w-64 -translate-x-full lg:translate-x-0 lg:w-20"
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
          <div className="p-4 border-b">
            <div className={cn("flex items-center space-x-3", !isOpen && "lg:justify-center")}>
              <div className="w-10 h-10 rounded-full bg-lime-500 flex items-center justify-center text-white font-semibold">
                {storeName.charAt(0).toUpperCase()}
              </div>
              {isOpen && (
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{storeName}</p>
                  <p className="text-xs text-gray-500 truncate">{vendorEmail}</p>
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

          {/* Quick Actions Menu */}
          {isOpen && (
            <div className="p-4 border-b">
              <h3 className="text-sm font-medium text-gray-600 mb-3">Quick Actions</h3>
              <div className="space-y-2">
                {quickActions.map((action, index) => (
                  <Link
                    key={index}
                    href={action.href}
                    className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-100 transition-colors"
                    onClick={() => setIsOpen(false)} // Close mobile menu on click
                  >
                    <div className={`p-1 rounded ${action.color} text-white`}>
                      {action.icon}
                    </div>
                    <span className="text-sm text-gray-700">{action.label}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}

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
        <div className="flex-1 flex flex-col lg:ml-0">
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
