/**
 * Role Preset by ID API Routes
 * GET, PUT, DELETE /api/v1/role-presets/[id]
 */

import { NextRequest, NextResponse } from 'next/server';

const BACKEND_API_URL = process.env.BACKEND_API_URL || 'http://localhost:8001/api/v1';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // Forward cookies from client request
    const cookieHeader = request.headers.get('cookie') || '';
        const response = await fetch(`${BACKEND_API_URL}/role-presets/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookieHeader,
      },
    });

    const data = await response.json();

    return NextResponse.json(data, { status: response.status });
  } catch (error: any) {
    console.error('Role Preset API Error:', error);
    return NextResponse.json(
      { 
        status: false, 
        statusCode: 500, 
        error: 'InternalServerError', 
        message: error.message || 'Failed to fetch role preset' 
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // Forward cookies from client request
    const cookieHeader = request.headers.get('cookie') || '';
        const body = await request.json();

    const response = await fetch(`${BACKEND_API_URL}/role-presets/${id}/`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookieHeader,
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    return NextResponse.json(data, { status: response.status });
  } catch (error: any) {
    console.error('Role Preset Update API Error:', error);
    return NextResponse.json(
      { 
        status: false, 
        statusCode: 500, 
        error: 'InternalServerError', 
        message: error.message || 'Failed to update role preset' 
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // Forward cookies from client request
    const cookieHeader = request.headers.get('cookie') || '';
        const response = await fetch(`${BACKEND_API_URL}/role-presets/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookieHeader,
      },
    });

    const data = await response.json();

    return NextResponse.json(data, { status: response.status });
  } catch (error: any) {
    console.error('Role Preset Delete API Error:', error);
    return NextResponse.json(
      { 
        status: false, 
        statusCode: 500, 
        error: 'InternalServerError', 
        message: error.message || 'Failed to delete role preset' 
      },
      { status: 500 }
    );
  }
}
