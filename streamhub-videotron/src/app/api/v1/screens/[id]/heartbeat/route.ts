/**
 * Screen Heartbeat API Route Handler
 * POST /api/v1/screens/[id]/heartbeat - Send heartbeat for screen
 */

import { NextRequest, NextResponse } from 'next/server';

// Backend base URL (without /api/v1)
const BACKEND_BASE_URL = process.env.BACKEND_API_URL || 'http://localhost:8001';

// POST heartbeat
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const response = await fetch(`${BACKEND_BASE_URL}/api/v1/screens/${id}/heartbeat/`, {
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
    console.error('Heartbeat POST error:', error);
    return NextResponse.json(
      { status: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
