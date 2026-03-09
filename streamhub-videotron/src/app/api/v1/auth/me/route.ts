import { NextRequest, NextResponse } from 'next/server'

const BACKEND_API_URL = process.env.BACKEND_API_URL || 'http://localhost:8001/api/v1'

export async function GET(request: NextRequest) {
  try {
    // Forward cookies to backend
    const cookieHeader = request.headers.get('cookie') || ''
    
    const response = await fetch(`${BACKEND_API_URL}/auth/me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookieHeader,
      },
    })
    
    const data = await response.json()
    
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    return NextResponse.json(
      { status: false, message: 'Not authenticated' },
      { status: 401 }
    )
  }
}