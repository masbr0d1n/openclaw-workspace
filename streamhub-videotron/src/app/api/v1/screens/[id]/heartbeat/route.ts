/**
 * Screen Heartbeat API Route Handler
 * POST /api/v1/screens/[id]/heartbeat - Send heartbeat for screen
 */

import { NextRequest, NextResponse } from 'next/server';

// Backend API URL (already includes /api/v1)
const BACKEND_API_URL = process.env.BACKEND_API_URL || 'http://localhost:8001/api/v1';

// POST heartbeat
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Forward cookies from client request
    const cookieHeader = request.headers.get('cookie') || '';
    
    const response = await fetch(`${BACKEND_API_URL}/screens/${id}/heartbeat`, {
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
    console.error('Heartbeat POST error:', error);
    return NextResponse.json(
      { status: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
