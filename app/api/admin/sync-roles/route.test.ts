import { PrismaClient } from '@prisma/client'
import { handlePost } from './route' // Asumsi kita akan mengekspor function ini dari route.ts
import { roleCache } from '@/lib/cache'
import * as Sentry from '@sentry/nextjs'

// Mock dependencies
jest.mock('@prisma/client', () => {
  return {
    PrismaClient: jest.fn().mockImplementation(() => ({
      user: {
        update: jest.fn().mockImplementation(({ where, data }) => {
          // Return mock data sesuai dengan yang diharapkan
          return Promise.resolve({
            id: `db_${where.clerkUserId}`,
            clerkUserId: where.clerkUserId,
            role: data.role,
          })
        }),
        findUnique: jest.fn(),
      },
      $transaction: jest.fn((callbacks) => {
        // Pastikan ini mengembalikan array hasil dari semua update
        return Promise.resolve(
          callbacks.map((callback: () => Promise<unknown>) =>
            Promise.resolve(callback())
          )
        )
      }),
    })),
  }
})

// Mock @clerk/nextjs/server modules
jest.mock('@clerk/nextjs/server', () => {
  return {
    auth: jest.fn(),
    clerkClient: jest.fn().mockReturnValue(
      Promise.resolve({
        users: {
          getUserList: jest.fn(),
        },
      })
    ),
  }
})

// Mock untuk next/server
jest.mock('next/server', () => ({
  NextRequest: jest.fn().mockImplementation((url, options) => ({
    url,
    method: options?.method || 'GET',
    json: jest.fn().mockResolvedValue({}),
  })),
  NextResponse: {
    json: jest.fn().mockImplementation((data, options) => {
      return {
        status: options?.status || 200,
        json: async () => data, // Pastikan ini mengembalikan data yang sama persis
      }
    }),
  },
}))

jest.mock('@/lib/cache', () => ({
  roleCache: {
    delete: jest.fn(),
    clear: jest.fn(),
  },
}))

// Jest akan otomatis menggunakan mock dari __tests__/__mocks__/@sentry/nextjs.ts
jest.mock('@sentry/nextjs')

// Import mocked modules after the mocks are set up
import { auth, clerkClient } from '@clerk/nextjs/server'
import { NextRequest } from 'next/server'

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
      { id: 'user_2', publicMetadata: { role: 'mahasiswa' } },
      { id: 'user_3', publicMetadata: {} },
    ]
    const mockClerkInstance = mockClerkClient()
    mockClerkInstance.users.getUserList.mockResolvedValue({
      data: mockUserList,
    })

    // Tambahkan implementasi mockPrisma.$transaction
    const mockResults = [
      { id: 'db_user_1', clerkUserId: 'user_1', role: 'admin' },
      { id: 'db_user_2', clerkUserId: 'user_2', role: 'mahasiswa' },
      { id: 'db_user_3', clerkUserId: 'user_3', role: 'mahasiswa' },
    ]

    ;(mockPrisma.$transaction as jest.Mock).mockResolvedValue(mockResults)
    ;(mockPrisma.user.update as jest.Mock).mockImplementation(
      ({ where, data }) =>
        Promise.resolve({
          id: `db_${where.clerkUserId}`,
          clerkUserId: where.clerkUserId,
          role: data.role,
        })
    )

    // Act
    const response = await handlePost(mockRequest, mockPrisma)
    const responseData = await response.json()

    // Assert
    expect(mockPrisma.$transaction).toHaveBeenCalled()
    expect(mockPrisma.user.update).toHaveBeenCalledTimes(3)

    // We need to check if each user has a proper update call
    // but since the exact format might be different, we check individually
    const updateCalls = (mockPrisma.user.update as jest.Mock).mock.calls

    // First user (admin)
    expect(updateCalls[0][0].where.clerkUserId).toBe('user_1')
    expect(updateCalls[0][0].data.role).toBe('admin')

    // Second user (mahasiswa) - pastikan ini sudah sesuai dengan schema.prisma enum UserRole
    expect(updateCalls[1][0].where.clerkUserId).toBe('user_2')
    expect(updateCalls[1][0].data.role).toBe('mahasiswa')

    // Third user (default mahasiswa)
    expect(updateCalls[2][0].where.clerkUserId).toBe('user_3')
    expect(updateCalls[2][0].data.role).toBe('mahasiswa')

    // Cache should be cleared
    expect(roleCache.clear).toHaveBeenCalled()

    // Response should be successful
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
