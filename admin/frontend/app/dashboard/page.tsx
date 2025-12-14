"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Users,
  Store,
  Package,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  LogOut,
  Shield
} from "lucide-react";
import { useAdminAuth } from "@/src/store/authStore";
import PerformanceChart from "@/components/dashboard/PerformanceChart";
import TrendingSummary from "@/components/dashboard/TrendingSummary";
import ActivityFeed from "@/components/dashboard/ActivityFeed";
import useAuth from "@/hooks/useAuth";
import dashboardService from "@/services/dashboardService";

interface DashboardStats {
  totalUsers: number;
  totalVendors: number;
  totalListings: number;
  totalAds: number;
  pendingVendors: number;
  recentUsers: number;
  recentListings: number;
  activeAds: number;
}

interface RecentActivity {
  recentUsers: any[];
  recentListings: any[];
  recentVendors: any[];
  recentAds: any[];
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const { logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Fetch dashboard data on mount
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // Use the service which handles cookies automatically via the api instance
      const [statsData, activityData] = await Promise.all([
        dashboardService.getOverview(),
        dashboardService.getRecentActivity()
      ]);

      setStats(statsData);
      setRecentActivity(activityData);

    } catch (err: any) {
      setError(err.message || "Failed to load dashboard data");
      console.error("Dashboard error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lime-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Users"
          value={stats?.totalUsers || 0}
          icon={Users}
          color="blue"
          change={`+${stats?.recentUsers || 0} this month`}
        />
        <StatCard
          title="Total Vendors"
          value={stats?.totalVendors || 0}
          icon={Store}
          color="green"
          change={`${stats?.pendingVendors || 0} pending approval`}
        />
        <StatCard
          title="Total Listings"
          value={stats?.totalListings || 0}
          icon={Package}
          color="purple"
          change={`+${stats?.recentListings || 0} this month`}
        />
        <StatCard
          title="Active Ads"
          value={stats?.activeAds || 0}
          icon={TrendingUp}
          color="orange"
          change={`${stats?.totalAds || 0} total ads`}
        />
      </div>

      {/* Performance Chart */}
      <div className="mb-8">
        <PerformanceChart />
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => router.push("/dashboard/vendors")}
            className="flex items-center gap-3 p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
          >
            <Store className="w-6 h-6 text-blue-600" />
            <div className="text-left">
              <p className="font-medium text-blue-900">Manage Vendors</p>
              <p className="text-sm text-blue-700">{stats?.pendingVendors || 0} pending approval</p>
            </div>
          </button>

          <button
            onClick={() => router.push("/dashboard/listings")}
            className="flex items-center gap-3 p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
          >
            <Package className="w-6 h-6 text-purple-600" />
            <div className="text-left">
              <p className="font-medium text-purple-900">Manage Listings</p>
              <p className="text-sm text-purple-700">{stats?.totalListings || 0} total listings</p>
            </div>
          </button>

          <button
            onClick={() => router.push("/dashboard/analytics")}
            className="flex items-center gap-3 p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
          >
            <TrendingUp className="w-6 h-6 text-green-600" />
            <div className="text-left">
              <p className="font-medium text-green-900">View Analytics</p>
              <p className="text-sm text-green-700">Performance insights</p>
            </div>
          </button>
        </div>
      </div>

      {/* Trending Summary and Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <TrendingSummary />
        <ActivityFeed />
      </div>

      {/* Recent Activity from API */}
      {recentActivity && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Vendors</h2>
            <div className="space-y-3">
              {recentActivity.recentVendors.slice(0, 5).map((vendor) => (
                <div key={vendor.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <Store className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{vendor.name}</p>
                    <p className="text-sm text-gray-500">{vendor.vendorProfile?.storeName}</p>
                  </div>
                  <div className="text-right">
                    <StatusBadge status={vendor.vendorProfile?.verificationStatus} />
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(vendor.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Listings</h2>
            <div className="space-y-3">
              {recentActivity.recentListings.slice(0, 5).map((listing) => (
                <div key={listing.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
                    {listing.images && listing.images.length > 0 ? (
                      <img
                        src={listing.images[0]}
                        alt={listing.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Package className="w-6 h-6 text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 truncate">{listing.title}</p>
                    <p className="text-sm text-gray-500">₦{listing.price?.toLocaleString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-400">
                      {new Date(listing.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color, change }: {
  title: string;
  value: number;
  icon: any;
  color: string;
  change: string;
}) {
  const colorClasses = {
    blue: "bg-blue-500 text-white",
    green: "bg-green-500 text-white",
    purple: "bg-purple-500 text-white",
    orange: "bg-orange-500 text-white"
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value.toLocaleString()}</p>
          <p className="text-xs text-gray-500 mt-1">{change}</p>
        </div>
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${colorClasses[color as keyof typeof colorClasses]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const statusClasses = {
    PENDING: "bg-yellow-100 text-yellow-800",
    APPROVED: "bg-green-100 text-green-800",
    REJECTED: "bg-red-100 text-red-800"
  };

  const statusIcons = {
    PENDING: Clock,
    APPROVED: CheckCircle,
    REJECTED: XCircle
  };

  const Icon = statusIcons[status as keyof typeof statusIcons] || AlertCircle;

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusClasses[status as keyof typeof statusClasses] || 'bg-gray-100 text-gray-800'}`}>
      <Icon className="w-3 h-3" />
      {status}
    </span>
  );
}
