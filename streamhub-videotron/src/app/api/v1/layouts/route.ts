/**
 * Layouts API Routes
 * Proxy to backend FastAPI layouts endpoints
 * 
 * SECURITY: Forwards cookies from client to backend (httpOnly JWT tokens)
 */

import { NextRequest, NextResponse } from 'next/server';

const BACKEND_API_URL = process.env.BACKEND_API_URL || 'http://localhost:8001/api/v1';

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const params = new URLSearchParams();
    
    // Forward query parameters
    url.searchParams.forEach((value, key) => {
      params.append(key, value);
    });

    const queryString = params.toString();
    const backendUrl = `${BACKEND_API_URL}/layouts/${queryString ? `?${queryString}` : ''}`;
    
    // Forward cookies from client request
    const cookieHeader = request.headers.get('cookie') || '';
    
    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookieHeader,
      },
    });

    const data = await response.json();

    return NextResponse.json(data, { status: response.status });
  } catch (error: any) {
    console.error('Layouts API Error:', error);
    return NextResponse.json(
      { 
        status: false, 
        statusCode: 500, 
        error: 'InternalServerError', 
        message: error.message || 'Failed to fetch layouts' 
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Forward cookies from client request
    const cookieHeader = request.headers.get('cookie') || '';

    const response = await fetch(`${BACKEND_API_URL}/layouts/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookieHeader,
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    return NextResponse.json(data, { status: response.status });
  } catch (error: any) {
    console.error('Layouts API Error:', error);
    return NextResponse.json(
      { 
        status: false, 
        statusCode: 500, 
        error: 'InternalServerError', 
        message: error.message || 'Failed to create layout' 
      },
      { status: 500 }
    );
  }
}
