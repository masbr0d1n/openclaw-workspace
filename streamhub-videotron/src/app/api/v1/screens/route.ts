/**
 * Screens API Route Handler
 * GET /api/v1/screens - Get all screens
 * POST /api/v1/screens - Create new screen
 */

import { NextRequest, NextResponse } from 'next/server';

// Backend base URL (without /api/v1)
const BACKEND_BASE_URL = process.env.BACKEND_API_URL || 'http://localhost:8001';

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
    // Backend requires /api/v1/ prefix and trailing slash
    const url = `${BACKEND_BASE_URL}/api/v1/screens/${queryString ? `?${queryString}` : ''}`;
    console.log('[Screens API] GET:', url);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': request.headers.get('Authorization') || '',
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

    const response = await fetch(`${BACKEND_BASE_URL}/api/v1/screens/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': request.headers.get('Authorization') || '',
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
