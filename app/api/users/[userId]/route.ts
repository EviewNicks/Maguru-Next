// app/api/users/[userId]/route.ts
import { NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import prisma from '@/lib/prisma'
import { auth } from '@clerk/nextjs/server'
import { updateUserSchema } from '@/lib/validations/user'

export async function PATCH(
  req: Request,
  { params }: { params: { userId: string } }
) {
  try {
    // Await params di awal
    const { userId: paramsUserId } = await Promise.resolve(params)
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Unauthorized' } },
        { status: 401 }
      )
    }

    const body = await req.json()
    const parsed = updateUserSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid input',
            details: parsed.error.format(),
          },
        },
        { status: 400 }
      )
    }

    // Gunakan paramsUserId yang sudah di-await
    const currentUser = await prisma.user.findUnique({
      where: { id: paramsUserId },
    })

    if (!currentUser) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'User not found' } },
        { status: 404 }
      )
    }

    // Check if the record has been modified since last fetch
    if (
      body.lastKnownUpdate &&
      new Date(body.lastKnownUpdate) < currentUser.updatedAt
    ) {
      return NextResponse.json(
        {
          error: {
            code: 'CONCURRENT_MODIFICATION',
            message: 'This record has been modified by another user',
            details: { currentVersion: currentUser.updatedAt },
          },
        },
        { status: 409 }
      )
    }

    // Gunakan paramsUserId yang sudah di-await
    const updatedUser = await prisma.user.update({
      where: { id: paramsUserId },
      data: parsed.data,
    })

    return NextResponse.json({
      data: updatedUser,
      message: 'User updated successfully',
    })
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        return NextResponse.json({ error: 'User not found' }, { status: 404 })
      }
    }

    console.error('PATCH user error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { userId: string } }
) {
  try {
    // Hapus await untuk params karena sudah berupa object
    const { userId: paramsUserId } = params
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Gunakan paramsUserId yang sudah di-await
    await prisma.user.delete({
      where: { id: paramsUserId },
    })

    return NextResponse.json({ message: 'User deleted successfully' })
  } catch (error) {
    const prismaError = error as { code?: string }

    if (prismaError.code === 'P2025') {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    console.error('PATCH user error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
