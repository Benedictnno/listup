"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import {
  TrendingUp,
  Package,
  Plus,
  ArrowRight,
  ShoppingBag,
  Store
} from "lucide-react";
import { fetchVendorListings } from "@/lib/api/listing";
import { safeLocalStorage } from "@/utils/helpers";
import Link from "next/link";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";

interface DashboardData {
  totalListings: number;
  activeListings: number;
  inactiveListings: number;
  pendingListings: number;
  latestListings: LatestListing[];
}

interface LatestListing {
  id: string;
  title: string;
  price: number;
  status: string;
  createdAt: string;
  image?: string;
}

export default function DashboardOverview() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();
  const router = useRouter();
  
  // Additional protection at page level
  useEffect(() => {
    if (user === null) {
      router.push("/login");
      return;
    }
    
    if (user.role !== "VENDOR") {
      router.push("/");
      return;
    }
  }, [user, router]);

  const vendorId = user?.id || safeLocalStorage.getItem("id");
  const vendorName = user?.name || safeLocalStorage.getItem("name") || "Vendor";

  useEffect(() => {
    async function loadDashboardData() {
      if (!vendorId) return;
      
      try {
        // Fetch listings data
        const listings = await fetchVendorListings(vendorId);

        // Calculate metrics from real data
        const activeListings = listings.filter((l: { status: string }) => l.status === 'active');
        const inactiveListings = listings.filter((l: { status: string }) => l.status === 'inactive');
        const pendingListings = listings.filter((l: { status: string }) => l.status === 'pending');

        // Get latest listings (last 5 created)
        const latestListings = listings
          .sort((a: { createdAt?: string; created_at?: string }, b: { createdAt?: string; created_at?: string }) => new Date(b.createdAt || b.created_at || Date.now()).getTime() - new Date(a.createdAt || a.created_at || Date.now()).getTime())
          .slice(0, 5)
          .map((listing: { id: string; title: string; price: number; status: string; createdAt?: string; created_at?: string; image?: string }) => ({
            id: listing.id,
            title: listing.title,
            price: listing.price,
            status: listing.status || 'active',
            createdAt: listing.createdAt || listing.created_at || new Date().toISOString(),
            image: listing.image
          }));

        const dashboardData: DashboardData = {
          totalListings: listings.length,
          activeListings: activeListings.length,
          inactiveListings: inactiveListings.length,
          pendingListings: pendingListings.length,
          latestListings
        };

        setData(dashboardData);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    }

    if (vendorId) {
      loadDashboardData();
    }
  }, [vendorId]);

  // Show loading while checking authentication
  if (!user || user.role !== "VENDOR") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-lime-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Redirecting...</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-4 md:p-6">
        <div className="animate-pulse space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 md:h-28 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="h-64 bg-gray-200 rounded-lg"></div>
            <div className="h-64 bg-gray-200 rounded-lg"></div>
            <div className="h-64 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-lime-50 to-green-50 rounded-2xl p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              Welcome back, {vendorName}! 👋
            </h1>
            <p className="text-gray-600 text-lg">
              Here&apos;s what&apos;s happening with your store today.
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            <Link href="/dashboard/create-list">
              <Button size="lg" className="bg-lime-600 hover:bg-lime-700">
                <Plus className="mr-2 h-5 w-5" />
                Add New Listing
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <Card className="border-l-4 border-l-4 border-lime-500">
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Listings</p>
                <p className="text-2xl font-bold text-gray-900">{data?.totalListings || 0}</p>
              </div>
              <Package className="h-8 w-8 text-lime-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-green-500">
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Listings</p>
                <p className="text-2xl font-bold text-gray-900">{data?.activeListings || 0}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-yellow-500">
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900">{data?.pendingListings || 0}</p>
              </div>
              <Store className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-red-500">
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Inactive</p>
                <p className="text-2xl font-bold text-gray-900">{data?.inactiveListings || 0}</p>
              </div>
              <ShoppingBag className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Latest Listings & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Latest Listings */}
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Latest Listings</h2>
                <Link href="/dashboard/vendor-listing">
                  <Button variant="outline" size="sm">
                    View All
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
              
              {data?.latestListings && data.latestListings.length > 0 ? (
                <div className="space-y-3">
                  {data.latestListings.map((listing) => (
                    <div key={listing.id} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50">
                      {listing.image ? (
                        <Image
                          src={listing.image}
                          alt={listing.title}
                          width={48}
                          height={48}
                          className="rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                          <Package className="h-6 w-6 text-gray-400" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">{listing.title}</p>
                        <p className="text-sm text-gray-500">₦{listing.price.toLocaleString()}</p>
                      </div>
                      <div className="text-right">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          listing.status === 'active' ? 'bg-green-100 text-green-800' :
                          listing.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {listing.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Package className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p>No listings yet</p>
                  <Link href="/dashboard/create-list">
                    <Button className="mt-2" size="sm">
                      Create Your First Listing
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div>
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <Link href="/dashboard/create-list">
                  <Button className="w-full justify-start" variant="outline">
                    <Plus className="mr-2 h-4 w-4" />
                    Add New Listing
                  </Button>
                </Link>
                <Link href="/dashboard/vendor-listing">
                  <Button className="w-full justify-start" variant="outline">
                    <ShoppingBag className="mr-2 h-4 w-4" />
                    Manage Listings
                  </Button>
                </Link>
                <Link href="/dashboard/promote">
                  <Button className="w-full justify-start" variant="outline">
                    <TrendingUp className="mr-2 h-4 w-4" />
                    Promote Products
                  </Button>
                </Link>
                <Link href="/dashboard/settings">
                  <Button className="w-full justify-start" variant="outline">
                    <Store className="mr-2 h-4 w-4" />
                    Store Settings
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
