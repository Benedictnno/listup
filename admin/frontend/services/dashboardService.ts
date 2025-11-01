import { api } from './api';

export interface DashboardOverview {
  totalUsers: number;
  totalVendors: number;
  totalListings: number;
  totalAds: number;
  pendingVendors: number;
  recentUsers: number;
  recentListings: number;
  activeAds: number;
}

export interface RecentActivity {
  recentUsers: Array<{
    id: string;
    name: string;
    email: string;
    role: string;
    createdAt: string;
  }>;
  recentListings: Array<{
    id: string;
    title: string;
    price: number;
    images: string[];
    createdAt: string;
    seller: {
      id: string;
      name: string;
      vendorProfile?: {
        storeName: string;
      };
    };
  }>;
  recentVendors: Array<{
    id: string;
    name: string;
    email: string;
    createdAt: string;
    vendorProfile: {
      storeName: string;
      verificationStatus: string;
    };
  }>;
  recentAds: Array<{
    id: string;
    type: string;
    status: string;
    paymentStatus: string;
    amount: number;
    createdAt: string;
    vendor: {
      id: string;
      name: string;
      vendorProfile?: {
        storeName: string;
      };
    };
  }>;
}

export interface AnalyticsData {
  dailyUsers: Array<{
    date: Date;
    count: number;
  }>;
  dailyListings: Array<{
    date: Date;
    count: number;
  }>;
  categoryDistribution: Array<{
    categoryId: string;
    count: number;
    categoryName: string;
  }>;
}

const dashboardService = {
  getOverview: async (): Promise<DashboardOverview> => {
    const response = await api.get('/dashboard/overview');
    return response.data.data.overview;
  },

  getRecentActivity: async (limit?: number): Promise<RecentActivity> => {
    const response = await api.get('/dashboard/recent-activity', {
      params: { limit }
    });
    return response.data.data;
  },

  getAnalytics: async (period: number = 30): Promise<AnalyticsData> => {
    const response = await api.get('/dashboard/analytics', {
      params: { period }
    });
    return response.data.data;
  },

  getHealth: async (): Promise<any> => {
    const response = await api.get('/dashboard/health');
    return response.data.data;
  }
};

export default dashboardService;
