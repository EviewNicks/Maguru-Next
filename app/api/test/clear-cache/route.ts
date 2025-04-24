import { NextResponse } from 'next/server'
import { roleCache } from '@/lib/cache'

export async function POST() {
  try {
    // Clear role cache
    roleCache.clear()

    return NextResponse.json({
      success: true,
      message: 'Cache cleared successfully',
      timestamp: new Date().toISOString(),
    })
  } catch {
    return NextResponse.json(
      { error: 'Failed to clear cache' },
      { status: 500 }
    )
  }
}
