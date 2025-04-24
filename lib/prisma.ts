import { PrismaClient } from '@/prisma/generated/client'

// Deteksi browser environment
const isServer = typeof window === 'undefined'

const globalForPrisma = isServer
  ? (global as unknown as { prisma: PrismaClient })
  : { prisma: null as unknown as PrismaClient }

const prismaClientSingleton = () => {
  // Hanya jalankan jika di server
  if (!isServer) {
    console.error('PrismaClient dipanggil di browser environment')
    // Return dummy untuk mencegah error runtime
    return {} as PrismaClient
  }

  return new PrismaClient({
    log: [
      // Komentar log query untuk mengurangi output log
      // { level: 'query', emit: 'event' },
      { level: 'error', emit: 'stdout' },
      { level: 'info', emit: 'stdout' },
      { level: 'warn', emit: 'stdout' },
    ],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  })
}

// Pastikan prisma hanya diinisialisasi di server
const prisma = isServer
  ? globalForPrisma.prisma || prismaClientSingleton()
  : ({} as PrismaClient)

// Kondisional untuk middleware dan caching
if (isServer) {
  // Tambahkan middleware hanya jika di server
  prisma.$use(async (params, next) => {
    const startTime = Date.now()
    const result = await next(params)
    const endTime = Date.now()
    const duration = endTime - startTime

    // Log query yang memakan waktu lebih dari 500ms untuk optimasi performa
    if (duration > 500) {
      console.warn(
        `Query lambat terdeteksi (${duration}ms): ${params.model}.${params.action}`
      )
    }

    return result
  })

  // Tambahkan middleware untuk caching sederhana
  const queryCache = new Map()
  prisma.$use(async (params, next) => {
    // Cache hanya untuk operasi find yang tidak memiliki select kompleks
    if (
      params.action === 'findUnique' &&
      (!params.args.select || Object.keys(params.args.select).length === 0)
    ) {
      const cacheKey = `${params.model}-${params.action}-${JSON.stringify(params.args)}`

      // Cek cache
      if (queryCache.has(cacheKey)) {
        return queryCache.get(cacheKey)
      }

      // Lanjutkan query
      const result = await next(params)

      // Simpan ke cache
      if (result) {
        queryCache.set(cacheKey, result)

        // Hapus dari cache setelah 5 detik
        setTimeout(() => {
          queryCache.delete(cacheKey)
        }, 5000)
      }

      return result
    }

    return next(params)
  })

  // Logging untuk query dinonaktifkan untuk mengurangi output log
  // Aktifkan kembali hanya untuk keperluan debugging

  if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
}

export default prisma
