import { api } from './api';

export interface AuditLog {
  id: string;
  userId: string | null;
  user?: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  action: string;
  targetType: string | null;
  targetId: string | null;
  metadata: any;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
}

export interface AuditLogsResponse {
  success: boolean;
  data: AuditLog[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

const auditService = {
  getLogs: async (params: {
    userId?: string;
    action?: string;
    targetType?: string;
    targetId?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }) => {
    const response = await api.get<AuditLogsResponse>('/audit/logs', { params });
    return response.data;
  },

  getActions: async () => {
    const response = await api.get<{ success: boolean; data: string[] }>('/audit/actions');
    return response.data;
  },
};

export default auditService;
