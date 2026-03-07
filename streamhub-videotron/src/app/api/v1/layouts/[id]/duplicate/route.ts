/**
 * Layout Duplicate API Route
 * POST /api/v1/layouts/[id]/duplicate
 */

import { NextRequest, NextResponse } from 'next/server';

const BACKEND_API_URL = process.env.BACKEND_API_URL || 'http://host.docker.internal:8001/api/v1';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader) {
      return NextResponse.json(
        { status: false, statusCode: 401, error: 'Unauthorized', message: 'No authorization header' },
        { status: 401 }
      );
    }

    const body = await request.json().catch(() => ({}));

    const response = await fetch(`${BACKEND_API_URL}/layouts/${id}/duplicate`, {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    return NextResponse.json(data, { status: response.status });
  } catch (error: any) {
    console.error('Layout Duplicate API Error:', error);
    return NextResponse.json(
      { 
        status: false, 
        statusCode: 500, 
        error: 'InternalServerError', 
        message: error.message || 'Failed to duplicate layout' 
      },
      { status: 500 }
    );
  }
}
