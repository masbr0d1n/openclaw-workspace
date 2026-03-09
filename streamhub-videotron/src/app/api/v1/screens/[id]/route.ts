/**
 * Screen API Route Handler
 * GET /api/v1/screens/[id] - Get screen by ID
 * PUT /api/v1/screens/[id] - Update screen
 * DELETE /api/v1/screens/[id] - Delete screen
 */

import { NextRequest, NextResponse } from 'next/server';

// Backend API URL (already includes /api/v1)
const BACKEND_API_URL = process.env.BACKEND_API_URL || 'http://localhost:8001/api/v1';

// GET screen by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Forward cookies from client request
    const cookieHeader = request.headers.get('cookie') || '';
    
    const response = await fetch(`${BACKEND_API_URL}/screens/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookieHeader,
      },
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Screen GET error:', error);
    return NextResponse.json(
      { status: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT update screen
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Forward cookies from client request
    const cookieHeader = request.headers.get('cookie') || '';

    const response = await fetch(`${BACKEND_API_URL}/screens/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookieHeader,
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Screen PUT error:', error);
    return NextResponse.json(
      { status: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE screen
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Forward cookies from client request
    const cookieHeader = request.headers.get('cookie') || '';

    const response = await fetch(`${BACKEND_API_URL}/screens/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookieHeader,
      },
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Screen DELETE error:', error);
    return NextResponse.json(
      { status: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
