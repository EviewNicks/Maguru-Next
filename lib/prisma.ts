import { PrismaClient } from '@/prisma/app/generated/prisma/client'

// Debugging info
console.log('Prisma file loaded')
console.log('Environment:', process.env.NODE_ENV)
console.log('Node version:', process.version)
console.log('Is browser?', typeof window !== 'undefined')
console.log('Database URL length:', process.env.DATABASE_URL?.length || 0)

// Tambahkan deklarasi global untuk TypeScript
declare global {
  // ESLint menyarankan untuk tidak menggunakan var, tapi dalam kasus ini
  // kita harus menggunakan var karena itu adalah cara TypeScript
  // mendefinisikan properti pada objek global
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined
}

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

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? prismaClientSingleton()

// Setup event listener untuk query
// @ts-expect-error - Prisma event types are not correctly exposed
prisma.$on('query', (e: { query: string; duration: number }) => {
  console.log('Query:', e.query)
  console.log('Duration:', e.duration + 'ms')
})

export default prisma

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
