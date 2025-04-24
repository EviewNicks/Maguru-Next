import { LRUCache } from 'lru-cache'

// Cache untuk middleware tanpa PrismaClient
export const roleCache = new LRUCache<string, string>({
  max: 1000,
  ttl: 60_000,
})

// Perbaiki type any
interface SessionClaims {
  metadata?: {
    role?: string
    [key: string]: unknown
  }
  [key: string]: unknown
}

// Helper function untuk mendapatkan role dari Session Claims
export function getRoleFromClaims(
  sessionClaims: SessionClaims | null | undefined
): string {
  if (!sessionClaims) return 'mahasiswa'

  const role = sessionClaims.metadata?.role
  return typeof role === 'string' ? role : 'mahasiswa'
}
