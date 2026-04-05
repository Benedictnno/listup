"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Image from "next/image";
import dynamic from 'next/dynamic';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  ShoppingCart,
  Download,
  RefreshCw,
  Eye,
  Heart,
  MessageSquare,
  BarChart3
} from "lucide-react";
import { fetchVendorListingMetrics, VendorListingMetricsResponse } from "@/lib/api/analytics";
import { useAuthStore } from "@/store/authStore";

// Dynamic imports for heavy chart components
const SalesCharts = dynamic(() => import('@/components/dashboard/analytics/SalesCharts'), {
  loading: () => <div className="h-[300px] w-full bg-gray-100 animate-pulse rounded-lg" />,
  ssr: false
});

const CustomerCharts = dynamic(() => import('@/components/dashboard/analytics/CustomerCharts'), {
  loading: () => <div className="h-[250px] w-full bg-gray-100 animate-pulse rounded-lg" />,
  ssr: false
});

const PerformanceRadar = dynamic(() => import('@/components/dashboard/analytics/PerformanceRadar'), {
  loading: () => <div className="h-[300px] w-full bg-gray-100 animate-pulse rounded-lg" />,
  ssr: false
});

interface AnalyticsData {
  overview: {
    totalRevenue: number;
    totalOrders: number;
    totalCustomers: number;
    averageOrderValue: number;
    revenueGrowth: number;
    orderGrowth: number;
    customerGrowth: number;
    aovGrowth: number;
  };
  salesPerformance: {
    daily: Array<{ date: string; revenue: number; orders: number }>;
    weekly: Array<{ week: string; revenue: number; orders: number }>;
    monthly: Array<{ month: string; revenue: number; orders: number }>;
  };
  topProducts: Array<{
    id: string;
    name: string;
    revenue: number;
    orders: number;
    views: number;
    conversionRate: number;
    image?: string;
  }>;
  customerMetrics: {
    lifetimeValue: Array<{ segment: string; value: number; count: number }>;
    retention: Array<{ month: string; rate: number }>;
    demographics: Array<{ age: string; count: number; revenue: number }>;
  };
  performanceComparison: Array<{
    category: string;
    revenue: number;
    orders: number;
    conversionRate: number;
    avgPrice: number;
  }>;
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');
  const [chartType, setChartType] = useState('daily');

  const { user } = useAuthStore();

  useEffect(() => {
    async function loadAnalyticsData() {
      if (!user?.id) return;
      
      try {
        setLoading(true);
        const metrics = await fetchVendorListingMetrics(user.id, timeRange as any);
        setData(metrics as any);
      } catch (error) {
        console.error('Error loading analytics data:', error);
      } finally {
        setLoading(false);
      }
    }

    loadAnalyticsData();
  }, [user?.id, timeRange]);

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
          <div className="h-64 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    );
  }

  if (!data) {
    return <div className="p-6 text-red-500">Failed to load analytics data.</div>;
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  const getGrowthColor = (value: number) => {
    return value >= 0 ? 'text-green-600' : 'text-red-600';
  };

  const getGrowthIcon = (value: number) => {
    return value >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />;
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  const currentChartData = data.salesPerformance[chartType as keyof typeof data.salesPerformance];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            Analytics Dashboard
            <span className="text-[10px] bg-amber-100 text-amber-700 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider border border-amber-200">
              Demo Mode
            </span>
          </h1>
          <p className="text-gray-600 italic text-sm">Reviewing sample store performance (Simulated Data)</p>
        </div>
        <div className="flex gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download size={16} className="mr-2" />
            Export
          </Button>
          <Button variant="outline">
            <RefreshCw size={16} className="mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-blue-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Views</p>
                <p className="text-3xl font-black text-gray-900 mt-1">{(data as any).totals?.views?.toLocaleString() || 0}</p>
                <p className="text-xs text-gray-400 mt-1 italic">Total listing impressions</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-2xl">
                <Eye className="h-7 w-7 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-pink-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Saves</p>
                <p className="text-3xl font-black text-gray-900 mt-1">{(data as any).totals?.saves?.toLocaleString() || 0}</p>
                <p className="text-xs text-gray-400 mt-1 italic">Items added to favorites</p>
              </div>
              <div className="p-3 bg-pink-50 rounded-2xl">
                <Heart className="h-7 w-7 text-pink-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-lime-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Message Clicks</p>
                <p className="text-3xl font-black text-gray-900 mt-1">{(data as any).totals?.messages?.toLocaleString() || 0}</p>
                <p className="text-xs text-gray-400 mt-1 italic">Direct inquiries via WhatsApp/Chat</p>
              </div>
              <div className="p-3 bg-lime-50 rounded-2xl">
                <MessageSquare className="h-7 w-7 text-lime-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sales Performance Charts (Lazy Loaded) */}
      <SalesCharts
        data={currentChartData}
        chartType={chartType}
        setChartType={setChartType}
        formatCurrency={formatCurrency}
      />

      {/* Top Performing Products */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4">Top Performing Products</h3>
          <div className="space-y-4">
            {data.topProducts.map((product, index) => (
              <div key={product.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3 flex-1">
                  <span className="text-lg font-bold text-gray-400 w-8">{index + 1}</span>
                  <Image
                    src={product.image || '/placeholder.svg'}
                    alt={product.name}
                    width={48}
                    height={48}
                    className="rounded-lg object-cover"
                  />
                  <div>
                    <p className="font-medium text-gray-900">{product.name}</p>
                    <p className="text-sm text-gray-500">
                      {product.orders} orders • {product.views} views
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-lime-600">{formatCurrency(product.revenue)}</p>
                  <p className="text-sm text-gray-500">
                    {product.conversionRate.toFixed(2)}% conversion
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Customer Metrics Charts (Lazy Loaded) */}
      <CustomerCharts
        data={data.customerMetrics}
        COLORS={COLORS}
        formatCurrency={formatCurrency}
      />

      {/* Performance Radar Chart (Lazy Loaded) */}
      <PerformanceRadar
        data={data.performanceComparison}
        formatCurrency={formatCurrency}
      />
    </div>
  );
}
