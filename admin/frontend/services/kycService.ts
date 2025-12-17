import { api } from './api';

export type KYCStatus =
    | "PENDING"
    | "DOCUMENTS_REVIEW"
    | "INTERVIEW_SCHEDULED"
    | "INTERVIEW_COMPLETED"
    | "APPROVED"
    | "REJECTED";

export type PaymentStatus = "PENDING" | "SUCCESS" | "FAILED";

export interface VendorInfo {
    id: string;
    name: string;
    email: string;
    phone?: string | null;
    vendorProfile?: {
        storeName?: string | null;
        storeAddress?: string | null;
    } | null;
}

export interface KYCSubmission {
    id: string;
    vendorId: string;
    status: KYCStatus;
    paymentStatus: PaymentStatus;
    signupFee: number;
    hasReferral: boolean;
    tiktokHandle?: string | null;
    instagramHandle?: string | null;
    facebookPage?: string | null;
    twitterHandle?: string | null;
    otherSocial?: string | null;
    cacNumber?: string | null;
    documentUrl?: string | null;
    documentType?: string | null;
    createdAt: string;
    updatedAt: string;
    interviewScheduled?: string | null;
    interviewCompleted?: string | null;
    interviewNotes?: string | null;
    rejectionReason?: string | null;
    vendor: VendorInfo;
}

export interface PaginatedResponse {
    total: number;
    page: number;
    limit: number;
    kycs: KYCSubmission[];
}

const kycService = {
    getAll: async (params?: {
        page?: number;
        limit?: number;
        status?: KYCStatus | "ALL";
        search?: string;
    }): Promise<PaginatedResponse> => {
        // Manually construct query string to match exact existing logic if needed, 
        // but api.get params usually handles it. 
        // Existing: statusFilter !== "ALL" ? `&status=${statusFilter}` : ""
        const queryParams: any = { page: params?.page, limit: params?.limit };
        if (params?.status && params.status !== "ALL") {
            queryParams.status = params.status;
        }
        if (params?.search) {
            queryParams.search = params.search;
        }

        const response = await api.get('/kyc/admin/submissions', { params: queryParams });
        return response.data.data;
    },

    updateStatus: async (id: string, data: {
        status: KYCStatus;
        interviewScheduled?: string;
        interviewCompleted?: string;
        interviewNotes?: string;
    }): Promise<void> => {
        await api.patch(`/kyc/admin/${id}/status`, data);
    },

    processPayment: async (id: string): Promise<void> => {
        await api.post(`/kyc/admin/${id}/payment`);
    }
};

export default kycService;
