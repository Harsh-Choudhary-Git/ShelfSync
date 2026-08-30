import axiosClient from './axiosClient';
import { ApiResponse, Page } from '../types/api';
import { Role, User, UserStatus } from '../types/auth';

export interface UserFilterParams {
  role?: Role;
  status?: UserStatus;
  search?: string;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}

export const userApi = {
  getUsers: async (params?: UserFilterParams): Promise<ApiResponse<Page<User>>> => {
    const res = await axiosClient.get<ApiResponse<Page<User>>>('/users', { params });
    return res.data;
  },

  getUserById: async (id: number): Promise<ApiResponse<User>> => {
    const res = await axiosClient.get<ApiResponse<User>>(`/users/${id}`);
    return res.data;
  },

  createUser: async (data: any): Promise<ApiResponse<User>> => {
    const res = await axiosClient.post<ApiResponse<User>>('/users', data);
    return res.data;
  },

  updateUser: async (id: number, data: any): Promise<ApiResponse<User>> => {
    const res = await axiosClient.put<ApiResponse<User>>(`/users/${id}`, data);
    return res.data;
  },

  deleteUser: async (id: number): Promise<ApiResponse<void>> => {
    const res = await axiosClient.delete<ApiResponse<void>>(`/users/${id}`);
    return res.data;
  },

  toggleStatus: async (id: number): Promise<ApiResponse<User>> => {
    const res = await axiosClient.patch<ApiResponse<User>>(`/users/${id}/status`);
    return res.data;
  },

  changePassword: async (id: number, data: any): Promise<ApiResponse<void>> => {
    const res = await axiosClient.post<ApiResponse<void>>(`/users/${id}/change-password`, data);
    return res.data;
  },
};
