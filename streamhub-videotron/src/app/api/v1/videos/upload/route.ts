import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const title = formData.get('title') as string;
    const file = formData.get('file') as File;
    const channelId = formData.get('channel_id') as string;
    const description = formData.get('description') as string | null;

    // Validate required fields
    if (!title || !file || !channelId) {
      return NextResponse.json(
        { status: false, message: 'Missing required fields: title, file, channel_id' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.name.endsWith('.mp4')) {
      return NextResponse.json(
        { status: false, message: 'Only MP4 files are allowed' },
        { status: 400 }
      );
    }

    // Prepare multipart form data for backend
    const backendFormData = new FormData();
    backendFormData.append('title', title);
    backendFormData.append('file', file);
    backendFormData.append('channel_id', channelId);
    if (description) {
      backendFormData.append('description', description);
    }

    // Get access token from Authorization header
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    // Forward to backend
    const backendUrl = process.env.BACKEND_API_URL || 'http://host.docker.internal:8001/api/v1';
    const response = await fetch(`${backendUrl}/videos/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: backendFormData,
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { status: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
