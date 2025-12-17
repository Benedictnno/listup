import { api } from './api';

export interface FeatureFlag {
    id: string;
    key: string;
    isEnabled: boolean;
    description: string | null;
    updatedAt: string;
}

export const fetchFeatureFlags = async (): Promise<FeatureFlag[]> => {
    const response = await api.get('/features');
    return response.data.data;
};

export const updateFeatureFlag = async (data: { key: string; isEnabled: boolean; description?: string }) => {
    const response = await api.post('/features/upsert', data);
    return response.data.data;
};
