"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  TrendingUp, 
  Eye, 
  ShoppingCart, 
  MessageSquare, 
  DollarSign, 
  Package,
  BarChart3,
  Clock,
  Star,
  AlertTriangle,
  Store,
  Tag,
  Calendar,
  Plus,
  ArrowRight,
  ShoppingBag
} from "lucide-react";
import { fetchVendorListings } from "@/lib/api/listing";
import { safeLocalStorage } from "@/utils/helpers";
import Link from "next/link";

interface DashboardData {
  totalListings: number;
  activeListings: number;
  inactiveListings: number;
  pendingListings: number;
  totalRevenue: number;
  totalViews: number;
  totalOrders: number;
  unreadMessages: number;
  activeAds: number;
  adSpend: number;
  businessCategory: string;
  storeName: string;
  latestListings: LatestListing[];
  recentActivity: ActivityItem[];
  lowStockAlerts: StockAlert[];
  topPerformers: TopPerformer[];
}

interface LatestListing {
  id: string;
  title: string;
  price: number;
  status: string;
  createdAt: string;
  image?: string;
}

interface ActivityItem {
  id: string;
  type: 'listing_created' | 'order_received' | 'ad_activated' | 'message_received' | 'stock_updated';
  title: string;
  description: string;
  timestamp: string;
  icon: React.ReactNode;
  color: string;
}

interface StockAlert {
  id: string;
  productName: string;
  currentStock: number;
  threshold: number;
}

interface TopPerformer {
  id: string;
  title: string;
  views: number;
  sales: number;
  revenue: number;
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
        const activeListings = listings.filter((l: any) => l.status === 'active');
        const inactiveListings = listings.filter((l: any) => l.status === 'inactive');
        const pendingListings = listings.filter((l: any) => l.status === 'pending');
        
        // Get latest listings (last 5 created)
        const latestListings = listings
          .sort((a: any, b: any) => new Date(b.createdAt || b.created_at || Date.now()).getTime() - new Date(a.createdAt || a.created_at || Date.now()).getTime())
          .slice(0, 5)
          .map((listing: any) => ({
            id: listing.id,
            title: listing.title,
            price: listing.price,
            status: listing.status || 'active',
            createdAt: listing.createdAt || listing.created_at || new Date().toISOString(),
            image: listing.images?.[0]
          }));

        // Mock data for demonstration - in real app, these would come from API
        const mockData: DashboardData = {
          totalListings: listings.length,
          activeListings: activeListings.length,
          inactiveListings: inactiveListings.length,
          pendingListings: pendingListings.length,
          totalRevenue: 1250000, // ₦1,250,000
          totalViews: 15420,
          totalOrders: 89,
          unreadMessages: 12,
          activeAds: 3,
          adSpend: 45000, // ₦45,000
          businessCategory: "Electronics & Gadgets", // This would come from store data
          storeName: "Tech Haven Store", // This would come from store data
          latestListings,
          recentActivity: [
            {
              id: '1',
              type: 'order_received',
              title: 'New Order Received',
              description: 'Order #ORD-2024-001 for iPhone 13 Pro',
              timestamp: '2 minutes ago',
              icon: <ShoppingCart size={16} />,
              color: 'text-green-600 bg-green-100'
            },
            {
              id: '2',
              type: 'ad_activated',
              title: 'Ad Campaign Activated',
              description: 'Storefront promotion is now live',
              timestamp: '1 hour ago',
              icon: <TrendingUp size={16} />,
              color: 'text-blue-600 bg-blue-100'
            },
            {
              id: '3',
              type: 'message_received',
              title: 'Customer Message',
              description: 'Question about Samsung Galaxy S23',
              timestamp: '3 hours ago',
              icon: <MessageSquare size={16} />,
              color: 'text-purple-600 bg-purple-100'
            },
            {
              id: '4',
              type: 'stock_updated',
              title: 'Stock Updated',
              description: 'MacBook Pro stock reduced to 5 units',
              timestamp: '5 hours ago',
              icon: <Package size={16} />,
              color: 'text-orange-600 bg-orange-100'
            }
          ],
          lowStockAlerts: [
            { id: '1', productName: 'MacBook Pro', currentStock: 2, threshold: 5 },
            { id: '2', productName: 'iPhone 13 Pro', currentStock: 3, threshold: 5 },
            { id: '3', productName: 'Samsung Galaxy S23', currentStock: 1, threshold: 5 }
          ],
          topPerformers: [
            { id: '1', title: 'iPhone 13 Pro', views: 1240, sales: 15, revenue: 450000, image: '/placeholder.png' },
            { id: '2', title: 'MacBook Pro M2', views: 980, sales: 8, revenue: 320000, image: '/placeholder.png' },
            { id: '3', title: 'Samsung Galaxy S23', views: 756, sales: 12, revenue: 280000, image: '/placeholder.png' }
          ]
        };

        setData(mockData);
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0
    }).format(amount);
  };

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
              Here's what's happening with your {data.businessCategory} store today.
            </p>
            <div className="mt-3 flex items-center gap-2 text-lime-100">
              <Store size={16} />
              <span className="text-sm">{data.storeName}</span>
              <Tag size={16} />
              <span className="text-sm">{data.businessCategory}</span>
            </div>
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

        <Card className="hover:shadow-lg transition-shadow border-blue-200">
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
                  <AlertTriangle size={12} />
                  {data.inactiveListings > 0 ? 'Needs attention' : 'All active'}
                </p>
              </div>
              <div className="p-3 bg-orange-100 rounded-full">
                <AlertTriangle className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow border-purple-200">
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl md:text-3xl font-bold text-gray-900">{formatCurrency(data.totalRevenue)}</p>
                <p className="text-xs text-green-600 flex items-center gap-1">
                  <TrendingUp size={12} />
                  +12.5% this month
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <DollarSign className="h-6 w-6 text-purple-600" />
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
                          <img 
                            src={listing.image} 
                            alt={listing.title}
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
                          <Calendar size={14} />
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
          {/* Store Info */}
          <Card className="border-lime-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Store size={20} className="text-lime-600" />
                <h3 className="text-lg font-semibold">Store Information</h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Store Name:</span>
                  <span className="font-medium">{data.storeName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Category:</span>
                  <span className="font-medium">{data.businessCategory}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Status:</span>
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                    Active
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Low Stock Alerts */}
          <Card className="border-red-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Low Stock Alerts</h3>
                <AlertTriangle className="h-5 w-5 text-red-500" />
              </div>
              <div className="space-y-3">
                {data.lowStockAlerts.map((alert) => (
                  <div key={alert.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{alert.productName}</p>
                      <p className="text-sm text-red-600">
                        Stock: {alert.currentStock} (Threshold: {alert.threshold})
                      </p>
                    </div>
                    <Button size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50">
                      Restock
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Top Performers */}
          <Card className="border-blue-200">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Top Performers</h3>
              <div className="space-y-3">
                {data.topPerformers.map((product) => (
                  <div key={product.id} className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                    <img 
                      src={product.image || '/placeholder.png'} 
                      alt={product.title}
                      className="w-10 h-10 rounded-lg object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate text-sm">{product.title}</p>
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <span>{product.views} views</span>
                        <span>{product.sales} sales</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-lime-600 text-sm">{formatCurrency(product.revenue)}</p>
                      <div className="flex items-center gap-1">
                        <Star size={12} className="text-yellow-500 fill-current" />
                        <span className="text-xs text-gray-500">4.8</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg md:text-xl font-semibold">Recent Activity</h3>
            <Button variant="outline" size="sm">View All</Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {data.recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-start gap-3 p-4 rounded-lg hover:bg-gray-50 transition-colors">
                <div className={`p-2 rounded-full ${activity.color}`}>
                  {activity.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 text-sm">{activity.title}</p>
                  <p className="text-sm text-gray-600 truncate">{activity.description}</p>
                  <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                    <Clock size={12} />
                    {activity.timestamp}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg md:text-xl font-semibold mb-6">Quick Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <Link href="/dashboard/create-list">
              <Button variant="outline" className="w-full h-20 flex-col gap-2 bg-lime-50 border-lime-200 hover:bg-lime-100">
                <Package className="h-8 w-8 text-lime-600" />
                <span className="text-sm font-medium">Add Listing</span>
              </Button>
            </Link>
            <Link href="/dashboard/promote">
              <Button variant="outline" className="w-full h-20 flex-col gap-2 bg-blue-50 border-blue-200 hover:bg-blue-100">
                <TrendingUp className="h-8 w-8 text-blue-600" />
                <span className="text-sm font-medium">Create Ad</span>
              </Button>
            </Link>
            <Link href="/dashboard/orders">
              <Button variant="outline" className="w-full h-20 flex-col gap-2 bg-purple-50 border-purple-200 hover:bg-purple-100">
                <MessageSquare className="h-8 w-8 text-purple-600" />
                <span className="text-sm font-medium">View Orders</span>
              </Button>
            </Link>
            <Link href="/dashboard/analytics">
              <Button variant="outline" className="w-full h-20 flex-col gap-2 bg-orange-50 border-orange-200 hover:bg-orange-100">
                <BarChart3 className="h-8 w-8 text-orange-600" />
                <span className="text-sm font-medium">Analytics</span>
              </Button>
            </Link>
            <Link href="/dashboard/vendor-listing">
              <Button variant="outline" className="w-full h-20 flex-col gap-2 bg-green-50 border-green-200 hover:bg-green-100">
                <ShoppingBag className="h-8 w-8 text-green-600" />
                <span className="text-sm font-medium">My Products</span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
