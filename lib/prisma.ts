import { PrismaClient } from '@/prisma/generated/client'

const globalForPrisma = global as unknown as { prisma: PrismaClient }

const prismaClientSingleton = () => {
  return new PrismaClient({
    log: [
      { level: 'query', emit: 'event' },
      { level: 'error', emit: 'stdout' },
      { level: 'info', emit: 'stdout' },
      { level: 'warn', emit: 'stdout' },
    ],
  })
}

const prisma = globalForPrisma.prisma || prismaClientSingleton()

// Setup event listener untuk query
// @ts-expect-error - Prisma event types are not correctly exposed
prisma.$on('query', (e: { query: string; duration: number }) => {
  console.log('Query:', e.query)
  console.log('Duration:', e.duration + 'ms')
})

export default prisma

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
