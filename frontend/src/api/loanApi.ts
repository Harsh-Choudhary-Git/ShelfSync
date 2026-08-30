import axiosClient from './axiosClient';
import { ApiResponse, Page } from '../types/api';
import { IssueLoanRequest, Loan, LoanStatus, ReturnLoanRequest } from '../types/loan';

export interface LoanFilterParams {
  memberId?: number;
  status?: LoanStatus;
  search?: string;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}

export const loanApi = {
  getLoans: async (params?: LoanFilterParams): Promise<ApiResponse<Page<Loan>>> => {
    const res = await axiosClient.get<ApiResponse<Page<Loan>>>('/loans', { params });
    return res.data;
  },

  getMyLoans: async (params?: { status?: LoanStatus; search?: string; page?: number; size?: number }): Promise<ApiResponse<Page<Loan>>> => {
    const res = await axiosClient.get<ApiResponse<Page<Loan>>>('/loans/my-loans', { params });
    return res.data;
  },

  getLoanById: async (id: number): Promise<ApiResponse<Loan>> => {
    const res = await axiosClient.get<ApiResponse<Loan>>(`/loans/${id}`);
    return res.data;
  },

  issueBook: async (data: IssueLoanRequest): Promise<ApiResponse<Loan>> => {
    const res = await axiosClient.post<ApiResponse<Loan>>('/loans/issue', data);
    return res.data;
  },

  returnBook: async (id: number, data?: ReturnLoanRequest): Promise<ApiResponse<Loan>> => {
    const res = await axiosClient.post<ApiResponse<Loan>>(`/loans/${id}/return`, data || {});
    return res.data;
  },

  syncOverdue: async (): Promise<ApiResponse<void>> => {
    const res = await axiosClient.post<ApiResponse<void>>('/loans/sync-overdue');
    return res.data;
  },
};
