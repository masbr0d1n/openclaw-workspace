import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const body = await request.json()
  
  const response = await fetch('http://localhost:8001/api/v1/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
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
