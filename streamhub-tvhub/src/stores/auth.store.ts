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
  setAccessToken: (token: string) => void;
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
        
        // Store in Zustand
        set({ 
          user, 
          accessToken, 
          isAuthenticated: true, 
          isLoading: false 
        });
        
        // Also store in localStorage for API client
        if (typeof window !== 'undefined') {
          localStorage.setItem('access_token', accessToken);
          localStorage.setItem('refresh_token', refreshToken);
          localStorage.setItem('user', JSON.stringify(user));
          console.log('💾 Saved to localStorage');
        }
        
        console.log('✅ Auth state updated');
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
        
        // Clear localStorage
        if (typeof window !== 'undefined') {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('user');
          console.log('🗑️ Cleared localStorage');
        }
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
      }),
    }
  )
);
