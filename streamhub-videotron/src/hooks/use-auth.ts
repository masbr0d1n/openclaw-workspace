/**
 * Auth Hook - FIXED Destructuring
 */

import { useAuthStore } from '@/stores/auth.store';
import { authService } from '@/services';
import type { LoginInput, RegisterInput } from '@/types';
import { toast } from 'sonner';

export function useAuth() {
  const {
    user,
    isAuthenticated,
    isLoading,
    setUser,
    login,
    logout,
    setLoading,
  } = useAuthStore();

  /**
   * Login with credentials
   * Tokens are handled by httpOnly cookies (backend-managed)
   */
  const loginAction = async (credentials: LoginInput) => {
    console.log('🔐 Login attempt:', credentials.username);
    setLoading(true);
    
    try {
      const response = await authService.login(credentials);
      console.log('📦 Full login response:', response);
      
      if (response.status) {
        const data = response.data;
        console.log('📦 Auth response data:', data);
        
        // Backend returns user data and sets httpOnly cookies for tokens
        const user = data.user;
        
        console.log('🎫 Cookies set by backend (httpOnly)');
        console.log('👤 User data:', user);
        
        if (!user) {
          console.error('❌ User data is missing!');
          toast.error('Login failed: No user data received');
          return false;
        }
        
        // Now fetch user data to verify cookies are working
        console.log('🔍 Verifying auth with /auth/me...');
        try {
          const userResponse = await authService.getCurrentUser();
          console.log('👤 User response:', userResponse);
          
          if (userResponse.status && userResponse.data) {
            const userData = userResponse.data;
            console.log('✅ User data verified:', userData);
            
            // Call login action with user data only (no tokens)
            login(userData);
            toast.success('Login successful');
            console.log('✅ Auth state complete, returning true');
            return true;
          } else {
            console.error('❌ Failed to verify user data');
            toast.error('Login failed: Could not verify authentication');
            return false;
          }
        } catch (error) {
          console.error('💥 Error verifying user:', error);
          toast.error('Login failed: Could not verify authentication');
          return false;
        }
      } else {
        console.log('❌ Login failed:', response.message);
        toast.error(response.message || 'Login failed');
        return false;
      }
    } catch (error: any) {
      console.error('💥 Login error:', error);
      console.error('💥 Error response:', error.response?.data);
      const message = error.response?.data?.message || 'Login failed';
      toast.error(message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Register new user
   */
  const registerAction = async (data: RegisterInput) => {
    setLoading(true);
    try {
      const response = await authService.register(data);
      
      if (response.status) {
        toast.success('Registration successful');
        return true;
      } else {
        toast.error(response.message || 'Registration failed');
        return false;
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Registration failed';
      toast.error(message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Logout - calls backend to clear cookies, then clears local state
   */
  const logoutAction = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
      // Continue with client-side logout even if backend call fails
    }
    logout();
    toast.success('Logged out successfully');
  };

  /**
   * Check authentication status on mount
   * Only fetch if not already authenticated
   */
  const checkAuth = async () => {
    console.log('🔍 Checking auth...');
    console.log('  Current state:', { isAuthenticated, user: !!user, isLoading });
    
    // DETECT AND FIX INCONSISTENT STATE
    // If isAuthenticated=true but user=null, this is a corrupted state
    if (isAuthenticated && !user) {
      console.warn('⚠️ DETECTED INCONSISTENT STATE: isAuthenticated=true but user=null');
      console.warn('⚠️ Clearing corrupted auth state and re-authenticating...');
      // Clear the corrupted state - logout sets isLoading=false
      logout();
      // Continue to check auth and re-authenticate
    }
    
    // If already authenticated with user data, skip fetch
    if (isAuthenticated && user) {
      console.log('✅ Already authenticated with user data, skipping fetch');
      setLoading(false);
      return;
    }
    
    // No token check needed - cookies are automatically sent
    // Just try to fetch user data
    try {
      console.log('🌐 Fetching user from /auth/me...');
      const response = await authService.getCurrentUser();
      console.log('👤 Get current user response:', response);
      
      if (response.status) {
        console.log('✅ User authenticated:', response.data);
        setUser(response.data);
      } else {
        console.log('❌ Not authenticated, logging out');
        logout();
      }
    } catch (error) {
      console.error('💥 Error fetching user:', error);
      logout();
    } finally {
      // CRITICAL: Always ensure isLoading is set to false
      // This prevents infinite loading loops
      console.log('🏁 checkAuth finally block - setting isLoading=false');
      setLoading(false);
    }
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    login: loginAction,
    register: registerAction,
    logout: logoutAction,
    checkAuth,
    setLoading,
  };
}
