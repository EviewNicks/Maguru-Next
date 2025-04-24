// app/api/users/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { UserRole, UserStatus } from '@/prisma/generated/client'

import {
  getOptimizedUsers,
  executeComplexOperation,
} from '@/features/manage-users/utils/prisma-utils'
import { auth, currentUser } from '@clerk/nextjs/server'

const getUserQuerySchema = z.object({
  search: z.string().optional(),
  role: z.enum(['mahasiswa', 'admin']).optional(),
  status: z.enum(['active', 'inactive', 'pending']).optional(),
  page: z.string().optional().default('1'),
  limit: z.string().optional().default('10'),
})

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      console.error('Unauthorized access')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = req.nextUrl.searchParams
    const queryParams = Object.fromEntries(searchParams)

    const parsed = getUserQuerySchema.safeParse(queryParams)

    if (!parsed.success) {
      console.error('Query params tidak valid:', parsed.error.format())

      return NextResponse.json(
        { error: 'Invalid query parameters', details: parsed.error.format() },
        { status: 400 }
      )
    }

    const { search, role, status, page = '1', limit = '10' } = parsed.data

    // Gunakan getOptimizedUsers dari prisma-utils
    const [total, users] = await getOptimizedUsers({
      page: parseInt(page),
      limit: parseInt(limit),
      role: role as UserRole | undefined,
      status: status as UserStatus | undefined,
      searchTerm: search,
    })

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

    // Gunakan executeComplexOperation untuk transaksi
    const user = await executeComplexOperation(async (tx) => {
      // Check if user exists in our database
      const existingUser = await tx.user.findUnique({
        where: { clerkUserId: userId },
      })

      if (existingUser) {
        // Update existing user if needed
        return await tx.user.update({
          where: { clerkUserId: userId },
          data: {
            email: clerkUser.emailAddresses[0].emailAddress,
            name: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim(),
            updatedAt: new Date(), // Pastikan updatedAt diperbarui
          },
        })
      } else {
        // Create new user
        return await tx.user.create({
          data: {
            clerkUserId: userId,
            email: clerkUser.emailAddresses[0].emailAddress,
            name: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim(),
            role: 'mahasiswa',
            status: 'active',
          },
        })
      }
    })

    return NextResponse.json(user)
  } catch (error) {
    console.error('Error in user sync:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
