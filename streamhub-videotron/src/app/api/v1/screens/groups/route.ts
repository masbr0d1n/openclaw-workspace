/**
 * Screen Groups API Route Handler
 * GET /api/v1/screens/groups - Get all screen groups
 * POST /api/v1/screens/groups - Create new screen group
 */

import { NextRequest, NextResponse } from 'next/server';

// Backend base URL (without /api/v1)
const BACKEND_BASE_URL = process.env.BACKEND_API_URL || 'http://localhost:8001';

// GET all screen groups
export async function GET(request: NextRequest) {
  try {
    const response = await fetch(`${BACKEND_BASE_URL}/api/v1/screens/groups/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': request.headers.get('Authorization') || '',
      },
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Screen Groups GET error:', error);
    return NextResponse.json(
      { status: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST create screen group
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const response = await fetch(`${BACKEND_BASE_URL}/api/v1/screens/groups/`, {
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
    console.error('Screen Group POST error:', error);
    return NextResponse.json(
      { status: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
