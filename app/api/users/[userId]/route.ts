// app/api/users/[userId]/route.ts
import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import auth from '@clerk/nextjs'
import { updateUserSchema } from '@/lib/validations/user'

export async function PATCH(
  req: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const parsed = updateUserSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.format() },
        { status: 400 }
      )
    }

    const updatedUser = await prisma.user.update({
      where: { id: params.userId },
      data: parsed.data,
    })

    return NextResponse.json(updatedUser)
  } catch (error) {
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
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
    const { userId } = auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await prisma.user.delete({
      where: { id: params.userId },
    })

    return NextResponse.json({ message: 'User deleted successfully' })
  } catch (error) {
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }
    console.error('DELETE user error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
