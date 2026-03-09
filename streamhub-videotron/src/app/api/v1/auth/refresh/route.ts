import { NextRequest, NextResponse } from 'next/server'

const BACKEND_API_URL = process.env.BACKEND_API_URL || 'http://localhost:8001/api/v1'

export async function POST(request: NextRequest) {
  try {
    // Forward cookies to backend
    const cookieHeader = request.headers.get('cookie') || ''
    
    const response = await fetch(`${BACKEND_API_URL}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookieHeader,
      },
    })
    
    const data = await response.json()
    
    const nextResponse = NextResponse.json(data, { status: response.status })
    
    // Forward new cookies from backend
    const setCookies = response.headers.getSetCookie()
    setCookies.forEach(cookie => {
      nextResponse.headers.append('Set-Cookie', cookie)
    })
    
    return nextResponse
  } catch (error) {
    return NextResponse.json(
      { status: false, message: 'Token refresh failed' },
      { status: 401 }
    )
  }
}