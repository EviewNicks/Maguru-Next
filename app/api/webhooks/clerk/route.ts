'use server'

import { Webhook } from 'svix'
import { NextResponse } from 'next/server'
import * as Sentry from '@sentry/nextjs'
import prisma from '@/lib/prisma'
import { roleCache } from '@/lib/cache'

// Menggunakan type string untuk role tanpa enum
type UserRole = 'mahasiswa' | 'admin'

// Tipe untuk webhook event dari Clerk
interface WebhookEventData {
  type: string
  data: {
    id?: string
    public_metadata?: {
      role?: string
      [key: string]: unknown
    }
    [key: string]: unknown
  }
}

/**
 * Verifikasi signature webhook dari Clerk
 * Memastikan webhook benar-benar berasal dari Clerk
 */
async function verifyWebhookSignature(req: Request): Promise<WebhookEventData> {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET

  if (!WEBHOOK_SECRET) {
    throw new Error('CLERK_WEBHOOK_SECRET is not set')
  }

  // Dapatkan headers yang diperlukan untuk verifikasi
  const svix_id = req.headers.get('svix-id')
  const svix_timestamp = req.headers.get('svix-timestamp')
  const svix_signature = req.headers.get('svix-signature')

  // Validasi headers yang diperlukan
  if (!svix_id || !svix_timestamp || !svix_signature) {
    throw new Error('Missing svix headers')
  }

  // Dapatkan payload dari webhook
  const payload = await req.text()
  const headers = {
    'svix-id': svix_id,
    'svix-timestamp': svix_timestamp,
    'svix-signature': svix_signature,
  }

  // Buat instance Webhook dan verifikasi payload
  const webhook = new Webhook(WEBHOOK_SECRET)
  try {
    return webhook.verify(payload, headers) as WebhookEventData
  } catch (error) {
    Sentry.captureException(error, {
      tags: { component: 'webhook-verification' },
    })
    throw error
  }
}

/**
 * Handler untuk webhook Clerk
 * Memproses event user.updated untuk mengupdate role di database
 */
export async function POST(req: Request) {
  try {
    // Verifikasi webhook signature
    const event = await verifyWebhookSignature(req)
    const { type: eventType, data: eventData } = event

    // Handle user update event (untuk sinkronisasi role)
    if (eventType === 'user.updated') {
      // Extract data yang dibutuhkan dari event
      const { id, public_metadata } = eventData
      if (!id) {
        return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 })
      }

      const userId = id as string
      // Mengambil role dari metadata atau default ke 'mahasiswa'
      const roleValue = (public_metadata?.role as string) || 'mahasiswa'

      try {
        // Validasi role value sesuai UserRole enum
        let role: UserRole
        if (roleValue === 'admin' || roleValue === 'mahasiswa') {
          role = roleValue as UserRole
        } else {
          role = 'mahasiswa' // Default role
          Sentry.captureMessage(
            `Invalid role: ${roleValue}, defaulting to mahasiswa`,
            {
              level: 'warning',
            }
          )
        }

        // Update role di database lokal dengan transaction untuk atomic operation
        await prisma.$transaction(async (tx) => {
          await tx.user.update({
            where: { clerkUserId: userId },
            data: { role },
          })
        })

        // Invalidasi cache untuk user yang diupdate
        roleCache.delete(userId)

        // Log sukses di Sentry untuk monitoring
        Sentry.addBreadcrumb({
          category: 'webhook',
          message: `Updated role for user ${userId} to ${role}`,
          level: 'info',
        })

        return NextResponse.json({ success: true })
      } catch (error) {
        // Tangkap dan log error pada database operation
        Sentry.captureException(error, {
          tags: {
            component: 'webhook-handler',
            userId,
            role: roleValue,
          },
        })
        return NextResponse.json(
          { error: 'Internal server error' },
          { status: 500 }
        )
      }
    }

    // Kembalikan respons sukses untuk event lain
    return NextResponse.json({ success: true })
  } catch (error) {
    // Tangkap error pada verifikasi webhook
    Sentry.captureException(error, {
      tags: { component: 'webhook-handler' },
    })
    return NextResponse.json({ error: 'Invalid webhook' }, { status: 400 })
  }
}
