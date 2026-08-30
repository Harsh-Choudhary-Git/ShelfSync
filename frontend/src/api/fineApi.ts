import axiosClient from './axiosClient';
import { ApiResponse, Page } from '../types/api';
import { Fine, FineStatus, PayFineRequest } from '../types/fine';

export const fineApi = {
  getFines: async (params?: { memberId?: number; status?: FineStatus; search?: string; page?: number; size?: number }): Promise<ApiResponse<Page<Fine>>> => {
    const res = await axiosClient.get<ApiResponse<Page<Fine>>>('/fines', { params });
    return res.data;
  },

  getMyFines: async (params?: { status?: FineStatus; search?: string; page?: number; size?: number }): Promise<ApiResponse<Page<Fine>>> => {
    const res = await axiosClient.get<ApiResponse<Page<Fine>>>('/fines/my-fines', { params });
    return res.data;
  },

  getFineById: async (id: number): Promise<ApiResponse<Fine>> => {
    const res = await axiosClient.get<ApiResponse<Fine>>(`/fines/${id}`);
    return res.data;
  },

  payFine: async (id: number, data?: PayFineRequest): Promise<ApiResponse<Fine>> => {
    const res = await axiosClient.post<ApiResponse<Fine>>(`/fines/${id}/pay`, data || {});
    return res.data;
  },
};
