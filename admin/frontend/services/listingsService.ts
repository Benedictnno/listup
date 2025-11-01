import { api } from './api';

export interface Listing {
  id: string;
  title: string;
  description: string;
  price: number;
  images: string[];
  location?: string;
  condition?: string;
  isActive: boolean;
  boostScore: number;
  createdAt: string;
  updatedAt: string;
  category?: {
    id: string;
    name: string;
    slug: string;
  };
  seller: {
    id: string;
    name: string;
    email: string;
    vendorProfile?: {
      storeName: string;
      isVerified: boolean;
      verificationStatus: string;
    };
  };
}

export interface ListingsResponse {
  listings: Listing[];
  pagination: {
    total: number;
    page: number;
    pages: number;
    limit: number;
  };
}

export interface ListingStats {
  totalListings: number;
  activeListings: number;
  inactiveListings: number;
  recentListings: number;
  categoryStats: Array<{
    categoryId: string;
    count: number;
    categoryName: string;
  }>;
}

const listingsService = {
  getAll: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    category?: string;
    search?: string;
  }): Promise<ListingsResponse> => {
    const response = await api.get('/listings', { params });
    return response.data.data;
  },

  getById: async (id: string): Promise<Listing> => {
    const response = await api.get(`/listings/${id}`);
    return response.data.data.listing;
  },

  toggleStatus: async (id: string): Promise<Listing> => {
    const response = await api.patch(`/listings/${id}/toggle-status`);
    return response.data.data.listing;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/listings/${id}`);
  },

  getStats: async (): Promise<ListingStats> => {
    const response = await api.get('/listings/stats/overview');
    return response.data.data;
  }
};

export default listingsService;
