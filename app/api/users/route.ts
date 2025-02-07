// app/api/users/route.ts
import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import auth from '@clerk/nextjs'
import { getUsersQuerySchema } from '@/lib/validations/user'

export async function GET(req: Request) {
  try {
    const { userId } = auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse and validate query parameters
    const { searchParams } = new URL(req.url)
    const parsed = getUsersQuerySchema.safeParse(
      Object.fromEntries(searchParams)
    )

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: parsed.error.format() },
        { status: 400 }
      )
    }

    const { search, role, status, page = '1', limit = '10' } = parsed.data
    const skip = (parseInt(page) - 1) * parseInt(limit)

    const where = {
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
        ],
      }),
      ...(role && { role }),
      ...(status && { status }),
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
