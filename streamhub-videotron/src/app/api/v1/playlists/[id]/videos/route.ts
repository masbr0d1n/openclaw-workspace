/**
 * Playlist Videos API Routes
 * PUT /api/v1/playlists/[id]/videos - Update playlist videos order
 */

import { NextRequest, NextResponse } from 'next/server';

const BACKEND_API_URL = process.env.BACKEND_API_URL || 'http://localhost:8001/api/v1';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // Forward cookies from client request
    const cookieHeader = request.headers.get('cookie') || '';
        const body = await request.json();
    
    // Proxy to backend - NOTE: backend requires trailing slash
    const response = await fetch(`${BACKEND_API_URL}/playlists/${id}/videos/`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookieHeader,
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    return NextResponse.json(data, { status: response.status });
  } catch (error: any) {
    console.error('Playlist Videos API Error:', error);
    return NextResponse.json(
      { 
        status: false, 
        statusCode: 500, 
        error: 'InternalServerError', 
        message: error.message || 'Failed to update playlist videos' 
      },
      { status: 500 }
    );
  }
}
