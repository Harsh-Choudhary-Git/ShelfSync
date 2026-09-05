import axios from 'axios';
import { auth } from '../config/firebase';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

export const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT / Firebase ID token
axiosClient.interceptors.request.use(
  async (config) => {
    try {
      const cachedToken = localStorage.getItem('token');
      if (cachedToken && config.headers) {
        config.headers.Authorization = `Bearer ${cachedToken}`;
      } else {
        const currentUser = auth.currentUser;
        if (currentUser) {
          const idToken = await currentUser.getIdToken();
          if (config.headers) {
            config.headers.Authorization = `Bearer ${idToken}`;
          }
        }
      }
    } catch (e) {
      console.warn('Could not retrieve auth token:', e);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors and session expiration
axiosClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      // If unauthorized and not already on auth page, redirect to login
      if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login?expired=true';
      }
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
