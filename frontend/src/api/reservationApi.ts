import axiosClient from './axiosClient';
import { ApiResponse, Page } from '../types/api';
import { Reservation, ReservationRequest, ReservationStatus } from '../types/reservation';

export const reservationApi = {
  getReservations: async (params?: { memberId?: number; status?: ReservationStatus; search?: string; page?: number; size?: number }): Promise<ApiResponse<Page<Reservation>>> => {
    const res = await axiosClient.get<ApiResponse<Page<Reservation>>>('/reservations', { params });
    return res.data;
  },

  getMyReservations: async (params?: { status?: ReservationStatus; search?: string; page?: number; size?: number }): Promise<ApiResponse<Page<Reservation>>> => {
    const res = await axiosClient.get<ApiResponse<Page<Reservation>>>('/reservations/my-reservations', { params });
    return res.data;
  },

  create: async (data: ReservationRequest): Promise<ApiResponse<Reservation>> => {
    const res = await axiosClient.post<ApiResponse<Reservation>>('/reservations', data);
    return res.data;
  },

  cancel: async (id: number): Promise<ApiResponse<Reservation>> => {
    const res = await axiosClient.post<ApiResponse<Reservation>>(`/reservations/${id}/cancel`);
    return res.data;
  },

  fulfill: async (id: number): Promise<ApiResponse<Reservation>> => {
    const res = await axiosClient.post<ApiResponse<Reservation>>(`/reservations/${id}/fulfill`);
    return res.data;
  },
};
