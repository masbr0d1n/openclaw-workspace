/**
 * API Client - Using Next.js Route Handlers
 * All requests go through Next.js API routes instead of directly to backend
 * 
 * SECURITY: httpOnly cookies are used for JWT tokens (set by backend)
 * No tokens stored in localStorage - cookies are automatically included
 */

import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

// ✅ CORRECT (through Next.js proxy)
const API_URL = '/api/v1';

// Create axios instance
export const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,  // IMPORTANT: Include cookies in requests
});

// Request interceptor - tokens are automatically sent via cookies
// No need to manually add Authorization header
apiClient.interceptors.request.use(
  (config) => {
    // Cookies are automatically included by browser due to withCredentials: true
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // If 401 and not already retrying
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Try to refresh token via Next.js API
        // Backend will use refresh_token cookie to generate new access_token
        const response = await axios.post(
          '/api/v1/auth/refresh',
          {},
          { withCredentials: true }
        );

        // Cookies are automatically updated by backend response
        // No need to manually store tokens

        // Retry original request - new access_token cookie will be used
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh failed - redirect to login
        if (typeof window !== 'undefined') {
          // Redirect to login (but avoid infinite loop)
          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
