// app/api/users/route.ts
import { NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import prisma from '@/lib/prisma'
import { auth, currentUser } from '@clerk/nextjs/server'
import { getUsersQuerySchema } from '@/lib/validations/user'

export async function GET(req: Request) {
  try {

    const { userId } = await auth()

    if (!userId) {
      console.error('Unauthorized access')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse and validate query parameters
    const { searchParams } = new URL(req.url)

    const parsed = getUsersQuerySchema.safeParse(
      Object.fromEntries(searchParams)
    )


    if (!parsed.success) {
      console.error('Query params tidak valid:', parsed.error.format())

      return NextResponse.json(
        { error: 'Invalid query parameters', details: parsed.error.format() },
        { status: 400 }
      )
    }

    const { search, role, status, page = '1', limit = '10' } = parsed.data

    const skip = (parseInt(page) - 1) * parseInt(limit)

    const where: Prisma.UserWhereInput = {
      OR: search
        ? [
            { name: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
          ]
        : undefined,
      role: role ?? undefined,
      status: status ?? undefined,
    }


    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count({ where }),
    ])


    return NextResponse.json({
      users,
      metadata: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
      },
    })
  } catch (error) {
    console.error('GET users error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}

export async function POST() {
  try {

    const { userId } = await auth()
        if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    // Get Clerk user data
    const clerkUser = await currentUser()
    if (!clerkUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }
    


    // Check if user exists in our database
    let user = await prisma.user.findUnique({
      where: { clerkUserId: userId },
    })

    if (user) {
      // Update existing user if needed
      user = await prisma.user.update({
        where: { clerkUserId: userId },
        data: {
          email: clerkUser.emailAddresses[0].emailAddress,
          name: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim(),
        },
      })
    } else {
      // Create new user
      user = await prisma.user.create({
        data: {
          clerkUserId: userId,
          email: clerkUser.emailAddresses[0].emailAddress,
          name: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim(),
          role: 'mahasiswa',
          status: 'active',
        },
      })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error('Error in user sync:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
