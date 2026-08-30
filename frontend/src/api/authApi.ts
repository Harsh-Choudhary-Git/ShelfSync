import axiosClient from './axiosClient';
import { ApiResponse } from '../types/api';
import { AuthResponse, LoginRequest, RegisterRequest, User } from '../types/auth';

export const authApi = {
  login: async (data: LoginRequest): Promise<ApiResponse<AuthResponse>> => {
    const res = await axiosClient.post<ApiResponse<AuthResponse>>('/auth/login', data);
    return res.data;
  },

  register: async (data: RegisterRequest): Promise<ApiResponse<User>> => {
    const res = await axiosClient.post<ApiResponse<User>>('/auth/register', data);
    return res.data;
  },

  getMe: async (): Promise<ApiResponse<User>> => {
    const res = await axiosClient.get<ApiResponse<User>>('/auth/me');
    return res.data;
  },
};
