/**
 * Middleware - DISABLED
 *
 * We handle authentication on the client side using:
 * - Zustand store (in-memory, no persistence)
 * - httpOnly cookies for token storage (set by backend)
 * - Dashboard layout auth check
 * - AuthChecker component
 *
 * Server-side middleware is not needed because:
 * - httpOnly cookies are automatically sent with requests (withCredentials: true)
 * - Backend validates cookies and sets them on login/refresh
 * - Client-side auth is sufficient for our use case
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
