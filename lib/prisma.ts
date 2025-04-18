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
  })
}

const prisma = globalForPrisma.prisma || prismaClientSingleton()

// Logging untuk query dinonaktifkan untuk mengurangi output log
// Aktifkan kembali hanya untuk keperluan debugging

export default prisma

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
