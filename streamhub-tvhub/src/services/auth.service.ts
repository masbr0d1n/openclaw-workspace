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
   * Logout - call backend to clear httpOnly cookies
   */
  async logout(): Promise<void> {
    if (typeof window !== 'undefined') {
      try {
        await apiClient.post('/auth/logout');
      } catch (error) {
        console.error('Logout API call failed:', error);
      }
    }
  },

  /**
   * Get stored access token - not used with httpOnly cookies
   */
  getAccessToken(): string | null {
    // Tokens are stored in httpOnly cookies, not accessible from JavaScript
    return null;
  },

  /**
   * Get stored refresh token - not used with httpOnly cookies
   */
  getRefreshToken(): string | null {
    // Tokens are stored in httpOnly cookies, not accessible from JavaScript
    return null;
  },

  /**
   * Get stored user - not used with httpOnly cookies
   */
  getStoredUser(): User | null {
    // User data should be fetched from /auth/me endpoint
    return null;
  },

  /**
   * Store auth data - not used with httpOnly cookies
   */
  storeAuthData(data: AuthResponse): void {
    // Tokens are stored in httpOnly cookies automatically by the backend
    // No client-side storage needed
  },
};
