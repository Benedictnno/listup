import api from '../../utils/axios';

export interface Vendor {
  id: string;
  name: string;
  storeName?: string;
  storeAddress?: string;
  businessCategory?: string;
  coverImage?: string;
  logo?: string;
  profileImage?: string;
  phone?: string;
  storeDescription?: string;
  businessHours?: {
    monday: { open: string; close: string; closed: boolean };
    tuesday: { open: string; close: string; closed: boolean };
    wednesday: { open: string; close: string; closed: boolean };
    thursday: { open: string; close: string; closed: boolean };
    friday: { open: string; close: string; closed: boolean };
    saturday: { open: string; close: string; closed: boolean };
    sunday: { open: string; close: string; closed: boolean };
  };
  socialMedia?: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    linkedin?: string;
  };
  isVerified?: boolean;
  storeAnnouncement?: string;
}

export interface VendorListing {
  id: string;
  title: string;
  description: string;
  price: number;
  images: string[];
  location: string;
  condition: string;
  createdAt: string;
  category: {
    id: string;
    name: string;
    slug: string;
  };
}

export interface VendorListingsResponse {
  success: boolean;
  data: {
    vendor: Vendor;
    listings: VendorListing[];
    pagination: {
      total: number;
      page: number;
      pages: number;
      limit: number;
    };
  };
}

export interface StoreListingsResponse {
  success: boolean;
  data: {
    vendor: Vendor;
    listings: VendorListing[];
    pagination: {
      total: number;
      page: number;
      pages: number;
      limit: number;
    };
  };
}

/**
 * Fetch vendor listings by vendor ID (public endpoint)
 */
export async function getVendorListings(
  vendorId: string,
  page: number = 1,
  limit: number = 20,
  sort: string = 'newest'
): Promise<VendorListingsResponse> {
  try {
    const response = await api.get(
      `/listings/vendors/${vendorId}/public?page=${page}&limit=${limit}&sort=${sort}`
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching vendor listings:', error);
    throw new Error('Failed to fetch vendor listings');
  }
}

/**
 * Fetch vendor listings by store name (public endpoint)
 */
export async function getStoreListings(
  storeName: string,
  page: number = 1,
  limit: number = 20,
  sort: string = 'newest'
): Promise<StoreListingsResponse> {
  try {
    const response = await api.get(
      `/listings/stores/${encodeURIComponent(storeName)}?page=${page}&limit=${limit}&sort=${sort}`
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching store listings:', error);
    throw new Error('Failed to fetch store listings');
  }
}

/**
 * Get vendor profile information
 */
export async function getVendorProfile(vendorId: string): Promise<Vendor> {
  try {
    const response = await api.get(`/listings/vendors/${vendorId}/public?page=1&limit=1`);
    return response.data.data.vendor;
  } catch (error) {
    console.error('Error fetching vendor profile:', error);
    throw new Error('Failed to fetch vendor profile');
  }
}

/**
 * Search vendors by store name
 */
export async function searchVendors(query: string): Promise<Vendor[]> {
  try {
    const response = await api.get(`/listings/stores/${encodeURIComponent(query)}?page=1&limit=10`);
    return [response.data.data.vendor];
  } catch (error) {
    console.error('Error searching vendors:', error);
    return [];
  }
}
