import { NextRequest, NextResponse } from 'next/server'

const BACKEND_API_URL = process.env.BACKEND_API_URL || 'http://localhost:8001/api/v1'

export async function POST(request: NextRequest) {
  try {
    const response = await fetch(`${BACKEND_API_URL}/auth/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    
    const data = await response.json()
    
    const nextResponse = NextResponse.json(data, { status: response.status })
    
    // Clear cookies
    nextResponse.cookies.delete('access_token')
    nextResponse.cookies.delete('refresh_token')
    
    return nextResponse
  } catch (error) {
    return NextResponse.json(
      { status: false, message: 'Logout failed' },
      { status: 500 }
    )
  }
}