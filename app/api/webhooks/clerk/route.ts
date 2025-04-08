import { Webhook } from 'svix'
import { headers } from 'next/headers'
import { WebhookEvent } from '@clerk/nextjs/server'
import prisma from '@/lib/prisma'
import { clerkClient } from '@clerk/nextjs/server'

export async function POST(req: Request) {
  // Pastikan ini berjalan di server side
  if (typeof window !== 'undefined') {
    return new Response('This endpoint can only be called from server side', {
      status: 400,
    })
  }

  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET

  if (!WEBHOOK_SECRET) {
    throw new Error(
      'Please add CLERK_WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local'
    )
  }

  try {
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
      return new Response('Error verifying webhook signature', {
        status: 400,
      })
    }

    const eventType = evt.type
    console.log(`Webhook dengan tipe: ${eventType}`)

    if (eventType === 'user.created' || eventType === 'user.updated') {
      const { id, email_addresses, first_name, last_name } = evt.data
      const email = email_addresses[0]?.email_address

      if (!email) {
        return new Response('Email tidak ditemukan', { status: 400 })
      }

      try {
        const existingUser = await prisma.user.findUnique({
          where: { clerkUserId: id },
        })

        if (existingUser) {
          const updatedUser = await prisma.user.update({
            where: { clerkUserId: id },
            data: {
              email,
              name: `${first_name} ${last_name}`.trim(),
              updatedAt: new Date(),
            },
          })

          const client = await clerkClient()
          await client.users.updateUserMetadata(id, {
            publicMetadata: {
              role: updatedUser.role,
              status: updatedUser.status,
            },
          })

          return new Response(
            JSON.stringify({
              message: 'User berhasil diupdate',
              user: updatedUser,
            }),
            {
              status: 200,
              headers: { 'Content-Type': 'application/json' },
            }
          )
        } else {
          const newUser = await prisma.user.create({
            data: {
              clerkUserId: id,
              email,
              name: `${first_name} ${last_name}`.trim(),
              role: 'mahasiswa',
              status: 'active',
            },
          })

          const client = await clerkClient()
          await client.users.updateUserMetadata(id, {
            publicMetadata: {
              role: newUser.role,
              status: newUser.status,
            },
          })

          return new Response(
            JSON.stringify({
              message: 'User baru berhasil dibuat',
              user: newUser,
            }),
            {
              status: 201,
              headers: { 'Content-Type': 'application/json' },
            }
          )
        }
      } catch (error) {
        console.error('Error processing user:', error)
        return new Response(
          JSON.stringify({
            error: 'Error processing user',
            details: error instanceof Error ? error.message : 'Unknown error',
          }),
          {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
          }
        )
      }
    }

    if (eventType === 'user.deleted') {
      try {
        await prisma.user.delete({
          where: { clerkUserId: evt.data.id },
        })

        return new Response(
          JSON.stringify({
            message: 'User berhasil dihapus',
            userId: evt.data.id,
          }),
          {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          }
        )
      } catch (error) {
        console.error('Error deleting user:', error)
        return new Response(
          JSON.stringify({
            error: 'Error deleting user',
            details: error instanceof Error ? error.message : 'Unknown error',
          }),
          {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
          }
        )
      }
    }

    return new Response(
      JSON.stringify({
        message: 'Webhook processed successfully',
        eventType,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(
      JSON.stringify({
        error: 'Unexpected error occurred',
        details: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }
}
