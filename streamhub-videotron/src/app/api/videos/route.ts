/**
 * Next.js API Route - Proxy for Videos List
 * GET /api/videos - Get all videos from backend
 * FIXED: Remove trailing slash to prevent 308 redirect
 */

import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const queryParams = new URLSearchParams();

    // Forward query params
    const skip = searchParams.get('skip');
    const limit = searchParams.get('limit');
    const channel_id = searchParams.get('channel_id');
    const is_active = searchParams.get('is_active');
    const category = searchParams.get('category');
    const search = searchParams.get('search');

    if (skip) queryParams.append('skip', skip);
    if (limit) queryParams.append('limit', limit);
    if (channel_id) queryParams.append('channel_id', channel_id);
    if (is_active) queryParams.append('is_active', is_active);
    if (category) queryParams.append('category', category);
    if (search) queryParams.append('search', search);

    // Backend URL - NO trailing slash!
    const backendUrl = process.env.BACKEND_API_URL || 'http://localhost:8001/api/v1';
    const url = `${backendUrl}/videos?${queryParams.toString()}`;

    console.log('Fetching from backend:', url);

    // Fetch from backend
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Backend error' }));
      console.error('Backend error:', error);
      return NextResponse.json(
        { status: false, statusCode: response.status, message: error.message || 'Failed to fetch videos' },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('Videos fetched:', data.data?.length || 0);
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Videos API proxy error:', error);
    return NextResponse.json(
      { status: false, statusCode: 500, message: 'Internal server error', error: error.message },
      { status: 500 }
    );
  }
}
