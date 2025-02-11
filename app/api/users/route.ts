// app/api/users/route.ts
import { NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import prisma from '@/lib/prisma'
import { auth } from '@clerk/nextjs/server'
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


export async function POST(req: Request) {
  try {
    // Verify authentication
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user data from request body
    const data = await req.json()

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { clerkUserId: data.clerkUserId },
          { email: data.email }
        ]
      }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 409 }
      )
    }

    // Create new user
    const user = await prisma.user.create({
      data: {
        clerkUserId: data.clerkUserId,
        email: data.email,
        name: data.name || '',
        role: data.role || 'mahasiswa',
        status: data.status || 'active'
      }
    })

    return NextResponse.json(user, { status: 201 })
  } catch (error) {
    console.error('POST user error:', error)
    
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // Handle unique constraint violations
      if (error.code === 'P2002') {
        return NextResponse.json(
          { error: 'User with this email or clerkUserId already exists' },
          { status: 409 }
        )
      }
    }

    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
