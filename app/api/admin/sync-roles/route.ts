import { NextRequest, NextResponse } from 'next/server'
import { auth, clerkClient } from '@clerk/nextjs/server'
import * as Sentry from '@sentry/nextjs'
import prisma from '@/lib/prisma'
import { roleCache } from '@/lib/cache'

/**
 * Endpoint untuk sinkronisasi manual semua role dari Clerk ke database lokal
 * Hanya dapat diakses oleh admin
 */
export async function POST(req: NextRequest) {
  // Cek apakah user terauthentikasi dan admin
  const { userId } = await auth()

  // Jika tidak ada user ID, return unauthorized
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Cek di database apakah user adalah admin
  const user = await prisma.user.findUnique({
    where: { clerkUserId: userId },
    select: { role: true },
  })

  // Jika bukan admin, return forbidden
  if (user?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    // Ambil semua user dari Clerk
    const client = await clerkClient()
    const users = await client.users.getUserList()

    // Update role di database dengan transaction untuk memastikan atomic operation
    const results = await prisma.$transaction(
      users.map((clerkUser) => {
        const role = (clerkUser.publicMetadata?.role as string) || 'mahasiswa'
        return prisma.user.update({
          where: { clerkUserId: clerkUser.id },
          data: { role },
          select: { id: true, clerkUserId: true, role: true },
        })
      })
    )

    // Clear seluruh cache untuk memastikan semua data segar
    roleCache.clear()

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

// Export function untuk testing
export async function handlePost(req: NextRequest, prismaClient = prisma) {
  // Implementasi sama dengan POST tetapi dengan dependency injection untuk testing
  // Duplikasi kode ini untuk memudahkan testing

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

  try {
    // Ambil semua user dari Clerk
    const client = await clerkClient()
    const users = await client.users.getUserList()

    // Update role di database dengan transaction untuk memastikan atomic operation
    const results = await prismaClient.$transaction(
      users.map((clerkUser) => {
        const role = (clerkUser.publicMetadata?.role as string) || 'mahasiswa'
        return prismaClient.user.update({
          where: { clerkUserId: clerkUser.id },
          data: { role },
          select: { id: true, clerkUserId: true, role: true },
        })
      })
    )

    // Clear seluruh cache untuk memastikan semua data segar
    roleCache.clear()

    return NextResponse.json({
      success: true,
      count: results.length,
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
