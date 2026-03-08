/**
 * Middleware - DISABLED
 *
 * We handle authentication on the client side using:
 * - Zustand store with persistence
 * - Dashboard layout auth check
 * - AuthChecker component
 *
 * SECURITY: JWT tokens are stored in httpOnly cookies (backend-managed)
 * Server-side middleware could be enabled in the future to validate cookies
 * For now, client-side auth is sufficient for our use case
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Middleware is disabled - all auth is handled client-side
  // Just let all requests pass through
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths
     * Auth is handled client-side in dashboard layout
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
