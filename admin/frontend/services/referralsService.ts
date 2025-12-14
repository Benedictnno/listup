import { api } from './api';

export interface ReferralUse {
    id: string;
    vendorId: string;
    vendorName: string | null;
    vendorEmail: string | null;
    vendorPhone: string | null;
    storeName: string | null;
    status: "PENDING" | "COMPLETED" | "CANCELLED";
    commission: number;
    commissionPaid: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface ReferralRecord {
    id: string;
    code: string;
    isActive: boolean;
    totalReferrals: number;
    successfulReferrals: number;
    totalEarnings: number;
    createdAt: string;
    user: {
        id: string;
        name: string;
        email: string;
    };
    referredVendors: ReferralUse[];
}

export interface AdminReferralResponse {
    total: number;
    page: number;
    limit: number;
    referrals: ReferralRecord[];
}

const referralsService = {
    getAll: async (params?: { page?: number; limit?: number }): Promise<AdminReferralResponse> => {
        const response = await api.get('/referrals/admin/all', { params });
        return response.data.data;
    },

    toggleActive: async (id: string, isActive: boolean): Promise<void> => {
        await api.patch(`/referrals/admin/${id}/active`, { isActive });
    }
};

export default referralsService;
