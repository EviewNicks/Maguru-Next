import { LRUCache } from 'lru-cache'
import * as Sentry from '@sentry/nextjs'
import prisma from '@/lib/prisma'

/**
 * Cache untuk menyimpan role user selama 60 detik (60,000 ms)
 * Menggunakan LRU (Least Recently Used) strategy
 */
export const roleCache = new LRUCache<string, string>({
  max: 1000, // Maksimal 1000 user dalam cache
  ttl: 60_000, // Time to live: 60 detik
})

/**
 * Helper function untuk mendapatkan role dari cache atau database
 * Menggunakan caching pattern dengan prioritas cache
 * @param userId ID user dari Clerk
 * @param prismaClient Optional prisma client untuk dependency injection dalam testing
 * @returns Role user dalam string
 */
export async function getUserRole(
  userId: string,
  prismaClient = prisma
): Promise<string> {
  // Cek cache terlebih dahulu
  const cachedRole = roleCache.get(userId)
  if (cachedRole) {
    return cachedRole
  }

  // Jika tidak ada di cache, ambil dari database
  try {
    const user = await prismaClient.user.findUnique({
      where: { clerkUserId: userId },
      select: { role: true },
    })

    const role = user?.role || 'mahasiswa'

    // Simpan di cache untuk request berikutnya
    roleCache.set(userId, role)

    return role
  } catch (error) {
    // Log error dan gunakan default role
    Sentry.captureException(error, {
      tags: { component: 'getUserRole', userId },
    })
    return 'mahasiswa' // Default fallback role
  }
}

/**
 * Invalidasi cache untuk list user ID atau semua user
 * @param userIds Opsional array berisi user ID yang perlu diinvalidasi
 */
export function invalidateUserRoles(userIds?: string[]): void {
  // Jika tidak ada userIds, hapus semua cache
  if (!userIds || userIds.length === 0) {
    roleCache.clear()
    return
  }

  // Hapus cache untuk setiap user ID
  userIds.forEach((userId) => {
    roleCache.delete(userId)
  })
}
