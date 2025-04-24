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
  // Default role jika tidak ditemukan
  const DEFAULT_ROLE = 'mahasiswa'

  // Cek cache terlebih dahulu
  const cachedRole = roleCache.get(userId)
  if (cachedRole) {
    return cachedRole
  }

  try {
    // Jika tidak ada di cache, ambil dari database
    const user = await prismaClient.user.findUnique({
      where: { clerkUserId: userId },
      select: { role: true },
    })

    // Jika user tidak ditemukan atau tidak memiliki role, gunakan default
    const role = user?.role || DEFAULT_ROLE

    // Simpan ke cache untuk digunakan selanjutnya
    roleCache.set(userId, role)

    return role
  } catch (error) {
   // Log error dan gunakan default role
   Sentry.captureException(error, {
    tags: { component: 'getUserRole', userId },
  })
    // Dalam kasus error, gunakan default role
    return DEFAULT_ROLE
  }
}

/**
 * Invalidasi cache user ketika role diubah
 * @param userId - Clerk user ID
 */
export function invalidateUserRoleCache(userId: string): void {
  roleCache.delete(userId)
}

/**
 * Invalidasi semua cache role
 * Gunakan saat migrasi database atau perubahan massal
 */
export function clearAllRoleCache(): void {
  roleCache.clear()
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
