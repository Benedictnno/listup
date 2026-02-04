import api from "@/utils/axios";

export const referralApi = {
    /**
     * Get the referral leaderboard
     */
    getLeaderboard: async () => {
        const response = await api.get('/referrals/leaderboard');
        return response.data;
    },

    /**
     * Get partner dashboard statistics
     */
    getPartnerDashboard: async () => {
        const response = await api.get('/referrals/partner/dashboard');
        return response.data;
    },

    /**
     * Qualify a referral click after engagement
     */
    qualifyClick: async (clickId: string) => {
        const response = await api.post('/referrals/qualify', { clickId });
        return response.data;
    },

    /**
     * Get or create current user's referral code
     */
    getMyCode: async () => {
        const response = await api.get('/referrals/my-code');
        return response.data;
    }
};
