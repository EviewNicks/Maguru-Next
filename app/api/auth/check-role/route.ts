import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getUserRole } from '@/lib/cache'

export async function GET() {
  try {
    const start = performance.now()

    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Gunakan cache layer untuk mendapatkan role
    const role = await getUserRole(userId)

    const end = performance.now()
    const responseTime = end - start

    return NextResponse.json({
      role,
      performance: {
        responseTime: `${responseTime.toFixed(2)}ms`,
        cacheEnabled: true,
        timestamp: new Date().toISOString(),
      },
    })
  } catch {
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
