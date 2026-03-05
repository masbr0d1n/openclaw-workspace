/**
 * Next.js API Route - Proxy for Video File Serving
 * GET /api/videos/file/[...path] - Serve video files via proxy
 */

import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path } = await params;
    const videoPath = '/' + path.join('/');
    
    // Backend API URL (e.g., http://localhost:8001/api/v1)
    // videoPath is like: /uploads/videos/filename.mp4
    const backendApiUrl = process.env.BACKEND_API_URL || 'http://localhost:8001/api/v1';
    const backendBaseUrl = backendApiUrl.replace('/api/v1', '');
    const url = `${backendBaseUrl}${videoPath}`;
    
    console.log('Video proxy fetching:', url);

    // Fetch from backend
    const response = await fetch(url, {
      method: 'GET',
    });

    if (!response.ok) {
      console.error('Video proxy error:', response.status, response.statusText);
      return NextResponse.json(
        { status: false, statusCode: response.status, message: 'Video file not found' },
        { status: response.status }
      );
    }

    // Get file content and headers
    const contentType = response.headers.get('content-type') || 'video/mp4';
    const contentLength = response.headers.get('content-length');
    const fileBuffer = await response.arrayBuffer();

    // Return file with proper headers
    const headers = new Headers();
    headers.set('Content-Type', contentType);
    headers.set('Content-Length', contentLength || '0');
    headers.set('Accept-Ranges', 'bytes');
    headers.set('Cache-Control', 'public, max-age=31536000, immutable');

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: headers,
    });
  } catch (error: any) {
    console.error('Video file proxy error:', error);
    return NextResponse.json(
      { status: false, statusCode: 500, message: 'Failed to serve video file' },
      { status: 500 }
    );
  }
}
