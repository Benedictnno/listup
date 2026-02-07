export interface Category {
    id?: string;
    name: string;
    slug?: string;
}

export interface VendorProfile {
    storeName?: string;
    logo?: string;
}

export interface Seller {
    id: string;
    name: string;
    isKYCVerified?: boolean;
    profileImage?: string;
    vendorProfile?: VendorProfile;
}

export interface Listing {
    id: string;
    title: string;
    description: string;
    price: number;
    images: string[];
    location?: string;
    condition?: string;
    category?: string | Category;
    seller?: Seller;
    status?: 'active' | 'inactive' | 'pending' | 'sold';
    stock?: number;
    views?: number;
    sales?: number;
    revenue?: number;
    createdAt?: string;
    seoScore?: number;
}
