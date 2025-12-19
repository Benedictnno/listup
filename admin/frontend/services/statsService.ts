import { api } from './api';

export interface VendorStats {
  totalVendors: number;
  activeVendors: number;
  newVendors: number;
  totalListings: number;
  topVendorsByListings?: Array<{
    name: string;
    listings: number;
  }>;
  vendorsByCategory?: Array<{
    category: string;
    count: number;
  }>;
  vendorGrowth?: Array<{
    month: string;
    count: number;
  }>;
}

export interface ListingStats {
  totalListings: number;
  activeListings: number;
  newListings: number;
  averagePrice: number;
  topCategories?: Array<{
    name: string;
    count: number;
  }>;
  listingsByStatus?: Array<{
    status: string;
    count: number;
  }>;
  listingGrowth?: Array<{
    month: string;
    count: number;
  }>;
}

export const StatsService = {
  getVendorStats: async () => {
    const res = await api.get<VendorStats>('/vendors/stats/overview');
    return res.data;
  },

  getListingStats: async () => {
    const res = await api.get<ListingStats>('/listings/stats/overview');
    return res.data;
  }
};