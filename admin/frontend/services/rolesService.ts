import { api } from './api';

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  createdAt: string;
  updatedAt: string;
}

export interface RoleCreateRequest {
  name: string;
  description: string;
  permissions: string[];
}

export interface RoleUpdateRequest {
  name?: string;
  description?: string;
  permissions?: string[];
}

export const RolesService = {
  getRoles: async () => {
    const res = await api.get<Role[]>('/roles');
    return res.data;
  },
  
  getRole: async (id: string) => {
    const res = await api.get<Role>(`/roles/${id}`);
    return res.data;
  },
  
  createRole: async (role: RoleCreateRequest) => {
    const res = await api.post<Role>('/roles', role);
    return res.data;
  },
  
  updateRole: async (id: string, role: RoleUpdateRequest) => {
    const res = await api.patch<Role>(`/roles/${id}`, role);
    return res.data;
  },
  
  deleteRole: async (id: string) => {
    await api.delete(`/roles/${id}`);
  },
  
  // For assigning roles to users
  assignRole: async (userId: string, roleId: string) => {
    const res = await api.post(`/users/${userId}/roles`, { roleId });
    return res.data;
  },
  
  removeRole: async (userId: string, roleId: string) => {
    await api.delete(`/users/${userId}/roles/${roleId}`);
  }
};