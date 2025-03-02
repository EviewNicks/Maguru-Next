import { auth, currentUser } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user exists in database
    let user = await prisma.user.findUnique({
      where: { clerkUserId: userId },
    })

    // If user doesn't exist, create new user
    if (!user) {
      const clerkUser = await currentUser()
      if (!clerkUser) {
        return NextResponse.json({ error: 'User data not available' }, { status: 400 })
      }

      user = await prisma.user.create({
        data: {
          clerkUserId: userId,
          email: clerkUser.emailAddresses[0].emailAddress,
          name: `${clerkUser.firstName} ${clerkUser.lastName}`.trim(),
          role: 'mahasiswa',
          status: 'active',
        },
      })
    }

    return NextResponse.json({ user })
  } catch (error) {
    console.error('Error in user authentication:', error)
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 })
  }
}