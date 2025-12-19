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

export interface VendorStats {
  totalVendors: number;
  pendingVendors: number;
  activeVendors: number;
  rejectedVendors: number;
  newVendors: number;
  totalListings: number;
  topVendorsByListings?: any[];
  vendorsByCategory?: any[];
  vendorGrowth?: any[];
}

export interface ListingStats {
  totalListings: number;
  activeListings: number;
  inactiveListings: number;
  newListings: number;
  averagePrice: number;
  topCategories?: any[];
  categoryStats: Array<{
    categoryId: string;
    count: number;
    categoryName: string;
  }>;
  listingsByStatus?: any[];
  listingGrowth?: any[];
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

  getVendorStats: async (): Promise<VendorStats> => {
    const response = await api.get('/vendors/stats');
    return response.data.data;
  },

  getListingStats: async (): Promise<ListingStats> => {
    const response = await api.get('/listings/stats');
    return response.data.data;
  },

  getHealth: async (): Promise<any> => {
    const response = await api.get('/dashboard/health');
    return response.data.data;
  }
};

export default dashboardService;
