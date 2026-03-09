/**
 * Screens API Route Handler
 * GET /api/v1/screens - Get all screens
 * POST /api/v1/screens - Create new screen
 */

import { NextRequest, NextResponse } from 'next/server';

// Backend API URL (already includes /api/v1)
const BACKEND_API_URL = process.env.BACKEND_API_URL || 'http://localhost:8001/api/v1';

// GET all screens
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const queryParams = new URLSearchParams();
    
    // Forward query parameters
    searchParams.forEach((value, key) => {
      queryParams.append(key, value);
    });

    const queryString = queryParams.toString();
    const url = `${BACKEND_API_URL}/screens${queryString ? `?${queryString}` : ''}`;
    console.log('[Screens API] GET:', url);

    // Forward cookies from client request
    const cookieHeader = request.headers.get('cookie') || '';
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookieHeader,
      },
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Screens GET error:', error);
    return NextResponse.json(
      { status: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST create screen
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Forward cookies from client request
    const cookieHeader = request.headers.get('cookie') || '';
    
    const response = await fetch(`${BACKEND_API_URL}/screens`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookieHeader,
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Screen POST error:', error);
    return NextResponse.json(
      { status: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
