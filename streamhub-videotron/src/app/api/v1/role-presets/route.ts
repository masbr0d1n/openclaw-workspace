/**
 * Role Presets API Routes
 * Proxy to backend FastAPI role presets endpoints
 */

import { NextRequest, NextResponse } from 'next/server';

const BACKEND_API_URL = process.env.BACKEND_API_URL || 'http://host.docker.internal:8001/api/v1';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader) {
      return NextResponse.json(
        { status: false, statusCode: 401, error: 'Unauthorized', message: 'No authorization header' },
        { status: 401 }
      );
    }

    const url = new URL(request.url);
    const includeInactive = url.searchParams.get('include_inactive') === 'true';

    // Proxy to backend - NOTE: backend requires trailing slash
    const backendUrl = `${BACKEND_API_URL}/role-presets/${includeInactive ? '?include_inactive=true' : ''}`;
    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    return NextResponse.json(data, { status: response.status });
  } catch (error: any) {
    console.error('Role Presets API Error:', error);
    return NextResponse.json(
      { 
        status: false, 
        statusCode: 500, 
        error: 'InternalServerError', 
        message: error.message || 'Failed to fetch role presets' 
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader) {
      return NextResponse.json(
        { status: false, statusCode: 401, error: 'Unauthorized', message: 'No authorization header' },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Proxy to backend - NOTE: backend requires trailing slash
    const response = await fetch(`${BACKEND_API_URL}/role-presets/`, {
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
    console.error('Role Presets API Error:', error);
    return NextResponse.json(
      { 
        status: false, 
        statusCode: 500, 
        error: 'InternalServerError', 
        message: error.message || 'Failed to create role preset' 
      },
      { status: 500 }
    );
  }
}
