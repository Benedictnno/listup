import { api } from './api';

export interface User {
    id: string;
    name: string;
    email: string;
    phone?: string;
    role: string;
    isVerified: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface UsersResponse {
    users: User[];
    pagination: {
        total: number;
        page: number;
        pages: number;
        limit: number;
    };
    total?: number; // Handle variations in backend response
    totalPages?: number;
}

const usersService = {
    getAll: async (params?: {
        page?: number;
        limit?: number;
        role?: string;
        search?: string;
        sortBy?: string;
        sortOrder?: string;
    }): Promise<UsersResponse> => {
        const response = await api.get('/users', { params });
        return response.data.data || response.data;
    },

    getById: async (id: string): Promise<User> => {
        const response = await api.get(`/users/${id}`);
        return response.data.data.user || response.data.user;
    },

    update: async (id: string, data: Partial<User>): Promise<User> => {
        const response = await api.patch(`/users/${id}`, data);
        return response.data.data.user || response.data.user;
    },

    delete: async (id: string): Promise<void> => {
        await api.delete(`/users/${id}`);
    }
};

export default usersService;
