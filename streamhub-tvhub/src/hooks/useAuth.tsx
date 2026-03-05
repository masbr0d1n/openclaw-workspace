/**
 * Authentication Hook
 */

'use client';

import { useState, useEffect } from 'react';
import { UserRole } from '@/lib/rbac';

export interface AuthUser {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  loginCategory: 'tv_channel' | 'videotron';
  tenantId?: string;
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check localStorage for user data
    const authData = localStorage.getItem('auth_user');
    if (authData) {
      try {
        setUser(JSON.parse(authData));
      } catch (error) {
        console.error('Failed to parse auth data:', error);
      }
    }
    setLoading(false);
  }, []);

  return { user, loading };
}
