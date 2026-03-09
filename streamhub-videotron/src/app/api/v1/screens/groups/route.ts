/**
 * Screen Groups API Route Handler
 * GET /api/v1/screens/groups - Get all screen groups
 * POST /api/v1/screens/groups - Create new screen group
 */

import { NextRequest, NextResponse } from 'next/server';

// Backend API URL (already includes /api/v1)
const BACKEND_API_URL = process.env.BACKEND_API_URL || 'http://localhost:8001/api/v1';

// GET all screen groups
export async function GET(request: NextRequest) {
  try {
    // Forward cookies from client request
    const cookieHeader = request.headers.get('cookie') || '';
    
    const response = await fetch(`${BACKEND_API_URL}/screens/groups`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookieHeader,
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

    // Forward cookies from client request
    const cookieHeader = request.headers.get('cookie') || '';

    const response = await fetch(`${BACKEND_API_URL}/screens/groups`, {
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
    console.error('Screen Group POST error:', error);
    return NextResponse.json(
      { status: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
