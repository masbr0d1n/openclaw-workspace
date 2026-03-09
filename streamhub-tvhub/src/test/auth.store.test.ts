import { describe, it, expect, beforeEach } from 'vitest';
import { useAuthStore } from '../stores/auth.store';
import type { User } from '@/types';

// Mock user for testing
const mockUser: User = {
  id: 123,
  username: 'testuser',
  email: 'test@example.com',
  full_name: 'Test User',
  is_active: true,
  is_admin: false,
  role: 'admin',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

describe('auth store', () => {
  beforeEach(() => {
    // Reset store before each test
    useAuthStore.setState({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isLoading: true,
    });
  });

  describe('initial state', () => {
    it('should start with user as null', () => {
      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
    });

    it('should start with isAuthenticated as false', () => {
      const state = useAuthStore.getState();
      expect(state.isAuthenticated).toBe(false);
    });

    it('should start with isLoading as true', () => {
      const state = useAuthStore.getState();
      expect(state.isLoading).toBe(true);
    });
  });

  describe('setUser', () => {
    it('should set user and update isAuthenticated', () => {
      useAuthStore.getState().setUser(mockUser);
      const state = useAuthStore.getState();
      expect(state.user).toEqual(mockUser);
      expect(state.isAuthenticated).toBe(true);
    });
  });

  describe('setAccessToken', () => {
    it('should set access token', () => {
      useAuthStore.getState().setAccessToken('test-token-123');
      const state = useAuthStore.getState();
      expect(state.accessToken).toBe('test-token-123');
    });
  });

  describe('login', () => {
    it('should set all auth state on login', () => {
      useAuthStore.getState().login(mockUser, 'access-token', 'refresh-token');
      const state = useAuthStore.getState();
      expect(state.user).toEqual(mockUser);
      expect(state.accessToken).toBe('access-token');
      expect(state.isAuthenticated).toBe(true);
      expect(state.isLoading).toBe(false);
    });
  });

  describe('logout', () => {
    it('should clear all auth state', () => {
      // First login
      useAuthStore.getState().login(mockUser, 'access-token', 'refresh-token');
      
      // Then logout
      useAuthStore.getState().logout();
      
      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.accessToken).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(state.isLoading).toBe(false);
    });
  });

  describe('setLoading', () => {
    it('should set loading state', () => {
      useAuthStore.getState().setLoading(true);
      expect(useAuthStore.getState().isLoading).toBe(true);
      
      useAuthStore.getState().setLoading(false);
      expect(useAuthStore.getState().isLoading).toBe(false);
    });
  });
});
