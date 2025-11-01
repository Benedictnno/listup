// User types
export interface User {
  id: string;
  email: string;
  name?: string;
  roles: string[];
  createdAt?: string;
  updatedAt?: string;
}

// Vendor types
export interface Vendor {
  id: string;
  name: string;
  email: string;
  phone?: string;
  storeName: string;
  description?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
}

// Listing types
export interface Listing {
  id: string;
  title: string;
  description: string;
  price: number;
  images: string[];
  categoryId: string;
  category?: Category;
  vendorId: string;
  vendor?: Vendor;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

// Category types
export interface Category {
  id: string;
  name: string;
  description?: string;
  slug: string;
  createdAt?: string;
  updatedAt?: string;
}

// Address types
export interface Address {
  id: string;
  name: string;
  street?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  userId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AddressListResponse {
  items: Address[];
  meta: {
    page: number;
    limit: number;
    total: number;
  };
}
  vendorId?: string;
  createdAt?: string;
  updatedAt?: string;
}

// API response types
export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ApiError {
  message: string;
  statusCode: number;
}

// Dashboard stats
export interface DashboardStats {
  users: {
    total: number;
    newToday: number;
    activeToday: number;
  };
  vendors: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
  };
  listings: {
    total: number;
    active: number;
    inactive: number;
    newToday: number;
  };
}

// Theme
export type Theme = 'light' | 'dark' | 'system';