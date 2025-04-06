import { jest } from '@jest/globals'
import { UserRole, UserStatus } from '@prisma/client'
import { PrismaClient } from '@prisma/client'

// Tipe untuk metode Prisma
type PrismaUserMethod = 'findUnique' | 'update' | 'delete' | 'findMany'

// Mock untuk Prisma client
export const prisma = {
  user: {
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    findMany: jest.fn(),
  },
} as unknown as PrismaClient

// Tipe untuk mock user
export type MockUser = {
  id: string
  clerkUserId: string
  email: string
  name: string | null
  role: UserRole
  status: UserStatus
  createdAt: Date
  updatedAt: Date
}

// Fungsi utilitas untuk membuat mock user
export function createMockUser(overrides: Partial<MockUser> = {}): MockUser {
  return {
    id: overrides.id || '1',
    clerkUserId: overrides.clerkUserId || 'clerk_1',
    email: overrides.email || 'test@example.com',
    name: overrides.name !== undefined ? overrides.name : 'Test User',
    role: overrides.role || 'mahasiswa',
    status: overrides.status || 'active',
    createdAt: overrides.createdAt || new Date(),
    updatedAt: overrides.updatedAt || new Date(),
  }
}

// Fungsi untuk mocking Prisma client
export const mockPrismaClient = (prismaClient: {
  user: Record<PrismaUserMethod, jest.Mock>
}) => {
  const methods: PrismaUserMethod[] = [
    'findUnique',
    'update',
    'delete',
    'findMany',
  ]
  methods.forEach((method) => {
    ;(prisma.user[method] as unknown) = prismaClient.user[method]
  })
}

// Tipe untuk mock error Prisma
export type MockPrismaError = {
  code: string
}

export default prisma
