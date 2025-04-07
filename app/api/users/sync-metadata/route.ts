import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { auth, clerkClient } from '@clerk/nextjs/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    console.log('Mulai sinkronisasi metadata untuk pengguna saat ini')
    const { userId } = await auth()

    if (!userId) {
      console.error('Sinkronisasi metadata: Pengguna tidak terautentikasi')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Ambil pengguna yang sedang login
    const currentUser = await prisma.user.findUnique({
      where: { clerkUserId: userId },
    })

    if (!currentUser) {
      console.error(
        `Sinkronisasi metadata: Pengguna dengan Clerk ID ${userId} tidak ditemukan di database`
      )
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    console.log('Current User Role:', currentUser.role)

    // Inisialisasi Clerk client
    const clerkClientInstance = await clerkClient()

    // Update metadata untuk pengguna saat ini
    try {
      await clerkClientInstance.users.updateUser(userId, {
        publicMetadata: {
          role: currentUser.role,
          status: currentUser.status,
          userId: currentUser.id,
        },
      })

      console.log('Metadata berhasil diperbarui:', {
        role: currentUser.role,
        status: currentUser.status,
      })

      return NextResponse.json({
        message: 'Metadata synced successfully',
        role: currentUser.role,
      })
    } catch (updateError) {
      console.error('Error saat memperbarui metadata Clerk:', updateError)
      return NextResponse.json(
        {
          error: 'Failed to update Clerk metadata',
          details: String(updateError),
        },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Error saat sinkronisasi metadata:', error)
    return NextResponse.json(
      { error: 'Failed to sync metadata', details: String(error) },
      { status: 500 }
    )
  }
}

// Endpoint untuk semua pengguna
export async function POST() {
  try {
    console.log('Mulai sinkronisasi metadata untuk semua pengguna')
    const { userId } = await auth()

    if (!userId) {
      console.error('Sinkronisasi metadata: Pengguna tidak terautentikasi')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Ambil semua pengguna yang memiliki clerkUserId
    const users = await prisma.user.findMany({
      where: {
        clerkUserId: { not: '' },
      },
    })

    if (users.length === 0) {
      console.log('Tidak ada pengguna untuk disinkronkan')
      return NextResponse.json({ message: 'No users to sync' })
    }

    console.log(`Ditemukan ${users.length} pengguna untuk disinkronkan`)

    // Inisialisasi Clerk client
    const clerkClientInstance = await clerkClient()

    // Track hasil sinkronisasi
    const sukses = []
    const gagal = []

    // Update metadata untuk setiap pengguna
    for (const user of users) {
      try {
        if (!user.clerkUserId) {
          console.warn(
            `Pengguna ${user.id} tidak memiliki clerkUserId, dilewati`
          )
          gagal.push({
            id: user.id,
            email: user.email,
            error: 'Tidak ada clerkUserId',
          })
          continue
        }

        // Update metadata di Clerk
        await clerkClientInstance.users.updateUser(user.clerkUserId, {
          publicMetadata: {
            role: user.role,
            status: user.status,
            userId: user.id,
          },
        })

        console.log(
          `Berhasil memperbarui metadata untuk ${user.email || user.clerkUserId} dengan role ${user.role}`
        )
        sukses.push({
          id: user.id,
          email: user.email,
          role: user.role,
        })
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error)

        // Log yang lebih informatif
        if (errorMessage.includes('Not found')) {
          console.error(
            `Pengguna dengan ID ${user.clerkUserId} tidak ditemukan di Clerk`
          )
          gagal.push({
            id: user.id,
            email: user.email,
            error: 'Pengguna tidak ditemukan di Clerk',
          })
        } else {
          console.error(
            `Error saat memperbarui ${user.email || user.clerkUserId}: ${errorMessage}`
          )
          gagal.push({
            id: user.id,
            email: user.email,
            error: errorMessage,
          })
        }
      }
    }

    return NextResponse.json({
      message: 'Proses sinkronisasi metadata selesai',
      totalUser: users.length,
      berhasil: sukses.length,
      gagal: gagal.length,
      detailSukses: sukses,
      detailGagal: gagal,
    })
  } catch (error) {
    console.error('Error saat sinkronisasi metadata:', error)
    const errorMessage = error instanceof Error ? error.message : String(error)
    return NextResponse.json(
      { error: 'Internal Server Error', details: errorMessage },
      { status: 500 }
    )
  }
}
