/**
 * Auth Store (Zustand) with Debug Logging
 * Manages authentication state
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/types';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // Actions
  setUser: (user: User) => void;
  setAccessToken: (token: string | null) => void;
  login: (user: User, accessToken: string, refreshToken: string) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isLoading: true,

      setUser: (user) => {
        console.log('📝 Setting user:', user);
        set({ user, isAuthenticated: !!user });
      },
      
      setAccessToken: (accessToken) => {
        console.log('🎫 Setting access token:', !!accessToken);
        set({ accessToken });
      },
      
      login: (user, accessToken, refreshToken) => {
        console.log('🔐 Login action called');
        console.log('👤 User:', user);
        console.log('🎫 Access token:', !!accessToken);
        console.log('🔄 Refresh token:', !!refreshToken);
        
        // Store in Zustand (in-memory only, no persistence)
        set({ 
          user, 
          accessToken, 
          isAuthenticated: true, 
          isLoading: false 
        });
        
        // Tokens are stored in httpOnly cookies by the backend
        // No client-side storage needed
        console.log('✅ Auth state updated (httpOnly cookies)');
        console.log('📊 Current state:', {
          user: !!user,
          accessToken: !!accessToken,
          isAuthenticated: true,
          isLoading: false
        });
      },
      
      logout: () => {
        console.log('🚪 Logout action called');
        set({ 
          user: null, 
          accessToken: null, 
          isAuthenticated: false, 
          isLoading: false 
        });
        
        // httpOnly cookies are cleared by the backend via /auth/logout endpoint
        // No client-side cleanup needed
        console.log('✅ Auth state cleared (cookies cleared by backend)');
      },
      
      setLoading: (isLoading) => {
        console.log('⏳ Setting isLoading:', isLoading);
        set({ isLoading });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        isAuthenticated: state.isAuthenticated,
        // Don't persist isLoading - it should reset on page load
        // isLoading: state.isLoading,
      }),
    }
  )
);
