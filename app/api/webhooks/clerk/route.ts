import { Webhook } from 'svix'
import { headers } from 'next/headers'
import { WebhookEvent } from '@clerk/nextjs/server'
import prisma from '@/lib/prisma'
import { clerkClient } from '@clerk/nextjs/server'

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET

  if (!WEBHOOK_SECRET) {
    throw new Error(
      'Please add CLERK_WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local'
    )
  }

  const headerPayload = await headers()
  const svix_id = headerPayload.get('svix-id')
  const svix_timestamp = headerPayload.get('svix-timestamp')
  const svix_signature = headerPayload.get('svix-signature')

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occured -- no svix headers', {
      status: 400,
    })
  }

  const payload = await req.json()
  const body = JSON.stringify(payload)

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
    return new Response('Error occured', {
      status: 400,
    })
  }

  const eventType = evt.type

  console.log(`Webhook dengan tipe: ${eventType}`)
  console.log('Webhook body:', body)

  if (eventType === 'user.created' || eventType === 'user.updated') {
    const { id, email_addresses, first_name, last_name } = evt.data

    const email = email_addresses[0]?.email_address

    if (!email) {
      return new Response('Email tidak ditemukan', { status: 400 })
    }

    try {
      // Cek apakah user sudah ada di database
      const existingUser = await prisma.user.findUnique({
        where: { clerkUserId: id },
      })

      if (existingUser) {
        // Update user yang sudah ada
        await prisma.user.update({
          where: { clerkUserId: id },
          data: {
            email,
            name: `${first_name} ${last_name}`.trim(),
            updatedAt: new Date(),
          },
        })

        // Sinkronisasi metadata dengan Clerk
        const client = await clerkClient()
        await client.users.updateUserMetadata(id, {
          publicMetadata: {
            role: existingUser.role,
            status: existingUser.status,
          },
        })
      } else {
        // Buat user baru dengan role default 'mahasiswa'
        const newUser = await prisma.user.create({
          data: {
            clerkUserId: id,
            email,
            name: `${first_name} ${last_name}`.trim(),
            role: 'mahasiswa',
            status: 'active',
          },
        })

        // Set metadata di Clerk
        const client = await clerkClient()
        await client.users.updateUserMetadata(id, {
          publicMetadata: {
            role: newUser.role,
            status: newUser.status,
          },
        })
      }

      return new Response('User berhasil diupdate', { status: 200 })
    } catch (error) {
      console.error('Error processing webhook:', error)
      return new Response('Error processing webhook', { status: 500 })
    }
  }

  if (eventType === 'user.deleted') {
    const { id } = evt.data

    try {
      // Hapus user dari database
      await prisma.user.delete({
        where: { clerkUserId: id },
      })

      return new Response('User berhasil dihapus', { status: 200 })
    } catch (error) {
      console.error('Error deleting user:', error)
      return new Response('Error deleting user', { status: 500 })
    }
  }

  return new Response('', { status: 200 })
}
