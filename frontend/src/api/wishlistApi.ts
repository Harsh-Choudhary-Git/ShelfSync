import axiosClient from './axiosClient';
import { ApiResponse, Page } from '../types/api';
import { WishlistItem } from '../types/wishlist';

export const wishlistApi = {
  getMyWishlist: async (): Promise<ApiResponse<WishlistItem[]>> => {
    const res = await axiosClient.get<ApiResponse<WishlistItem[]>>('/wishlist/my-wishlist');
    return res.data;
  },
  addToWishlist: async (bookId: number): Promise<ApiResponse<WishlistItem>> => {
    const res = await axiosClient.post<ApiResponse<WishlistItem>>(`/wishlist/${bookId}`);
    return res.data;
  },
  removeFromWishlist: async (bookId: number): Promise<ApiResponse<void>> => {
    const res = await axiosClient.delete<ApiResponse<void>>(`/wishlist/${bookId}`);
    return res.data;
  },
};
