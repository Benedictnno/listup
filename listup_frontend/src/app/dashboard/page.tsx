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
  const vendorId = safeLocalStorage.getItem("id");
  const vendorName = safeLocalStorage.getItem("name") || "Vendor";

  useEffect(() => {
    async function loadDashboardData() {
      try {
        // Fetch listings data
        const listings = await fetchVendorListings(vendorId || '');
        
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

  if (!data) {
    return <div className="p-4 md:p-6 text-red-500">Failed to load dashboard data.</div>;
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-NG', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-lime-500 to-lime-600 rounded-xl p-6 text-white">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-2">Welcome back, {vendorName}!</h1>
            <p className="text-lime-100 text-sm md:text-base">
              Here&apos;s what&apos;s happening with your store today.
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            <Link href="/dashboard/create-list">
              <Button className="bg-white text-lime-600 hover:bg-lime-50">
                <Plus size={16} className="mr-2" />
                Add New Listing
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <Card className="hover:shadow-lg transition-shadow border-lime-200">
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Listings</p>
                <p className="text-2xl md:text-3xl font-bold text-gray-900">{data.totalListings}</p>
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  <Package size={12} />
                  {data.activeListings} active, {data.inactiveListings} inactive
                </p>
              </div>
              <div className="p-3 bg-lime-100 rounded-full">
                <Package className="h-6 w-6 text-lime-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow border-green-200">
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Listings</p>
                <p className="text-2xl md:text-3xl font-bold text-gray-900">{data.activeListings}</p>
                <p className="text-xs text-green-600 flex items-center gap-1">
                  <TrendingUp size={12} />
                  {data.totalListings > 0 ? Math.round((data.activeListings / data.totalListings) * 100) : 0}% of total
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow border-orange-200">
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Inactive Listings</p>
                <p className="text-2xl md:text-3xl font-bold text-gray-900">{data.inactiveListings}</p>
                <p className="text-xs text-orange-600 flex items-center gap-1">
                  {data.inactiveListings > 0 ? 'Needs attention' : 'All active'}
                </p>
              </div>
              <div className="p-3 bg-orange-100 rounded-full">
                <Package className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow border-yellow-200">
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Listings</p>
                <p className="text-2xl md:text-3xl font-bold text-gray-900">{data.pendingListings}</p>
                <p className="text-xs text-yellow-600 flex items-center gap-1">
                  {data.pendingListings > 0 ? 'Awaiting approval' : 'None pending'}
                </p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-full">
                <Package className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Latest Listings */}
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg md:text-xl font-semibold flex items-center gap-2">
                  <Package size={20} />
                  Latest Listings Created
                </h3>
                <Link href="/dashboard/vendor-listing">
                  <Button variant="outline" size="sm">
                    View All
                    <ArrowRight size={16} className="ml-2" />
                  </Button>
                </Link>
              </div>
              
              {data.latestListings.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Package size={48} className="mx-auto mb-4 text-gray-300" />
                  <p>No listings created yet</p>
                  <Link href="/dashboard/create-list">
                    <Button className="mt-3" size="sm">
                      <Plus size={16} className="mr-2" />
                      Create First Listing
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {data.latestListings.map((listing) => (
                    <div key={listing.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="w-12 h-12 rounded-lg bg-gray-200 flex items-center justify-center flex-shrink-0">
                        {listing.image ? (
                          <Image 
                            src={listing.image} 
                            alt={listing.title}
                            width={48}
                            height={48}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                        ) : (
                          <Package size={24} className="text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 truncate">{listing.title}</h4>
                        <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                          <span className="font-semibold text-lime-600">₦{listing.price.toLocaleString()}</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(listing.status)}`}>
                            {listing.status.charAt(0).toUpperCase() + listing.status.slice(1)}
                          </span>
                        </div>
                      </div>
                      <div className="text-right text-sm text-gray-500 flex-shrink-0">
                        <div className="flex items-center gap-1">
                          {formatDate(listing.createdAt)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card className="border-lime-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Store size={20} className="text-lime-600" />
                <h3 className="text-lg font-semibold">Quick Actions</h3>
              </div>
              <div className="space-y-3">
                <Link href="/dashboard/create-list">
                  <Button variant="outline" className="w-full justify-start bg-lime-50 border-lime-200 hover:bg-lime-100">
                    <Plus size={16} className="mr-2" />
                    Add New Listing
                  </Button>
                </Link>
                <Link href="/dashboard/promote">
                  <Button variant="outline" className="w-full justify-start bg-blue-50 border-blue-200 hover:bg-blue-100">
                    <TrendingUp size={16} className="mr-2" />
                    Create Ad Campaign
                  </Button>
                </Link>
                <Link href="/dashboard/vendor-listing">
                  <Button variant="outline" className="w-full justify-start bg-green-50 border-green-200 hover:bg-green-100">
                    <ShoppingBag size={16} className="mr-2" />
                    Manage Products
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Store Stats */}
          <Card className="border-blue-200">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Store Statistics</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <span className="text-sm text-gray-600">Total Products</span>
                  <span className="font-semibold text-blue-600">{data.totalListings}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <span className="text-sm text-gray-600">Active Products</span>
                  <span className="font-semibold text-green-600">{data.activeListings}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                  <span className="text-sm text-gray-600">Inactive Products</span>
                  <span className="font-semibold text-orange-600">{data.inactiveListings}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
