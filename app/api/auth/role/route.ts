import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import prisma from '@/lib/prisma'

export const runtime = 'nodejs' // Menggunakan nodejs runtime untuk Prisma

export async function GET() {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { clerkUserId: userId },
      select: {
        id: true,
        role: true,
        status: true,
        email: true,
        name: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      user: {
        ...user,
        clerkUserId: userId,
      },
    })
  } catch (error) {
    console.error('Error fetching user role:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
