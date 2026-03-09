import { NextRequest, NextResponse } from 'next/server'

const BACKEND_API_URL = process.env.BACKEND_API_URL || 'http://localhost:8001/api/v1'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const response = await fetch(`${BACKEND_API_URL}/auth/login`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      credentials: 'include',
    })
    
    const data = await response.json()
    
    // Forward cookies from backend response
    const nextResponse = NextResponse.json(data, { status: response.status })
    
    const setCookies = response.headers.getSetCookie()
    setCookies.forEach(cookie => {
      nextResponse.headers.append('Set-Cookie', cookie)
    })
    
    return nextResponse
  } catch (error) {
    return NextResponse.json(
      { status: false, message: 'Login failed' },
      { status: 500 }
    )
  }
}