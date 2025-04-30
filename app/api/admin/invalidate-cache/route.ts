'use server'

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import * as Sentry from '@sentry/nextjs'
import prisma from '@/lib/prisma'
import { roleCache } from '@/lib/cache'

/**
 * Endpoint untuk menginvalidasi cache role
 * Bisa untuk satu user atau semua user
 * Hanya dapat diakses oleh admin
 */
export async function POST(req: NextRequest) {
  return handlePost(req, prisma)
}

// Hapus ekspor dari handlePost
async function handlePost(req: NextRequest, prismaClient = prisma) {
  try {
    // Parse request body
    const body = await req.json()
    const { userId, all, setupKey } = body

    // Setup key untuk initial admin setup (hanya untuk setup awal)
    const isSetupMode = setupKey === process.env.ADMIN_SETUP_KEY

    // Jika bukan mode setup, periksa otorisasi admin
    if (!isSetupMode) {
      // Cek apakah user terauthentikasi dan admin
      const { userId: authUserId } = await auth()

      // Jika tidak ada user ID, return unauthorized
      if (!authUserId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }

      // Cek di database apakah user adalah admin
      const authUser = await prismaClient.user.findUnique({
        where: { clerkUserId: authUserId },
        select: { role: true },
      })

      // Jika bukan admin, return forbidden
      if (authUser?.role !== 'admin') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
    }

    // Jika all=true, clear seluruh cache
    if (all) {
      roleCache.clear()

      // Log ke Sentry untuk monitoring
      Sentry.addBreadcrumb({
        category: 'cache',
        message: 'Invalidated all role cache',
        level: 'info',
      })

      return NextResponse.json({
        success: true,
        message: 'Berhasil menghapus semua cache role',
        timestamp: new Date().toISOString(),
      })
    }

    // Jika tidak ada userId, return bad request
    if (!userId) {
      return NextResponse.json(
        { error: 'userId diperlukan kecuali all=true' },
        { status: 400 }
      )
    }

    // Hapus cache untuk user tertentu
    roleCache.delete(userId)

    // Log ke Sentry untuk monitoring
    Sentry.addBreadcrumb({
      category: 'cache',
      message: `Invalidated role cache for user ${userId}`,
      level: 'info',
    })

    return NextResponse.json({
      success: true,
      message: `Berhasil menghapus cache role untuk user dengan ID ${userId}`,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Error invalidating cache:', error)

    // Capture error untuk debugging
    Sentry.captureException(error, {
      tags: {
        component: 'invalidate-cache',
      },
    })

    // Return error response
    return NextResponse.json(
      { error: 'Gagal menghapus cache', details: (error as Error).message },
      { status: 500 }
    )
  }
}
