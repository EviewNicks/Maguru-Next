'use server'

import { NextRequest, NextResponse } from 'next/server'
import { auth, clerkClient } from '@clerk/nextjs/server'
import * as Sentry from '@sentry/nextjs'
import prisma from '@/lib/prisma'
import { roleCache } from '@/lib/cache'
import { UserRole } from '@/prisma/generated/client'

/**
 * Endpoint untuk mengubah role user di Clerk dan database lokal
 * Hanya dapat diakses oleh admin atau dengan secret key khusus untuk setup awal
 */
export async function POST(req: NextRequest) {
  return handlePost(req, prisma)
}

// Export function untuk testing
export async function handlePost(req: NextRequest, prismaClient = prisma) {
  try {
    // Parse request body
    const body = await req.json()
    const { userId, clerkUserId, email, role, setupKey } = body

    // Validasi input
    if (!clerkUserId && !userId && !email) {
      return NextResponse.json(
        { error: 'User ID, Clerk User ID, atau email diperlukan' },
        { status: 400 }
      )
    }

    if (!role) {
      return NextResponse.json({ error: 'Role diperlukan' }, { status: 400 })
    }

    // Cek apakah role valid
    if (!['admin', 'mahasiswa', 'dosen'].includes(role)) {
      return NextResponse.json(
        {
          error:
            'Role tidak valid, harus salah satu dari: admin, mahasiswa, dosen',
        },
        { status: 400 }
      )
    }

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

    // Cari user berdasarkan identifier yang diberikan
    let targetUser

    if (userId) {
      targetUser = await prismaClient.user.findUnique({
        where: { id: userId },
      })
    } else if (clerkUserId) {
      targetUser = await prismaClient.user.findUnique({
        where: { clerkUserId },
      })
    } else if (email) {
      targetUser = await prismaClient.user.findFirst({
        where: { email },
      })
    }

    if (!targetUser) {
      return NextResponse.json(
        { error: 'User tidak ditemukan' },
        { status: 404 }
      )
    }

    // Ubah role di Clerk
    const client = await clerkClient()
    await client.users.updateUser(targetUser.clerkUserId, {
      publicMetadata: { role },
    })

    // Ubah role di database
    const updatedUser = await prismaClient.user.update({
      where: { id: targetUser.id },
      data: { role: role as UserRole },
      select: {
        id: true,
        clerkUserId: true,
        email: true,
        name: true,
        role: true,
      },
    })

    // Invalidasi cache untuk user ini
    roleCache.delete(targetUser.clerkUserId)

    // Log ke Sentry untuk monitoring
    Sentry.addBreadcrumb({
      category: 'set-role',
      message: `Changed role for user ${targetUser.email} to ${role}`,
      level: 'info',
    })

    return NextResponse.json({
      success: true,
      user: updatedUser,
      message: `Berhasil mengubah role user ${targetUser.email} menjadi ${role}`,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Error setting user role:', error)

    // Capture error untuk debugging
    Sentry.captureException(error, {
      tags: {
        component: 'set-role-admin',
      },
    })

    // Return error response
    return NextResponse.json(
      { error: 'Gagal mengubah role user', details: (error as Error).message },
      { status: 500 }
    )
  }
}
