/**
 * Playlist API Route Handler
 * GET /api/v1/playlists - Get all playlists
 * POST /api/v1/playlists - Create new playlist
 */

import { NextRequest, NextResponse } from 'next/server';

const BACKEND_API_URL = process.env.BACKEND_API_URL || 'http://localhost:8001/api/v1';

// GET all playlists
export async function GET(request: NextRequest) {
  try {
    // Forward cookies from client request
    const cookieHeader = request.headers.get('cookie') || '';
    
    const response = await fetch(`${BACKEND_API_URL}/playlists`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookieHeader,
      },
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Playlists GET error:', error);
    return NextResponse.json(
      { status: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST create playlist
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Forward cookies from client request
    const cookieHeader = request.headers.get('cookie') || '';

    const response = await fetch(`${BACKEND_API_URL}/playlists`, {
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
    console.error('Playlist POST error:', error);
    return NextResponse.json(
      { status: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
