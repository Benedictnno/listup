import { api } from './api';
import { Address, AddressListResponse } from '../types';

export const AddressesService = {
  list: async (params?: { page?: number; limit?: number; search?: string }) => {
    const res = await api.get<AddressListResponse>('/addresses', { params });
    return res.data;
  },
  
  get: async (addressId: string) => {
    const res = await api.get<Address>(`/addresses/${addressId}`);
    return res.data;
  },
  
  create: async (data: { name: string }) => {
    const res = await api.post<Address>('/addresses', data);
    return res.data;
  },
  
  update: async (addressId: string, data: { name: string }) => {
    const res = await api.patch<Address>(`/addresses/${addressId}`, data);
    return res.data;
  },
  
  delete: async (addressId: string) => {
    const res = await api.delete(`/addresses/${addressId}`);
    return res.data;
  }
};