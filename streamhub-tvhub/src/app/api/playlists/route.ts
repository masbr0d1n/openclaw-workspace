import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// GET /api/playlists - Get all playlists
export async function GET(request: NextRequest) {
  try {
    const backendUrl = process.env.BACKEND_API_URL || 'http://192.168.8.117:8001/api/v1';
    const url = `${backendUrl}/playlists/`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Backend error' }));
      return NextResponse.json(error, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { status: false, statusCode: 500, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/playlists - Create playlist
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const backendUrl = process.env.BACKEND_API_URL || 'http://192.168.8.117:8001/api/v1';
    
    // Determine if this is a draft or publish
    const isDraft = body.draft === true;
    const endpoint = isDraft ? `${backendUrl}/playlists/draft` : `${backendUrl}/playlists/`;

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Backend error' }));
      return NextResponse.json(error, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { status: false, statusCode: 500, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
