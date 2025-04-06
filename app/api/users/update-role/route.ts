import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { auth, clerkClient } from '@clerk/nextjs/server'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { role } = await request.json()

    // Validasi role
    if (!['admin', 'mahasiswa'].includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
    }

    // Update role di database
    await prisma.user.update({
      where: { clerkUserId: userId },
      data: { role }
    })

    // Update role di Clerk
    const clerkClientInstance = await clerkClient()
    await clerkClientInstance.users.updateUser(userId, {
      publicMetadata: {
        role
      }
    })

    console.log(`Role updated to: ${role}`)

    return NextResponse.json({ 
      message: 'Role updated successfully', 
      role 
    })
  } catch (error) {
    console.error('Error updating role:', error)
    return NextResponse.json(
      { error: 'Failed to update role' }, 
      { status: 500 }
    )
  }
}
