/**
 * Authentication Service
 */

import { apiClient } from '@/lib/api-client';
import type {
  ApiResponse,
  LoginInput,
  RegisterInput,
  UpdateUserInput,
  AuthResponse,
  User,
} from '@/types';

export const authService = {
  /**
   * Login user
   */
  async login(credentials: LoginInput): Promise<ApiResponse<AuthResponse>> {
    const response = await apiClient.post<ApiResponse<AuthResponse>>(
      '/auth/login',
      credentials
    );
    return response.data;
  },

  /**
   * Register new user
   */
  async register(data: RegisterInput): Promise<ApiResponse<User>> {
    const response = await apiClient.post<ApiResponse<User>>(
      '/auth/register',
      data
    );
    return response.data;
  },

  /**
   * Get current user
   */
  async getCurrentUser(): Promise<ApiResponse<User>> {
    const response = await apiClient.get<ApiResponse<User>>('/auth/me');
    return response.data;
  },

  /**
   * Get all users
   */
  async getAllUsers(): Promise<ApiResponse<User[]>> {
    const response = await apiClient.get<ApiResponse<User[]>>('/users');
    return response.data;
  },

  /**
   * Get user by ID
   */
  async getUserById(userId: number): Promise<ApiResponse<User>> {
    const response = await apiClient.get<ApiResponse<User>>(`/users/${userId}`);
    return response.data;
  },

  /**
   * Update user
   */
  async updateUser(userId: number, data: UpdateUserInput): Promise<ApiResponse<User>> {
    const response = await apiClient.put<ApiResponse<User>>(`/users/${userId}`, data);
    return response.data;
  },

  /**
   * Delete user
   */
  async deleteUser(userId: number): Promise<ApiResponse<{ message: string }>> {
    const response = await apiClient.delete<ApiResponse<{ message: string }>>(`/users/${userId}`);
    return response.data;
  },

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string): Promise<ApiResponse<AuthResponse>> {
    const response = await apiClient.post<ApiResponse<AuthResponse>>(
      `/auth/refresh?refresh_token=${refreshToken}`
    );
    return response.data;
  },

  /**
   * Logout - calls backend to clear cookies
   */
  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
      // Continue with client-side logout even if backend call fails
    }
  },
};
