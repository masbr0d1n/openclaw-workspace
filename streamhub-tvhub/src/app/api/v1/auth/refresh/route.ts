import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  // Get refresh token from query param
  const { searchParams } = new URL(request.url)
  const refreshToken = searchParams.get('refresh_token')
  
  // Forward cookies from client request to backend
  const cookie = request.headers.get('cookie') || ''
  
  const response = await fetch(`http://localhost:8001/api/v1/auth/refresh?refresh_token=${refreshToken}`, {
    method: 'POST',
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
