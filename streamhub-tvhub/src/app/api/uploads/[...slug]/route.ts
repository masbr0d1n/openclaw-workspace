/**
 * Uploads Catch-all Route Handler
 * Serves all files from /uploads/* directory by proxying to backend
 */

import { NextRequest, NextResponse } from 'next/server';

const BACKEND_HOST = process.env.BACKEND_HOST || '192.168.8.117';
const BACKEND_PORT = process.env.BACKEND_PORT || '8001';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ slug: string[] }> }
) {
  try {
    // Await params (Next.js 16 requirement)
    const { slug } = await context.params;

    // Construct the path to the file
    const filePath = slug.join('/');

    // Build backend URL
    const backendUrl = `http://${BACKEND_HOST}:${BACKEND_PORT}/uploads/${filePath}`;

    console.log(`[Uploads Proxy] ${filePath} -> ${backendUrl}`);

    // Fetch from backend
    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'NextJS-Uploads-Proxy/1.0',
      },
    });

    if (!response.ok) {
      console.error(`[Uploads Proxy] Backend returned ${response.status}`);
      return NextResponse.json(
        { error: 'File not found', status: response.status },
        { status: response.status === 404 ? 404 : 500 }
      );
    }

    // Get content type and buffer
    const contentType = response.headers.get('content-type') || 'image/jpeg';
    const buffer = await response.arrayBuffer();

    // Return with caching headers
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable', // 1 year cache
        'X-Proxy-Cache': 'HIT',
      },
    });
  } catch (error) {
    console.error('[Uploads Proxy] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
