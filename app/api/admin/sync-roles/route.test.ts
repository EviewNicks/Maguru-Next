import { NextRequest } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { handlePost } from './route' // Asumsi kita akan mengekspor function ini dari route.ts
import { roleCache } from '@/lib/cache'
import * as Sentry from '@sentry/nextjs'

// Mock dependencies
jest.mock('@prisma/client', () => {
  return {
    PrismaClient: jest.fn().mockImplementation(() => ({
      user: {
        update: jest.fn(),
        findUnique: jest.fn(),
      },
      $transaction: jest.fn((callbacks: Array<() => Promise<unknown>>) =>
        Promise.all(callbacks.map((cb) => cb()))
      ),
    })),
  }
})

// Mock @clerk/nextjs/server modules
jest.mock('@clerk/nextjs/server', () => {
  return {
    auth: jest.fn(),
    clerkClient: jest.fn().mockImplementation(() => ({
      users: {
        getUserList: jest.fn(),
      },
    })),
  }
})

jest.mock('@/lib/cache', () => ({
  roleCache: {
    delete: jest.fn(),
    clear: jest.fn(),
  },
}))

jest.mock('@sentry/nextjs', () => ({
  captureException: jest.fn(),
}))

// Import mocked modules after the mocks are set up
import { auth, clerkClient } from '@clerk/nextjs/server'

const mockPrisma = new PrismaClient() as jest.Mocked<PrismaClient>
const mockAuth = jest.mocked(auth)
const mockClerkClient = jest.fn().mockReturnValue({
  users: {
    getUserList: jest.fn(),
  },
})

// Type assertion for clerkClient mock
jest.mocked(clerkClient).mockImplementation(mockClerkClient)

describe('Manual Sync Roles Endpoint', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should synchronize roles from Clerk to database for all users', async () => {
    // Arrange
    const mockRequest = new NextRequest(
      'https://test.com/api/admin/sync-roles',
      {
        method: 'POST',
      }
    )

    // Mock authenticated admin user
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockAuth.mockResolvedValue({ userId: 'admin_user_123' } as any)
    ;(mockPrisma.user.findUnique as jest.Mock).mockResolvedValue({
      id: 'db_user_1',
      clerkUserId: 'admin_user_123',
      role: 'admin',
    })

    // Mock clerk users
    const mockUserList = [
      { id: 'user_1', publicMetadata: { role: 'admin' } },
      { id: 'user_2', publicMetadata: { role: 'dosen' } },
      { id: 'user_3', publicMetadata: {} }, // No role should default to 'mahasiswa'
    ]
    const mockClerkInstance = mockClerkClient()
    mockClerkInstance.users.getUserList.mockResolvedValue(mockUserList)

    // Mock successful updates
    ;(mockPrisma.user.update as jest.Mock).mockImplementation((params) =>
      Promise.resolve({
        id: `db_${params.where.clerkUserId}`,
        clerkUserId: params.where.clerkUserId,
        role: params.data.role,
      })
    )

    // Act
    const response = await handlePost(mockRequest, mockPrisma)
    const responseData = await response.json()

    // Assert
    expect(mockPrisma.$transaction).toHaveBeenCalled()
    expect(mockPrisma.user.update).toHaveBeenCalledTimes(3)
    expect(mockPrisma.user.update).toHaveBeenCalledWith({
      where: { clerkUserId: 'user_1' },
      data: { role: 'admin' },
    })
    expect(mockPrisma.user.update).toHaveBeenCalledWith({
      where: { clerkUserId: 'user_3' },
      data: { role: 'mahasiswa' }, // Default role
    })
    expect(roleCache.clear).toHaveBeenCalled()
    expect(responseData.success).toBe(true)
    expect(responseData.count).toBe(3)
  })

  it('should reject non-admin users', async () => {
    // Arrange
    const mockRequest = new NextRequest(
      'https://test.com/api/admin/sync-roles',
      {
        method: 'POST',
      }
    )

    // Mock authenticated non-admin user
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockAuth.mockResolvedValue({ userId: 'normal_user_456' } as any)
    ;(mockPrisma.user.findUnique as jest.Mock).mockResolvedValue({
      id: 'db_user_2',
      clerkUserId: 'normal_user_456',
      role: 'mahasiswa',
    })

    // Act
    const response = await handlePost(mockRequest, mockPrisma)
    const responseData = await response.json()

    // Assert
    const mockClerkInstance = mockClerkClient()
    expect(mockClerkInstance.users.getUserList).not.toHaveBeenCalled()
    expect(mockPrisma.user.update).not.toHaveBeenCalled()
    expect(responseData.error).toBe('Forbidden')
    expect(response.status).toBe(403)
  })

  it('should handle database errors and capture them in Sentry', async () => {
    // Arrange
    const mockRequest = new NextRequest(
      'https://test.com/api/admin/sync-roles',
      {
        method: 'POST',
      }
    )

    // Mock authenticated admin user
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockAuth.mockResolvedValue({ userId: 'admin_user_123' } as any)
    ;(mockPrisma.user.findUnique as jest.Mock).mockResolvedValue({
      id: 'db_user_1',
      clerkUserId: 'admin_user_123',
      role: 'admin',
    })

    // Mock clerk users
    const mockUserList = [{ id: 'user_1', publicMetadata: { role: 'admin' } }]
    const mockClerkInstance = mockClerkClient()
    mockClerkInstance.users.getUserList.mockResolvedValue(mockUserList)

    // Mock database transaction failure
    const mockError = new Error('Database transaction failed')
    ;(mockPrisma.$transaction as jest.Mock).mockRejectedValue(mockError)

    // Act
    const response = await handlePost(mockRequest, mockPrisma)
    const responseData = await response.json()

    // Assert
    expect(responseData.error).toBe('Sync failed')
    expect(response.status).toBe(500)
    expect(Sentry.captureException).toHaveBeenCalledWith(
      mockError,
      expect.objectContaining({
        tags: expect.objectContaining({ component: 'sync-roles-admin' }),
      })
    )
  })
})
