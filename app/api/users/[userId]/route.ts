// app/api/users/[userId]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { UserRole, UserStatus } from '@/prisma/generated/client'
import prisma from '@/lib/prisma'
import { auth, clerkClient } from '@clerk/nextjs/server'
import { updateUserWithHistory, executeComplexOperation } from '@/features/manage-users/utils/prisma-utils'

// Skema validasi update user
const updateUserSchema = z.object({
  name: z.string().optional(),
  email: z.string().email().optional(),
  role: z.enum(['mahasiswa', 'admin']).optional(),
  status: z.enum(['active', 'inactive', 'pending']).optional(),
})

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId: clerkUserId } = await auth()
    if (!clerkUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { userId } = await params
    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error('Error fetching user:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId: clerkUserId } = await auth()
    if (!clerkUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Cek apakah pengguna saat ini adalah admin
    const currentUser = await prisma.user.findUnique({
      where: { clerkUserId },
    })

    if (!currentUser || currentUser.role !== 'admin') {
      return NextResponse.json(
        { error: 'Only admin can update user data' },
        { status: 403 }
      )
    }

    const body = await req.json()
    const { role, status } = body
    const { userId } = await params

    // Gunakan executeComplexOperation untuk atomic transaction
    const updatedUser = await executeComplexOperation(async (tx) => {
      // Update user di database lokal
      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: {
          role,
          status,
        },
      })

      // Dapatkan Clerk user ID dari database
      const userToUpdate = await tx.user.findUnique({
        where: { id: userId },
        select: { clerkUserId: true },
      })

      if (!userToUpdate) {
        throw new Error('User not found')
      }

      // Clerk API call harus dilakukan di luar transaction
      return { updatedUser, clerkUserId: userToUpdate.clerkUserId }
    })

    // Update metadata di Clerk sesuai dengan data di database
    const clerkClientInstance = await clerkClient()
    await clerkClientInstance.users.updateUser(updatedUser.clerkUserId, {
      publicMetadata: {
        role: updatedUser.updatedUser.role,
        status: updatedUser.updatedUser.status,
      },
    })

    return NextResponse.json(updatedUser.updatedUser)
  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId: clerkUserId } = await auth()

    if (!clerkUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { userId } = await params

    // Cari pengguna yang akan dihapus
    const userToDelete = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!userToDelete) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Hapus pengguna dari database
    await prisma.user.delete({
      where: { id: userId },
    })

    // Opsional: hapus juga pengguna dari Clerk (perhatian: ini akan menghapus akun sepenuhnya)
    // await getAuth(req).clerkClient.users.deleteUser(userToDelete.clerkUserId);

    return NextResponse.json({ message: 'User deleted successfully' })
  } catch (error) {
    console.error('Error deleting user:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId: clerkUserId } = await auth()

    if (!clerkUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse request body
    const body = await req.json()

    // Validasi input
    const parsed = updateUserSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.format() },
        { status: 400 }
      )
    }

    const { name, email, role, status } = parsed.data
    const { userId } = await params

    // Gunakan updateUserWithHistory untuk mencatat perubahan
    const data = {
      ...(name && { name }),
      ...(email && { email }),
      ...(role && { role: role as UserRole }),
      ...(status && { status: status as UserStatus }),
    }

    const updatedUser = await updateUserWithHistory(userId, data, clerkUserId)

    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
