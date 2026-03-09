import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  // Forward cookies from client request to backend
  const cookie = request.headers.get('cookie') || ''
  
  const backendUrl = process.env.BACKEND_API_URL || 'http://localhost:8001';
  const response = await fetch(`${backendUrl}/api/v1/auth/me`, {
    method: 'GET',
    headers: {
      'Cookie': cookie,
    },
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
