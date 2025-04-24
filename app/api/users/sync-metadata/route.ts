import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { auth, clerkClient } from '@clerk/nextjs/server'
import * as Sentry from '@sentry/nextjs'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // Verifikasi autentikasi
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Dapatkan semua user dari database
    const users = await prisma.user.findMany()
    const results = []

    for (const user of users) {
      try {
        // Update metadata di Clerk
        const clerk = await clerkClient()
        await clerk.users.updateUserMetadata(user.clerkUserId, {
          publicMetadata: {
            role: user.role,
            status: user.status,
          },
        })

        results.push({
          userId: user.clerkUserId,
          status: 'success',
          metadata: {
            role: user.role,
            status: user.status,
          },
        })
      } catch (error) {
        Sentry.captureException(error, {
          tags: { component: 'sync-metadata', userId: user.clerkUserId },
        })

        results.push({
          userId: user.clerkUserId,
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error',
        })
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Sinkronisasi metadata selesai',
      results,
    })
  } catch (error) {
    Sentry.captureException(error, {
      tags: { component: 'sync-metadata-all' },
    })

    return NextResponse.json(
      {
        error: 'Gagal menyinkronisasi metadata',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

export async function POST() {
  try {
    // Verifikasi autentikasi
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Dapatkan user dari database
    const user = await prisma.user.findUnique({
      where: { clerkUserId: userId },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Update metadata di Clerk
    try {
      const clerk = await clerkClient()
      await clerk.users.updateUserMetadata(userId, {
        publicMetadata: {
          role: user.role,
          status: user.status,
        },
      })
    } catch (error) {
      Sentry.captureException(error, {
        tags: { component: 'sync-metadata-single', userId },
      })

      return NextResponse.json(
        { error: 'Gagal menyinkronisasi metadata' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Metadata berhasil disinkronisasi',
      metadata: {
        role: user.role,
        status: user.status,
      },
    })
  } catch (error) {
    Sentry.captureException(error, {
      tags: { component: 'sync-metadata-single' },
    })

    return NextResponse.json(
      { error: 'Gagal menyinkronisasi metadata' },
      { status: 500 }
    )
  }
}
