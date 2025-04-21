import { Webhook } from 'svix'
import { headers } from 'next/headers'
import { WebhookEvent } from '@clerk/nextjs/server'
import { clerkClient } from '@clerk/nextjs/server'
import * as Sentry from '@sentry/nextjs'
import { executeComplexOperation } from '@/features/manage-users/utils/prisma-utils'

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
      Sentry.captureException(err, {
        tags: {
          component: 'webhook-clerk',
          action: 'signature-verification',
        },
      })
      return new Response('Error verifying webhook signature', {
        status: 400,
      })
    }

    const eventType = evt.type

    if (eventType === 'user.created' || eventType === 'user.updated') {
      const { id, email_addresses, first_name, last_name } = evt.data
      const email = email_addresses[0]?.email_address

      if (!email) {
        return new Response('Email tidak ditemukan', { status: 400 })
      }

      try {
        // Gunakan transaction untuk operasi database dan clerk API
        const result = await executeComplexOperation(async (tx) => {
          const existingUser = await tx.user.findUnique({
            where: { clerkUserId: id },
          })

          let user
          if (existingUser) {
            user = await tx.user.update({
              where: { clerkUserId: id },
              data: {
                email,
                name: `${first_name} ${last_name}`.trim(),
                updatedAt: new Date(),
              },
            })
          } else {
            user = await tx.user.create({
              data: {
                clerkUserId: id,
                email,
                name: `${first_name} ${last_name}`.trim(),
                role: 'mahasiswa',
                status: 'active',
              },
            })
          }

          // Perhatikan: clerk API call dilakukan di luar transaction karena bukan bagian dari database
          // tapi masih dalam executeComplexOperation untuk error handling terintegrasi
          const client = await clerkClient()
          await client.users.updateUserMetadata(id, {
            publicMetadata: {
              role: user.role,
              status: user.status,
            },
          })

          return {
            user,
            action: existingUser ? 'updated' : 'created',
          }
        })

        return new Response(
          JSON.stringify({
            message:
              result.action === 'updated'
                ? 'User berhasil diupdate'
                : 'User baru berhasil dibuat',
            user: result.user,
          }),
          {
            status: result.action === 'updated' ? 200 : 201,
            headers: { 'Content-Type': 'application/json' },
          }
        )
      } catch (error) {
        console.error('Error processing user:', error)
        Sentry.captureException(error, {
          tags: {
            component: 'webhook-clerk',
            action: 'process-user',
            eventType,
          },
          contexts: {
            userInfo: {
              clerkUserId: id,
              email,
            },
          },
        })
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
        await executeComplexOperation(async (tx) => {
          return await tx.user.delete({
            where: { clerkUserId: evt.data.id },
          })
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
        Sentry.captureException(error, {
          tags: {
            component: 'webhook-clerk',
            action: 'delete-user',
            eventType,
          },
          contexts: {
            userInfo: {
              clerkUserId: evt.data.id,
            },
          },
        })
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
    Sentry.captureException(error, {
      tags: {
        component: 'webhook-clerk',
        action: 'unexpected-error',
      },
    })
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
