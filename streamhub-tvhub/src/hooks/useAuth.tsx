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
    // User data is managed by auth store, not localStorage
    // httpOnly cookies handle token storage
    setLoading(false);
  }, []);

  return { user, loading };
}
