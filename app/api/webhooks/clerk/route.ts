import { WebhookEvent } from '@clerk/nextjs/server'
import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { Webhook } from 'svix'
import { clerkClient } from '@clerk/nextjs/server'

export async function POST(req: Request) {
  // Verifikasi webhook dari Clerk
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET
  if (!WEBHOOK_SECRET) {
    return new NextResponse('Webhook secret not configured', { status: 500 })
  }
  const headerPayload = await headers()
  const svix_id = headerPayload.get('svix-id')
  const svix_timestamp = headerPayload.get('svix-timestamp')
  const svix_signature = headerPayload.get('svix-signature')

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new NextResponse('Error validating webhook', { status: 400 })
  }

  const payload = await req.json()
  const body = JSON.stringify(payload)

  // Verifikasi tanda tangan webhook
  const wh = new Webhook(WEBHOOK_SECRET)
  let evt: WebhookEvent

  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent
  } catch (err) {
    console.error('Error verifying webhook:', err)
    return new NextResponse('Error verifying webhook', { status: 400 })
  }

  // Handle event berdasarkan tipe
  const eventType = evt.type

  try {
    // Inisialisasi klien Clerk
    const clerk = await clerkClient()

    if (eventType === 'user.created') {
      // Handle user creation
      const user = await prisma.user.create({
        data: {
          clerkUserId: evt.data.id,
          email: evt.data.email_addresses[0].email_address,
          name: `${evt.data.first_name || ''} ${evt.data.last_name || ''}`.trim(),
          role: 'mahasiswa', // Menggunakan string karena database sudah di-migrate
          status: 'active',
        },
      })

      // Sinkronkan metadata ke Clerk
      await clerk.users.updateUser(evt.data.id, {
        publicMetadata: {
          role: user.role,
          status: user.status,
          userId: user.id,
        },
      })
    } else if (eventType === 'user.updated') {
      // Cek apakah user sudah ada di database
      const existingUser = await prisma.user.findUnique({
        where: { clerkUserId: evt.data.id },
      })

      if (existingUser) {
        // Update user info dari Clerk
        const updatedUser = await prisma.user.update({
          where: { clerkUserId: evt.data.id },
          data: {
            email: evt.data.email_addresses[0].email_address,
            name: `${evt.data.first_name || ''} ${evt.data.last_name || ''}`.trim(),
          },
        })

        // Sinkronkan metadata ke Clerk (memastikan metadata di Clerk sesuai dengan database)
        await clerk.users.updateUser(evt.data.id, {
          publicMetadata: {
            role: updatedUser.role,
            status: updatedUser.status,
            userId: updatedUser.id,
          },
        })
      } else {
        // Jika user tidak ditemukan, buat baru
        const newUser = await prisma.user.create({
          data: {
            clerkUserId: evt.data.id,
            email: evt.data.email_addresses[0].email_address,
            name: `${evt.data.first_name || ''} ${evt.data.last_name || ''}`.trim(),
            role: 'mahasiswa',
            status: 'active',
          },
        })

        // Sinkronkan metadata ke Clerk
        await clerk.users.updateUser(evt.data.id, {
          publicMetadata: {
            role: newUser.role,
            status: newUser.status,
            userId: newUser.id,
          },
        })
      }
    } else if (eventType === 'user.deleted') {
      // Handle user deletion
      await prisma.user.delete({
        where: { clerkUserId: evt.data.id },
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error processing webhook event:', error)
    return NextResponse.json({ error: 'Processing failed' }, { status: 500 })
  }
}
