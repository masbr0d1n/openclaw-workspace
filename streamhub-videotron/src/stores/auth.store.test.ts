import { describe, it, expect, beforeEach } from 'vitest'
import { useAuthStore } from './auth.store'

describe('auth store', () => {
  beforeEach(() => {
    // Reset store before each test
    useAuthStore.setState({
      user: null,
      isAuthenticated: false,
      isLoading: true,
    })
  })

  describe('initial state', () => {
    it('should start with user null', () => {
      const state = useAuthStore.getState()
      expect(state.user).toBeNull()
    })

    it('should start with isAuthenticated false', () => {
      const state = useAuthStore.getState()
      expect(state.isAuthenticated).toBe(false)
    })

    it('should start with isLoading true', () => {
      const state = useAuthStore.getState()
      expect(state.isLoading).toBe(true)
    })
  })

  describe('setUser', () => {
    it('should set user and update isAuthenticated', () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        role: 'admin',
      }

      useAuthStore.getState().setUser(mockUser)
      
      const state = useAuthStore.getState()
      expect(state.user).toEqual(mockUser)
      expect(state.isAuthenticated).toBe(true)
    })
  })

  describe('login', () => {
    it('should set user and authentication state', () => {
      const mockUser = {
        id: '2',
        email: 'user@example.com',
        name: 'Login User',
        role: 'user',
      }

      useAuthStore.getState().login(mockUser)
      
      const state = useAuthStore.getState()
      expect(state.user).toEqual(mockUser)
      expect(state.isAuthenticated).toBe(true)
      expect(state.isLoading).toBe(false)
    })
  })

  describe('logout', () => {
    it('should clear user and set isAuthenticated to false', () => {
      // First login
      useAuthStore.getState().login({
        id: '3',
        email: 'logout@example.com',
        name: 'Logout User',
        role: 'user',
      })

      // Then logout
      useAuthStore.getState().logout()
      
      const state = useAuthStore.getState()
      expect(state.user).toBeNull()
      expect(state.isAuthenticated).toBe(false)
      expect(state.isLoading).toBe(false)
    })
  })

  describe('setLoading', () => {
    it('should set loading state', () => {
      useAuthStore.getState().setLoading(true)
      expect(useAuthStore.getState().isLoading).toBe(true)

      useAuthStore.getState().setLoading(false)
      expect(useAuthStore.getState().isLoading).toBe(false)
    })
  })
})
