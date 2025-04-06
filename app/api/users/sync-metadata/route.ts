import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { auth, clerkClient } from '@clerk/nextjs/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Ambil semua pengguna yang memerlukan sinkronisasi metadata
    const users = await prisma.user.findMany({
      where: {
        clerkUserId: { not: '' },
        role: { not: undefined },
        status: { not: undefined },
      },
    })

    if (users.length === 0) {
      return NextResponse.json({ message: 'No users to sync' })
    }

    // Inisialisasi Clerk client
    const clerkClientInstance = await clerkClient()

    // Update metadata untuk setiap pengguna
    const updatePromises = users.map((user) =>
      clerkClientInstance.users.updateUser(user.clerkUserId!, {
        publicMetadata: {
          role: user.role,
          status: user.status,
          userId: user.id,
        },
      })
    )

    // Tunggu semua update selesai
    await Promise.all(updatePromises)

    return NextResponse.json({
      message: 'Metadata synced successfully',
      usersSynced: users.length,
    })
  } catch (error) {
    console.error('Error syncing metadata:', error)
    return NextResponse.json(
      { error: 'Internal Server Error', details: error },
      { status: 500 }
    )
  }
}

// Endpoint untuk Admin menyinkronkan semua pengguna
export async function POST() {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Ambil semua pengguna yang memerlukan sinkronisasi metadata
    const users = await prisma.user.findMany({
      where: {
        clerkUserId: { not: '' },
        role: { not: undefined },
        status: { not: undefined },
      },
    })

    if (users.length === 0) {
      return NextResponse.json({ message: 'No users to sync' })
    }

    // Inisialisasi Clerk client
    const clerkClientInstance = await clerkClient()

    // Update metadata untuk setiap pengguna
    const updatePromises = users.map((user) =>
      clerkClientInstance.users.updateUser(user.clerkUserId!, {
        publicMetadata: {
          role: user.role,
          status: user.status,
          userId: user.id,
        },
      })
    )

    // Tunggu semua update selesai
    await Promise.all(updatePromises)

    return NextResponse.json({
      message: 'Metadata synced successfully',
      usersSynced: users.length,
    })
  } catch (error) {
    console.error('Error syncing metadata:', error)
    return NextResponse.json(
      { error: 'Internal Server Error', details: error },
      { status: 500 }
    )
  }
}
