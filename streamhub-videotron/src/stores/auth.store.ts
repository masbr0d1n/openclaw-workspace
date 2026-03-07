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
    (set, get) => ({
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
        
        // Clear any corrupted data first
        if (typeof window !== 'undefined') {
          localStorage.removeItem('auth-storage');
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('user');
          console.log('🗑️ Cleared any existing auth data');
        }
        
        // Store in Zustand
        set({ 
          user, 
          accessToken, 
          isAuthenticated: true, 
          isLoading: false 
        });
        
        // Then persist fresh data to localStorage for API client
        if (typeof window !== 'undefined') {
          localStorage.setItem('access_token', accessToken);
          localStorage.setItem('refresh_token', refreshToken);
          localStorage.setItem('user', JSON.stringify(user));
          console.log('💾 Saved fresh auth data to localStorage');
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
        // Don't persist isLoading - it should reset on page load
        // isLoading: state.isLoading,
      }),
      onRehydrateStorage: () => (state, error) => {
        console.log('🔄 Rehydration:', { state, error });
        
        // Check if user data is valid
        if (state?.user && typeof state.user === 'object') {
          // Valid user data, proceed
          console.log('✅ Valid user data found');
          // CRITICAL FIX: Set isLoading to false after successful rehydration
          set({ isLoading: false });
        } else {
          // Invalid/corrupted user data, clear and reset
          console.warn('⚠️ Corrupted or missing user data, clearing storage');
          if (typeof window !== 'undefined') {
            localStorage.removeItem('auth-storage');
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            localStorage.removeItem('user');
          }
          // Reset state
          set({ 
            user: null, 
            accessToken: null, 
            isAuthenticated: false, 
            isLoading: false 
          });
        }
      },
    }
  )
);
