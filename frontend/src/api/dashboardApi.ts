import axiosClient from './axiosClient';
import { ApiResponse } from '../types/api';
import { DashboardStats, SystemSetting } from '../types/dashboard';

export const dashboardApi = {
  getAdminStats: async (): Promise<ApiResponse<DashboardStats>> => {
    const res = await axiosClient.get<ApiResponse<DashboardStats>>('/dashboard/admin');
    return res.data;
  },

  getLibrarianStats: async (): Promise<ApiResponse<DashboardStats>> => {
    const res = await axiosClient.get<ApiResponse<DashboardStats>>('/dashboard/librarian');
    return res.data;
  },

  getMemberStats: async (): Promise<ApiResponse<DashboardStats>> => {
    const res = await axiosClient.get<ApiResponse<DashboardStats>>('/dashboard/member');
    return res.data;
  },
};

export const settingsApi = {
  getSettings: async (): Promise<ApiResponse<SystemSetting[]>> => {
    const res = await axiosClient.get<ApiResponse<SystemSetting[]>>('/settings');
    return res.data;
  },

  getPublicSettings: async (): Promise<ApiResponse<{ borrowDurationDays: number; finePerDay: number; maxActiveLoans: number }>> => {
    const res = await axiosClient.get<ApiResponse<{ borrowDurationDays: number; finePerDay: number; maxActiveLoans: number }>>('/settings/public');
    return res.data;
  },

  updateSetting: async (key: string, value: string, description?: string): Promise<ApiResponse<SystemSetting>> => {
    const res = await axiosClient.put<ApiResponse<SystemSetting>>(`/settings/${key}`, {
      settingKey: key,
      settingValue: value,
      description,
    });
    return res.data;
  },
};
