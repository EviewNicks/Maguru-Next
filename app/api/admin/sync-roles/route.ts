'use server'

import { NextRequest, NextResponse } from 'next/server'
import { auth, clerkClient } from '@clerk/nextjs/server'
import * as Sentry from '@sentry/nextjs'
import prisma from '@/lib/prisma'
import { roleCache } from '@/lib/cache'
import { UserRole } from '@/prisma/generated/client'

/**
 * Endpoint untuk sinkronisasi manual semua role dari Clerk ke database lokal
 * Hanya dapat diakses oleh admin
 */
export async function POST(req: NextRequest) {
  return handlePost(req, prisma)
}

// Export function untuk testing
 async function handlePost(req: NextRequest, prismaClient = prisma) {
  // Cek apakah user terauthentikasi dan admin
  const { userId } = await auth()

  // Jika tidak ada user ID, return unauthorized
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Cek di database apakah user adalah admin
  const user = await prismaClient.user.findUnique({
    where: { clerkUserId: userId },
    select: { role: true },
  })

  // Jika bukan admin, return forbidden
  if (user?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // Clear seluruh cache untuk memastikan semua data segar
  roleCache.clear()

  try {
    // Ambil semua user dari Clerk
    const client = await clerkClient()
    const clerkUsersResponse = await client.users.getUserList()

    // Format respons Clerk (PaginatedResourceResponse) - penanganan di kedua format
    const clerkUsers = Array.isArray(clerkUsersResponse)
      ? clerkUsersResponse
      : clerkUsersResponse.data || []

    // Log jumlah user untuk debugging
    console.log(`Syncing ${clerkUsers.length} users from Clerk to database`)

    console.log(
      'Received clerkUsersResponse:',
      JSON.stringify(clerkUsersResponse, null, 2)
    )
    console.log('Processed clerkUsers:', JSON.stringify(clerkUsers, null, 2))

    if (clerkUsers.length === 0) {
      return NextResponse.json({
        success: true,
        count: 0,
        message: 'No users found to sync',
        timestamp: new Date().toISOString(),
      })
    }

    // Update role di database dengan transaction untuk memastikan atomic operation
    const results = await prismaClient.$transaction(
      clerkUsers.map((clerkUser) => {
        // Ambil role dari metadata atau default ke 'mahasiswa'
        const roleString =
          (clerkUser.publicMetadata?.role as string) || 'mahasiswa'

        // Konversi string ke enum UserRole yang valid
        let role: UserRole

        // Validasi role
        if (roleString === 'admin' || roleString === 'mahasiswa') {
          role = roleString as UserRole
        } else {
          role = 'mahasiswa' // Default jika tidak valid
        }

        // Lakukan update
        return prismaClient.user.update({
          where: { clerkUserId: clerkUser.id },
          data: { role }, // Sekarang role adalah enum UserRole
          select: { id: true, clerkUserId: true, role: true },
        })
      })
    )

    // Log ke Sentry untuk monitoring
    Sentry.addBreadcrumb({
      category: 'sync-roles',
      message: `Synchronized ${results.length} users from Clerk to database`,
      level: 'info',
    })

    return NextResponse.json({
      success: true,
      count: results.length,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    // Capture error untuk debugging
    Sentry.captureException(error, {
      tags: {
        component: 'sync-roles-admin',
        userId,
      },
    })

    // Return error response
    return NextResponse.json({ error: 'Sync failed' }, { status: 500 })
  }
}
