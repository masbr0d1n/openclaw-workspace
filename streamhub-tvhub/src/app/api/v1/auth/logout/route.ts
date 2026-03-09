import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const backendUrl = process.env.BACKEND_API_URL || 'http://localhost:8001';
  const response = await fetch(`${backendUrl}/api/v1/auth/logout`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  })
  
  const data = await response.json()
  
  // Forward cookies from backend response
  const nextResponse = NextResponse.json(data)
  const setCookies = response.headers.getSetCookie()
  setCookies.forEach(cookie => {
    nextResponse.headers.append('Set-Cookie', cookie)
  })
  
  return nextResponse
}
