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
    accessToken,
    isAuthenticated,
    isLoading,
    setUser,
    setAccessToken,
    login,
    logout,
    setLoading,
  } = useAuthStore();

  /**
   * Login with credentials
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
        
        // Backend returns tokens but NOT user data
        // We need to call /auth/me to get user
        const access_token = data.access_token;
        const refresh_token = data.refresh_token;
        
        console.log('✅ Tokens received:');
        console.log('🎫 Access token:', !!access_token);
        console.log('🔄 Refresh token:', !!refresh_token);
        
        if (!access_token) {
          console.error('❌ Access token is missing!');
          toast.error('Login failed: No access token received');
          return false;
        }
        
        // Save tokens first
        if (typeof window !== 'undefined') {
          localStorage.setItem('access_token', access_token);
          localStorage.setItem('refresh_token', refresh_token);
          console.log('💾 Tokens saved to localStorage');
        }
        
        // Now fetch user data with the new token
        console.log('🔍 Fetching user data with new token...');
        try {
          const userResponse = await authService.getCurrentUser();
          console.log('👤 User response:', userResponse);
          
          if (userResponse.status && userResponse.data) {
            const userData = userResponse.data;
            console.log('✅ User data received:', userData);
            
            // Now we have everything - call login action
            login(userData, access_token, refresh_token);
            toast.success('Login successful');
            console.log('✅ Auth state complete, returning true');
            return true;
          } else {
            console.error('❌ Failed to get user data');
            toast.error('Login failed: Could not fetch user profile');
            // Clear tokens on failure
            if (typeof window !== 'undefined') {
              localStorage.removeItem('access_token');
              localStorage.removeItem('refresh_token');
            }
            return false;
          }
        } catch (error) {
          console.error('💥 Error fetching user:', error);
          toast.error('Login failed: Could not fetch user profile');
          // Clear tokens on failure
          if (typeof window !== 'undefined') {
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
          }
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
   * Logout
   */
  const logoutAction = () => {
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
      // Clear the corrupted state
      logout();
      // Continue to check for token and re-authenticate
    }
    
    // If already authenticated with user data, skip fetch
    if (isAuthenticated && user) {
      console.log('✅ Already authenticated with user data, skipping fetch');
      setLoading(false);
      return;
    }
    
    const token = authService.getAccessToken();
    console.log('🎫 Token from localStorage:', !!token);
    
    if (!token) {
      console.log('❌ No token found, setting isLoading = false');
      setLoading(false);
      return;
    }

    try {
      console.log('🌐 Fetching user from /auth/me...');
      const response = await authService.getCurrentUser();
      console.log('👤 Get current user response:', response);
      
      if (response.status) {
        console.log('✅ User authenticated:', response.data);
        setUser(response.data);
        setAccessToken(token);
      } else {
        console.log('❌ Invalid token, logging out');
        logout();
      }
    } catch (error) {
      console.error('💥 Error fetching user:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    accessToken,
    isAuthenticated,
    isLoading,
    login: loginAction,
    register: registerAction,
    logout: logoutAction,
    checkAuth,
    setLoading,
  };
}
