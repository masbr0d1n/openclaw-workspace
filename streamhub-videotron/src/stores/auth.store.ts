/**
 * Auth Store (Zustand) with Debug Logging
 * Manages authentication state
 * 
 * SECURITY: Tokens are stored in httpOnly cookies (backend-managed)
 * This store only tracks user info and auth state
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // Actions
  setUser: (user: User) => void;
  login: (user: User) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: true,

      setUser: (user) => {
        console.log('📝 Setting user:', user);
        set({ user, isAuthenticated: !!user });
      },
      
      login: (user) => {
        console.log('🔐 Login action called');
        console.log('👤 User:', user);
        
        // Store in Zustand only - tokens are in httpOnly cookies
        set({ 
          user, 
          isAuthenticated: true, 
          isLoading: false 
        });
        
        console.log('✅ Auth state updated');
        console.log('📊 Current state:', {
          user: !!user,
          isAuthenticated: true,
          isLoading: false
        });
      },
      
      logout: () => {
        console.log('🚪 Logout action called');
        set({ 
          user: null, 
          isAuthenticated: false, 
          isLoading: false 
        });
        
        // Note: Cookie clearing is handled by backend /auth/logout endpoint
        // Frontend just needs to clear local state
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
        isAuthenticated: state.isAuthenticated,
        // Don't persist isLoading - it should reset on page load
      }),
      onRehydrateStorage: () => (state, error) => {
        console.log('🔄 Rehydration:', { state, error });
        
        // Check if user data is valid
        if (state?.user && typeof state.user === 'object') {
          // Valid user data, proceed
          console.log('✅ Valid user data found');
          // Set isLoading to false after successful rehydration
          useAuthStore.setState({ isLoading: false });
        } else {
          // Invalid/corrupted user data, clear and reset
          console.warn('⚠️ Corrupted or missing user data, clearing storage');
          // Reset state
          useAuthStore.setState({ 
            user: null, 
            isAuthenticated: false, 
            isLoading: false 
          });
        }
      },
    }
  )
);
