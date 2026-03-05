/**
 * Next.js API Route - Proxy for Video Upload
 * POST /api/videos/upload - Upload video to backend
 */

import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    // Get form data from request
    const formData = await request.formData();

    // Backend URL
    const backendUrl = process.env.BACKEND_API_URL || 'http://localhost:8001/api/v1';
    const url = `${backendUrl}/videos/upload`;

    // Forward form data to backend
    const response = await fetch(url, {
      method: 'POST',
      body: formData, // FormData automatically forwarded
      // Don't set Content-Type header, let browser set it with boundary
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Upload failed' }));
      return NextResponse.json(
        { status: false, statusCode: response.status, message: error.message || 'Failed to upload video' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data, { status: 201 });
  } catch (error: any) {
    console.error('Video upload API proxy error:', error);
    return NextResponse.json(
      { status: false, statusCode: 500, message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
