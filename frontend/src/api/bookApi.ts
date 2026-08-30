import axiosClient from './axiosClient';
import { ApiResponse, Page } from '../types/api';
import { Book, BookRequest } from '../types/book';

export interface BookFilterParams {
  search?: string;
  categoryId?: number;
  authorId?: number;
  onlyAvailable?: boolean;
  minYear?: number;
  maxYear?: number;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}

export const bookApi = {
  getBooks: async (params?: BookFilterParams): Promise<ApiResponse<Page<Book>>> => {
    const res = await axiosClient.get<ApiResponse<Page<Book>>>('/books', { params });
    return res.data;
  },

  getBookById: async (id: number): Promise<ApiResponse<Book>> => {
    const res = await axiosClient.get<ApiResponse<Book>>(`/books/${id}`);
    return res.data;
  },

  getBookByIsbn: async (isbn: string): Promise<ApiResponse<Book>> => {
    const res = await axiosClient.get<ApiResponse<Book>>(`/books/isbn/${isbn}`);
    return res.data;
  },

  createBook: async (data: BookRequest): Promise<ApiResponse<Book>> => {
    const res = await axiosClient.post<ApiResponse<Book>>('/books', data);
    return res.data;
  },

  updateBook: async (id: number, data: BookRequest): Promise<ApiResponse<Book>> => {
    const res = await axiosClient.put<ApiResponse<Book>>(`/books/${id}`, data);
    return res.data;
  },

  deleteBook: async (id: number): Promise<ApiResponse<void>> => {
    const res = await axiosClient.delete<ApiResponse<void>>(`/books/${id}`);
    return res.data;
  },
};
