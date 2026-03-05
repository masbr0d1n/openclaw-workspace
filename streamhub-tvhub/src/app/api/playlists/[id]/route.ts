import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// GET /api/playlists/[id] - Get playlist by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const backendUrl = process.env.BACKEND_API_URL || 'http://192.168.8.117:8001/api/v1';
    const url = `${backendUrl}/playlists/${id}`;

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

// PUT /api/playlists/[id] - Update playlist
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const backendUrl = process.env.BACKEND_API_URL || 'http://192.168.8.117:8001/api/v1';
    const url = `${backendUrl}/playlists/${id}`;

    const response = await fetch(url, {
      method: 'PUT',
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

// DELETE /api/playlists/[id] - Delete playlist
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const backendUrl = process.env.BACKEND_API_URL || 'http://192.168.8.117:8001/api/v1';
    const url = `${backendUrl}/playlists/${id}`;

    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // 204 No Content has no body - don't try to parse JSON
    if (response.status === 204) {
      return new NextResponse(null, { status: 204 });
    }

    // For other status codes, parse and return the response
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error: any) {
    return NextResponse.json(
      { status: false, statusCode: 500, message: 'Internal server error', error: error.message },
      { status: 500 }
    );
  }
}
