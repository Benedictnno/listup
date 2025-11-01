import { api } from './api';

export interface VendorProfile {
  id: string;
  storeName: string;
  storeDescription?: string;
  storeAddress?: string;
  businessCategory: string;
  coverImage?: string;
  logo?: string;
  website?: string;
  isVerified: boolean;
  verificationStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
  rejectionReason?: string;
  verifiedAt?: string;
  verifiedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Vendor {
  id: string;
  name: string;
  email: string;
  phone?: string;
  createdAt: string;
  updatedAt: string;
  vendorProfile: VendorProfile;
}

export interface VendorsResponse {
  vendors: Vendor[];
  pagination: {
    total: number;
    page: number;
    pages: number;
    limit: number;
  };
}

export interface VendorStats {
  totalVendors: number;
  pendingVendors: number;
  approvedVendors: number;
  rejectedVendors: number;
  recentVendors: number;
}

const vendorsService = {
  getAll: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
  }): Promise<VendorsResponse> => {
    const response = await api.get('/vendors', { params });
    return response.data.data;
  },

  getById: async (id: string): Promise<Vendor> => {
    const response = await api.get(`/vendors/${id}`);
    return response.data.data.vendor;
  },

  approve: async (id: string): Promise<Vendor> => {
    const response = await api.patch(`/vendors/${id}/approve`);
    return response.data.data.vendor;
  },

  reject: async (id: string, reason: string): Promise<Vendor> => {
    const response = await api.patch(`/vendors/${id}/reject`, { reason });
    return response.data.data.vendor;
  },

  getStats: async (): Promise<VendorStats> => {
    const response = await api.get('/vendors/stats/overview');
    return response.data.data;
  }
};

export default vendorsService;
