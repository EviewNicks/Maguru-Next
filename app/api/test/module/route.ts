import { NextRequest, NextResponse } from 'next/server'

/**
 * Handler untuk GET request
 * Endpoint ini hanya untuk pengujian dan debugging, tidak untuk produksi
 */
export async function GET(request: NextRequest) {
  try {
    return NextResponse.json(
      {
        success: true,
        message: 'API Module berfungsi dengan baik',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error in test endpoint:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Terjadi kesalahan saat mengakses test endpoint',
      },
      { status: 500 }
    )
  }
}
