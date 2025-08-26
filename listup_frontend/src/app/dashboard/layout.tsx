"use client";

import { useState } from "react";
import { FiMenu, FiHome, FiBarChart2, FiSettings, FiX, FiSearch, FiLogOut, FiUser, FiBell } from "react-icons/fi";
import { CiBoxList } from "react-icons/ci";
import { AiOutlineRise } from "react-icons/ai";
import { ChevronDown, Crown, Shield, TrendingUp, ShoppingBag } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { safeLocalStorage } from "@/utils/helpers";
import { ShoppingCart } from "lucide-react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(true);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const vendorId = safeLocalStorage.getItem("id");
  const vendorName = safeLocalStorage.getItem("name") || "Vendor";
  const storeName = safeLocalStorage.getItem("storeName") || "My Store";

  const handleLogout = () => {
    safeLocalStorage.clear();
    window.location.href = "/login";
  };

  const quickActions = [
    { icon: <ShoppingBag size={20} />, label: "My Products", href: "/dashboard/vendor-listing", color: "bg-green-500" },
    { icon: <CiBoxList size={20} />, label: "Add Listing", href: "/dashboard/create-list", color: "bg-lime-500" },
    { icon: <AiOutlineRise size={20} />, label: "Create Ad", href: "/dashboard/promote", color: "bg-blue-500" },
    // { icon: <FiBarChart2 size={20} />, label: "View Analytics", href: "/dashboard/analytics", color: "bg-purple-500" },
    { icon: <FiSettings size={20} />, label: "Settings", href: "/dashboard/settings", color: "bg-orange-500" },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside
        className={cn(
          "bg-white shadow-md transition-all duration-300 flex flex-col",
          isOpen ? "w-64 max-sm:hidden" : "w-20 "
        )}
      >
        {/* Logo + Collapse Button
        <div className="flex items-center justify-between p-4 border-b">
          <span className={cn("text-lg font-bold transition-all", !isOpen && "hidden")}>
            {storeName}
          </span>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="text-gray-600 hover:text-black"
          >
            {isOpen ? <FiX size={20} /> : <FiMenu size={20} />}
          </button>
        </div> */}

        {/* User Profile Section */}
        <div className="p-4 border-b">
          <div className={cn("flex items-center space-x-3", !isOpen && "justify-center")}>
            <div className="w-10 h-10 rounded-full bg-lime-500 flex items-center justify-center text-white font-semibold">
              {vendorName.charAt(0).toUpperCase()}
            </div>
            {isOpen && (
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate">{vendorName}</p>
                <div className="flex items-center gap-1">
                  <Crown size={12} className="text-yellow-500" />
                  <span className="text-xs text-gray-500">Verified Vendor</span>
                </div>
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

        {/* Nav */}
        {/* <nav className="flex-1 p-2 space-y-2">
          <Link
            href="/dashboard"
            className="flex items-center space-x-3 p-2 rounded-md hover:bg-gray-100"
          >
            <FiHome />
            {isOpen && <span>Overview</span>}
          </Link>
          <Link
            href="/dashboard/vendor-listing"
            className="flex items-center space-x-3 p-2 rounded-md hover:bg-gray-100"
          >
            <CiBoxList />
            {isOpen && <span>Listings</span>}
          </Link>
          <Link
            href="/dashboard/orders"
            className="flex items-center space-x-3 p-2 rounded-md hover:bg-gray-100"
          >
            <ShoppingCart />
            {isOpen && <span>Orders</span>}
          </Link>
          <Link
            href="/dashboard/analytics"
            className="flex items-center space-x-3 p-2 rounded-md hover:bg-gray-100"
          >
            <FiBarChart2 />
            {isOpen && <span>Analytics</span>}
          </Link>
          <Link
            href="/dashboard/promote"
            className="flex items-center space-x-3 p-2 rounded-md hover:bg-gray-100"
          >
            <AiOutlineRise />
            {isOpen && <span>Promote</span>}
          </Link>
          <Link
            href="/dashboard/settings"
            className="flex items-center space-x-3 p-2 rounded-md hover:bg-gray-100"
          >
            <FiSettings />
            {isOpen && <span>Settings</span>}
          </Link>
        </nav> */}

        {/* Logout Button */}
        <div className="p-2 border-t">
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
      <div className="flex-1 flex flex-col">
        {/* Topbar */}
        <header className="flex items-center justify-between bg-white shadow p-4">
          <div className="flex items-center space-x-4">
            {/* Collapse button always available here */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-600 hover:text-black"
            >
              <FiMenu size={22} />
            </button>
            <h1 className="font-bold text-lg">Dashboard</h1>
          </div>

          {/* Search Bar */}
          {/* <div className="flex-1 max-w-md mx-8">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search listings, orders, customers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lime-400 focus:border-transparent transition-all focus:outline-none"
              />
            </div>
          </div> */}

          <div className="flex items-center space-x-4">
            {/* Notifications */}
            {/* <button className="relative p-2 text-gray-600 hover:text-black transition-colors">
              <FiBell size={20} />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                3
              </span>
            </button> */}

            {/* Profile Dropdown */}
            {/* <div className="relative">
              <button
                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-lime-500 flex items-center justify-center text-white font-semibold">
                  {vendorName.charAt(0).toUpperCase()}
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium text-gray-900">{vendorName}</p>
                  <p className="text-xs text-gray-500">{storeName}</p>
                </div>
                <ChevronDown size={16} className="text-gray-400" />
              </button>

              
              {showProfileDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                  <Link
                    href="/dashboard/profile"
                    className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <FiUser size={16} />
                    <span>Profile</span>
                  </Link>
                  <Link
                    href="/dashboard/store"
                    className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                  
                    <span>Store Settings</span>
                  </Link>
                  <div className="border-t border-gray-200 my-1"></div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    <FiLogOut size={16} />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div> */}

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
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>

      {/* Click outside to close dropdowns */}
      {showProfileDropdown && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowProfileDropdown(false)}
        />
      )}
    </div>
  );
}
