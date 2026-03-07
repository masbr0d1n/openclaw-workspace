import { NextRequest, NextResponse } from 'next/server';

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Only proxy API requests
  if (!pathname.startsWith('/api/v1/')) {
    return NextResponse.next();
  }
  
  // Backend API URL
  const backendUrl = process.env.BACKEND_API_URL || 'http://localhost:8001';
  
  // Create new URL for backend, preserving the exact path including trailing slashes
  const url = new URL(pathname, backendUrl);
  url.search = request.nextUrl.search;
  
  // Forward the request to backend
  return fetch(url.toString(), {
    method: request.method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': request.headers.get('Authorization') || '',
    },
    body: request.method !== 'GET' && request.method !== 'HEAD' ? request.body : undefined,
  }).then(response => {
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
    });
  }).catch(error => {
    console.error('Proxy error:', error);
    return NextResponse.json(
      { status: false, message: 'Backend unavailable' },
      { status: 500 }
    );
  });
}

export const config = {
  matcher: '/api/v1/:path*',
};
