import prisma from '../../../lib/prisma'
import { Prisma, UserRole, UserStatus } from '@/prisma/generated/client'

/**
 * Utilitas untuk batch operations dan transactions dalam Prisma
 */

/**
 * Melakukan batch update pada user
 * @param userIds - Array ID user yang akan diupdate
 * @param data - Data yang akan diupdate
 * @returns Promise dengan hasil update
 */
export async function batchUpdateUsers(
  userIds: string[],
  data: Prisma.UserUpdateManyMutationInput
) {
  return await prisma.user.updateMany({
    where: {
      id: { in: userIds },
    },
    data,
  })
}

/**
 * Melakukan update user dengan atomic transaction
 * @param userId - ID user yang akan diupdate
 * @param data - Data user yang akan diupdate
 * @param changedBy - ID user yang melakukan perubahan (untuk audit trail)
 * @returns Promise dengan user yang sudah diupdate
 */
export async function updateUserWithHistory(
  userId: string,
  data: Prisma.UserUpdateInput,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  changedBy: string // Digunakan untuk audit trail (saat ini dikomentari)
) {
  return await prisma.$transaction(async (tx) => {
    // Ambil data user lama
    const oldUser = await tx.user.findUnique({
      where: { id: userId },
    })

    if (!oldUser) {
      throw new Error(`User dengan ID ${userId} tidak ditemukan`)
    }

    // Update user
    const updatedUser = await tx.user.update({
      where: { id: userId },
      data,
    })

    // Log perubahan dalam transaction yang sama
    // Contoh implementasi jika memiliki model userHistory
    /* 
    await tx.userHistory.create({
      data: {
        userId,
        changedBy,
        oldData: JSON.stringify(oldUser),
        newData: JSON.stringify(updatedUser)
      }
    })
    */

    return updatedUser
  })
}

/**
 * Melakukan operasi kompleks dengan transaction interactive
 * @param callback - Function berisi operasi database yang akan dijalankan dalam transaction
 * @returns Promise dengan hasil callback
 */
export async function executeComplexOperation<T>(
  callback: (tx: Prisma.TransactionClient) => Promise<T>
) {
  return await prisma.$transaction(
    async (tx) => {
      return await callback(tx)
    },
    {
      maxWait: 5000, // 5 detik maksimum waktu tunggu
      timeout: 10000, // 10 detik maksimum waktu transaction
    }
  )
}

/**
 * Melakukan select yang optimal dengan memilih field yang spesifik
 * @param options - Opsi query termasuk filter dan pagination
 * @returns Promise dengan hasil query user
 */
export async function getOptimizedUsers(options: {
  page?: number
  limit?: number
  role?: UserRole
  status?: UserStatus
  searchTerm?: string
}) {
  const { page = 1, limit = 10, role, status, searchTerm } = options
  const skip = (page - 1) * limit

  const where: Prisma.UserWhereInput = {}

  if (role) {
    where.role = role
  }

  if (status) {
    where.status = status
  }

  if (searchTerm) {
    where.OR = [
      { name: { contains: searchTerm, mode: 'insensitive' } },
      { email: { contains: searchTerm, mode: 'insensitive' } },
    ]
  }

  return await prisma.$transaction([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
        // Hanya pilih field yang diperlukan
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
  ])
}

/**
 * Update Prisma client untuk mendeteksi dan mencatat query lambat
 */
export function setupPrismaMiddleware() {
  // Tentukan threshold berdasarkan environment
  // Di development, kita toleransi waktu yang lebih lama
  // Di production, kita lebih ketat
  const slowQueryThreshold = process.env.NODE_ENV === 'production' ? 500 : 1000

  prisma.$use(async (params, next) => {
    const startTime = Date.now()
    const result = await next(params)
    const endTime = Date.now()
    const duration = endTime - startTime

    // Log query yang memakan waktu lebih dari threshold
    if (duration > slowQueryThreshold) {
      console.warn(
        `Query lambat terdeteksi (${duration}ms): ${params.model}.${params.action}`
      )
    }

    return result
  })

  return prisma
}
