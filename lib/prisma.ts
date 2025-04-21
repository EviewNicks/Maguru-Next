import { PrismaClient } from '@/prisma/generated/client'

const globalForPrisma = global as unknown as { prisma: PrismaClient }

const prismaClientSingleton = () => {
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

const prisma = globalForPrisma.prisma || prismaClientSingleton()

// Tambahkan middleware untuk mendeteksi query lambat
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

export default prisma

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
