/**
 * Next.js Route Handler - Streaming Control
 * POST /api/v1/streaming/channels/[id]/on-air
 * POST /api/v1/streaming/channels/[id]/off-air
 * GET /api/v1/streaming/channels/[id]/status
 */

import { NextRequest, NextResponse } from 'next/server';

const BACKEND_API_URL = process.env.BACKEND_API_URL || 'http://localhost:8001/api/v1';

type StreamingAction = 'on-air' | 'off-air' | 'status';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; action: string }> }
) {
  try {
    const authHeader = request.headers.get('authorization');
    const { id, action } = await params as { id: string; action: StreamingAction };

    const endpoint = action === 'on-air' ? 'on-air' : 'off-air';

    const response = await fetch(`${BACKEND_API_URL}/streaming/channels/${id}/${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(authHeader && { 'Authorization': authHeader }),
      },
    });

    const data = await response.json();

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Streaming control proxy error:', error);
    return NextResponse.json(
      { status: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; action: string }> }
) {
  try {
    const authHeader = request.headers.get('authorization');
    const { id } = await params;

    const response = await fetch(`${BACKEND_API_URL}/streaming/channels/${id}/status`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(authHeader && { 'Authorization': authHeader }),
      },
    });

    const data = await response.json();

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Streaming status proxy error:', error);
    return NextResponse.json(
      { status: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
