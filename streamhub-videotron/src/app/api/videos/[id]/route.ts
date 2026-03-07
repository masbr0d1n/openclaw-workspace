/**
 * Next.js API Route - Proxy for Single Video
 * GET /api/videos/[id] - Get video by ID
 * PUT /api/videos/[id] - Update video
 * DELETE /api/videos/[id] - Delete video
 */

import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: videoId } = await params;

    // Backend URL
    const backendUrl = process.env.BACKEND_API_URL || 'http://localhost:8001/api/v1';
    const url = `${backendUrl}/videos/${videoId}`;

    // Fetch from backend
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Backend error' }));
      return NextResponse.json(
        { status: false, statusCode: response.status, message: error.message || 'Failed to fetch video' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Video detail API proxy error:', error);
    return NextResponse.json(
      { status: false, statusCode: 500, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: videoId } = await params;
    const body = await request.json();

    // Backend URL
    const backendUrl = process.env.BACKEND_API_URL || 'http://localhost:8001/api/v1';
    const url = `${backendUrl}/videos/${videoId}`;

    // Update in backend
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Backend error' }));
      return NextResponse.json(
        { status: false, statusCode: response.status, message: error.message || 'Failed to update video' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Video update API proxy error:', error);
    return NextResponse.json(
      { status: false, statusCode: 500, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: videoId } = await params;

    // Backend URL
    const backendUrl = process.env.BACKEND_API_URL || 'http://localhost:8001/api/v1';
    const url = `${backendUrl}/videos/${videoId}`;

    // Delete from backend
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Backend error' }));
      return NextResponse.json(
        { status: false, statusCode: response.status, message: error.message || 'Failed to delete video' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Video delete API proxy error:', error);
    return NextResponse.json(
      { status: false, statusCode: 500, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
