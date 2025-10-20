export interface Vendor {
  id: string;
  name: string;
  email: string;
  phone?: string;
  createdAt: string;
  vendorProfile: {
    id: string;
    storeName: string;
    storeAddress: string;
    businessCategory: string;
    coverImage?: string;
    logo?: string;
    website?: string;
    isVerified: boolean;
    verificationStatus: string;
    rejectionReason?: string;
    verifiedAt?: string;
    verifiedBy?: string;
    createdAt: string;
  };
}