import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma' // Pastikan prisma sudah dikonfigurasi
import { headers } from 'next/headers'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const eventType = body.type // Ambil tipe event
    const userData = body.data // Data user dari Clerk

    // Hanya tangani event `user.created`
    if (eventType !== 'user.created') {
      return NextResponse.json(
        { message: 'Event not handled' },
        { status: 200 }
      )
    }

    // Cek apakah user sudah ada di database
    const existingUser = await prisma.user.findUnique({
      where: { clerkUserId: userData.id },
    })

    if (existingUser) {
      return NextResponse.json(
        { message: 'User already exists' },
        { status: 200 }
      )
    }

    // Simpan user ke database Supabase
    await prisma.user.create({
      data: {
        clerkUserId: userData.id,
        email: userData.email_addresses[0].email_address,
        name: `${userData.first_name} ${userData.last_name}`.trim() || null,
        role: 'mahasiswa', // Default role
      },
    })

    return NextResponse.json({ message: 'User created' }, { status: 201 })
  } catch (error) {
    console.error('Error handling Clerk webhook:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
