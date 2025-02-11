// app/api/users/route.ts
import { NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import prisma from '@/lib/prisma'
import { auth, currentUser } from '@clerk/nextjs/server'
import { getUsersQuerySchema } from '@/lib/validations/user'

export async function GET(req: Request) {
  try {
    console.log('API /api/users dipanggil')

    const { userId } = await auth()
    console.log('User ID dari Clerk:', userId)

    if (!userId) {
      console.error('Unauthorized access')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse and validate query parameters
    const { searchParams } = new URL(req.url)
    console.log('Query params:', Object.fromEntries(searchParams))

    const parsed = getUsersQuerySchema.safeParse(
      Object.fromEntries(searchParams)
    )

    console.log('Hasil validasi query params:', parsed)

    if (!parsed.success) {
      console.error('Query params tidak valid:', parsed.error.format())

      return NextResponse.json(
        { error: 'Invalid query parameters', details: parsed.error.format() },
        { status: 400 }
      )
    }

    const { search, role, status, page = '1', limit = '10' } = parsed.data
    console.log(
      `Mencari users dengan: search=${search}, role=${role}, status=${status}, page=${page}, limit=${limit}`
    )

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

    console.log('Query ke database:', where)

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count({ where }),
    ])

    console.log('Users ditemukan:', users.length, 'Total:', total)

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
    console.log('POST /api/users called')

    const { userId } = await auth()
    if (!userId) {
      console.log('No userId found')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('Clerk userId:', userId)
    // Get Clerk user data
    const clerkUser = await currentUser()
    if (!clerkUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }
    
    console.log('Clerk user data:', {
      email: clerkUser.emailAddresses[0].emailAddress,
      firstName: clerkUser.firstName,
      lastName: clerkUser.lastName
    })


    // Check if user exists in our database
    let user = await prisma.user.findUnique({
      where: { clerkUserId: userId },
    })

    if (user) {
      console.log('Existing user found:', user.id)
      // Update existing user if needed
      user = await prisma.user.update({
        where: { clerkUserId: userId },
        data: {
          email: clerkUser.emailAddresses[0].emailAddress,
          name: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim(),
        },
      })
      console.log('User updated')
    } else {
      console.log('Creating new user')
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
      console.log('New user created:', user.id)
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
