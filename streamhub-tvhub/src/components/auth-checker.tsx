/**
 * Auth Checker Component
 * Runs authentication check on app mount
 * Waits for checkAuth to complete before showing content
 */

'use client';

import { useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/use-auth';

export function AuthChecker() {
  const { checkAuth, isAuthenticated, user } = useAuth();
  const hasChecked = useRef(false);

  useEffect(() => {
    // Only check once on app mount
    if (!hasChecked.current) {
      console.log('🔐 AuthChecker: First mount, checking auth...');
      hasChecked.current = true;
      checkAuth();
    } else {
      console.log('🔐 AuthChecker: Already checked, skipping...');
    }
  }, []);

  // Log auth state changes
  useEffect(() => {
    console.log('🔐 AuthChecker: Auth state changed');
    console.log('  - isAuthenticated:', isAuthenticated);
    console.log('  - user:', user);
  }, [isAuthenticated, user]);

  // This component doesn't render anything
  // It just ensures checkAuth is called once on app mount
  return null;
}
