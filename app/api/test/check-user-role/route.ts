import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { auth } from '@clerk/nextjs/server'

export async function GET(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const searchParams = req.nextUrl.searchParams
  const targetUserId = searchParams.get('userId')

  if (!targetUserId) {
    return NextResponse.json(
      { error: 'Missing userId parameter' },
      { status: 400 }
    )
  }

  const user = await prisma.user.findUnique({
    where: { clerkUserId: targetUserId },
    select: { role: true },
  })

  return NextResponse.json({ role: user?.role || 'mahasiswa' })
}
