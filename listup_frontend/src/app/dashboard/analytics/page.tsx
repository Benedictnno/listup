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
  RefreshCw
} from "lucide-react";

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

  useEffect(() => {
    async function loadAnalyticsData() {
      try {
        // Mock data for demonstration - in real app, this would come from API
        const mockData: AnalyticsData = {
          overview: {
            totalRevenue: 1250000,
            totalOrders: 89,
            totalCustomers: 156,
            averageOrderValue: 14045,
            revenueGrowth: 12.5,
            orderGrowth: 8.2,
            customerGrowth: 15.3,
            aovGrowth: 3.8
          },
          salesPerformance: {
            daily: Array.from({ length: 30 }, (_, i) => ({
              date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
              revenue: Math.floor(Math.random() * 50000) + 20000,
              orders: Math.floor(Math.random() * 10) + 2
            })),
            weekly: Array.from({ length: 12 }, (_, i) => ({
              week: `Week ${i + 1}`,
              revenue: Math.floor(Math.random() * 300000) + 150000,
              orders: Math.floor(Math.random() * 50) + 20
            })),
            monthly: Array.from({ length: 12 }, (_, i) => ({
              month: new Date(2024, i, 1).toLocaleDateString('en-US', { month: 'short' }),
              revenue: Math.floor(Math.random() * 150000) + 80000,
              orders: Math.floor(Math.random() * 30) + 15
            }))
          },
          topProducts: [
            { id: '1', name: 'iPhone 13 Pro', revenue: 450000, orders: 15, views: 1240, conversionRate: 1.21, image: '/placeholder.svg' },
            { id: '2', name: 'MacBook Pro M2', revenue: 320000, orders: 8, views: 980, conversionRate: 0.82, image: '/placeholder.svg' },
            { id: '3', name: 'Samsung Galaxy S23', revenue: 280000, orders: 12, views: 756, conversionRate: 1.59, image: '/placeholder.svg' },
            { id: '4', name: 'iPad Air', revenue: 180000, orders: 9, views: 520, conversionRate: 1.73, image: '/placeholder.svg' },
            { id: '5', name: 'AirPods Pro', revenue: 120000, orders: 18, views: 890, conversionRate: 2.02, image: '/placeholder.svg' }
          ],
          customerMetrics: {
            lifetimeValue: [
              { segment: 'High Value', value: 75000, count: 25 },
              { segment: 'Medium Value', value: 25000, count: 68 },
              { segment: 'Low Value', value: 8000, count: 63 }
            ],
            retention: Array.from({ length: 12 }, (_, i) => ({
              month: new Date(2024, i, 1).toLocaleDateString('en-US', { month: 'short' }),
              rate: Math.random() * 0.3 + 0.6
            })),
            demographics: [
              { age: '18-24', count: 25, revenue: 180000 },
              { age: '25-34', count: 68, revenue: 520000 },
              { age: '35-44', count: 45, revenue: 380000 },
              { age: '45+', count: 18, revenue: 170000 }
            ]
          },
          performanceComparison: [
            { category: 'Electronics', revenue: 850000, orders: 45, conversionRate: 1.2, avgPrice: 18889 },
            { category: 'Clothing', revenue: 280000, orders: 28, conversionRate: 0.8, avgPrice: 10000 },
            { category: 'Furniture', revenue: 120000, orders: 16, conversionRate: 0.6, avgPrice: 7500 }
          ]
        };

        setData(mockData);
      } catch (error) {
        console.error('Error loading analytics data:', error);
      } finally {
        setLoading(false);
      }
    }

    loadAnalyticsData();
  }, []);

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
          <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
          <p className="text-gray-600">Track your store performance and insights</p>
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(data.overview.totalRevenue)}</p>
                <p className={`text-xs flex items-center gap-1 ${getGrowthColor(data.overview.revenueGrowth)}`}>
                  {getGrowthIcon(data.overview.revenueGrowth)}
                  {formatPercentage(data.overview.revenueGrowth)} vs last period
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900">{data.overview.totalOrders}</p>
                <p className={`text-xs flex items-center gap-1 ${getGrowthColor(data.overview.orderGrowth)}`}>
                  {getGrowthIcon(data.overview.orderGrowth)}
                  {formatPercentage(data.overview.orderGrowth)} vs last period
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <ShoppingCart className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Customers</p>
                <p className="text-2xl font-bold text-gray-900">{data.overview.totalCustomers}</p>
                <p className={`text-xs flex items-center gap-1 ${getGrowthColor(data.overview.customerGrowth)}`}>
                  {getGrowthIcon(data.overview.customerGrowth)}
                  {formatPercentage(data.overview.customerGrowth)} vs last period
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Order Value</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(data.overview.averageOrderValue)}</p>
                <p className={`text-xs flex items-center gap-1 ${getGrowthColor(data.overview.aovGrowth)}`}>
                  {getGrowthIcon(data.overview.aovGrowth)}
                  {formatPercentage(data.overview.aovGrowth)} vs last period
                </p>
              </div>
              <div className="p-3 bg-orange-100 rounded-full">
                <TrendingUp className="h-6 w-6 text-orange-600" />
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
