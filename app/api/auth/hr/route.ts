// app/api/auth/hr/route.ts
import { NextRequest, NextResponse } from 'next/server'

// In a real app, you'd store this in environment variables or a secure config
const HR_PASSWORD = process.env.HR_PASSWORD || 'secureHRcompany@0908'

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json()

    if (!password) {
      return NextResponse.json(
        { error: 'Password is required' },
        { status: 400 }
      )
    }

    if (password === HR_PASSWORD) {
      return NextResponse.json({ success: true })
    } else {
      return NextResponse.json(
        { error: 'Invalid password' },
        { status: 401 }
      )
    }
  } catch (error) {
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    )
  }
}