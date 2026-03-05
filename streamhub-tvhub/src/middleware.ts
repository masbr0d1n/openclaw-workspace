/**
 * Middleware - DISABLED
 *
 * We handle authentication on the client side using:
 * - Zustand store with localStorage persistence
 * - Dashboard layout auth check
 * - AuthChecker component
 *
 * Server-side middleware is not needed and causes issues because:
 * - It can't access localStorage (only cookies)
 * - We store tokens in localStorage, not cookies
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
