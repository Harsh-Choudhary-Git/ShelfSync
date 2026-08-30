import axiosClient from './axiosClient';
import { ApiResponse, Page } from '../types/api';
import { Author, Publisher, Category } from '../types/book';

export const authorApi = {
  getAuthors: async (params?: { search?: string; page?: number; size?: number }): Promise<ApiResponse<Page<Author>>> => {
    const res = await axiosClient.get<ApiResponse<Page<Author>>>('/authors', { params });
    return res.data;
  },

  getAllList: async (): Promise<ApiResponse<Author[]>> => {
    const res = await axiosClient.get<ApiResponse<Author[]>>('/authors/list');
    return res.data;
  },

  create: async (data: Partial<Author>): Promise<ApiResponse<Author>> => {
    const res = await axiosClient.post<ApiResponse<Author>>('/authors', data);
    return res.data;
  },

  update: async (id: number, data: Partial<Author>): Promise<ApiResponse<Author>> => {
    const res = await axiosClient.put<ApiResponse<Author>>(`/authors/${id}`, data);
    return res.data;
  },

  delete: async (id: number): Promise<ApiResponse<void>> => {
    const res = await axiosClient.delete<ApiResponse<void>>(`/authors/${id}`);
    return res.data;
  },
};

export const publisherApi = {
  getPublishers: async (params?: { search?: string; page?: number; size?: number }): Promise<ApiResponse<Page<Publisher>>> => {
    const res = await axiosClient.get<ApiResponse<Page<Publisher>>>('/publishers', { params });
    return res.data;
  },

  getAllList: async (): Promise<ApiResponse<Publisher[]>> => {
    const res = await axiosClient.get<ApiResponse<Publisher[]>>('/publishers/list');
    return res.data;
  },

  create: async (data: Partial<Publisher>): Promise<ApiResponse<Publisher>> => {
    const res = await axiosClient.post<ApiResponse<Publisher>>('/publishers', data);
    return res.data;
  },

  update: async (id: number, data: Partial<Publisher>): Promise<ApiResponse<Publisher>> => {
    const res = await axiosClient.put<ApiResponse<Publisher>>(`/publishers/${id}`, data);
    return res.data;
  },

  delete: async (id: number): Promise<ApiResponse<void>> => {
    const res = await axiosClient.delete<ApiResponse<void>>(`/publishers/${id}`);
    return res.data;
  },
};

export const categoryApi = {
  getCategories: async (params?: { search?: string; page?: number; size?: number }): Promise<ApiResponse<Page<Category>>> => {
    const res = await axiosClient.get<ApiResponse<Page<Category>>>('/categories', { params });
    return res.data;
  },

  getAllList: async (): Promise<ApiResponse<Category[]>> => {
    const res = await axiosClient.get<ApiResponse<Category[]>>('/categories/list');
    return res.data;
  },

  create: async (data: Partial<Category>): Promise<ApiResponse<Category>> => {
    const res = await axiosClient.post<ApiResponse<Category>>('/categories', data);
    return res.data;
  },

  update: async (id: number, data: Partial<Category>): Promise<ApiResponse<Category>> => {
    const res = await axiosClient.put<ApiResponse<Category>>(`/categories/${id}`, data);
    return res.data;
  },

  delete: async (id: number): Promise<ApiResponse<void>> => {
    const res = await axiosClient.delete<ApiResponse<void>>(`/categories/${id}`);
    return res.data;
  },
};
