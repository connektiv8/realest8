import api from './api';
import { User } from '../types';

export const authService = {
  // Register new user
  register: async (userData: {
    username: string;
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    is_vendor: boolean;
    phone?: string;
    company_name?: string;
  }) => {
    const response = await api.post<User>('/accounts/register/', userData);
    return response.data;
  },

  // Get current user profile
  getProfile: async () => {
    const response = await api.get<User>('/accounts/profile/');
    return response.data;
  },

  // Update user profile
  updateProfile: async (userData: Partial<User>) => {
    const response = await api.put<User>('/accounts/profile/', userData);
    return response.data;
  },

  // Login
  login: async (username: string, password: string) => {
    const response = await api.post('/auth/login/', { username, password });
    return response.data;
  },

  // Logout
  logout: async () => {
    await api.post('/auth/logout/');
  },
};
