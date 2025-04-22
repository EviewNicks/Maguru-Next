import { PrismaClient } from '@prisma/client'
import { mockDeep, DeepMockProxy } from 'jest-mock-extended'
import * as Sentry from '@sentry/nextjs'

// Mock dependencies
jest.mock('@/lib/prisma', () => ({
  __esModule: true,
  default: mockDeep<PrismaClient>(),
}))

jest.mock('@clerk/nextjs/server', () => ({
  auth: jest.fn(),
  clerkClient: jest.fn().mockImplementation(() => ({
    users: {
      updateUserMetadata: jest.fn(),
    },
  })),
}))

jest.mock('@sentry/nextjs', () => ({
  captureException: jest.fn(),
}))

jest.mock('next/server', () => {
  const originalModule = jest.requireActual('next/server')
  return {
    ...originalModule,
    NextResponse: {
      json: jest.fn().mockImplementation((data, options) => {
        return {
          status: options?.status || 200,
          json: async () => data,
        }
      }),
    },
  }
})

// Import handler setelah mock
import { GET, POST } from './route'
import prisma from '@/lib/prisma'
import { auth, clerkClient } from '@clerk/nextjs/server'

const prismaMock = prisma as unknown as DeepMockProxy<PrismaClient>

describe('Sync Metadata API Handler', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET handler (sync all users to Clerk)', () => {
    it('should sync all user metadata from database to Clerk', async () => {
      // Setup mocks
      const mockUsers = [
        {
          id: '1',
          clerkUserId: 'user_123',
          role: 'admin',
          status: 'active',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '2',
          clerkUserId: 'user_456',
          role: 'dosen',
          status: 'active',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]

      // Mock authentication
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      jest.mocked(auth).mockResolvedValue({ userId: 'auth_user_123' } as any)

      // Mock database query
      prismaMock.user.findMany.mockResolvedValue(mockUsers)

      // Mock Clerk client
      const mockClerkClient = await clerkClient()
      jest

        .mocked(mockClerkClient.users.updateUserMetadata)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .mockResolvedValue({} as any)

      // Execute the handler
      const response = await GET()
      const responseData = await response.json()

      // Assertions
      expect(response.status).toBe(200)
      expect(responseData.success).toBe(true)
      expect(responseData.results).toHaveLength(2)
      expect(mockClerkClient.users.updateUserMetadata).toHaveBeenCalledTimes(2)
      expect(mockClerkClient.users.updateUserMetadata).toHaveBeenCalledWith(
        'user_123',
        {
          publicMetadata: {
            role: 'admin',
            status: 'active',
          },
        }
      )
    })

    it('should return 401 when user is not authenticated', async () => {
      // Mock authentication to return no user
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      jest.mocked(auth).mockResolvedValue({ userId: null } as any)

      // Execute the handler
      const response = await GET()
      const responseData = await response.json()

      // Assertions
      expect(response.status).toBe(401)
      expect(responseData).toEqual({ error: 'Unauthorized' })
      expect(prismaMock.user.findMany).not.toHaveBeenCalled()
    })

    it('should handle database errors', async () => {
      // Mock authentication
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      jest.mocked(auth).mockResolvedValue({ userId: 'auth_user_123' } as any)

      // Mock database query to throw error
      const mockError = new Error('Database connection error')
      prismaMock.user.findMany.mockRejectedValue(mockError)

      // Execute the handler
      const response = await GET()
      const responseData = await response.json()

      // Assertions
      expect(response.status).toBe(500)
      expect(responseData.error).toBe('Gagal menyinkronisasi metadata')
      expect(Sentry.captureException).toHaveBeenCalledWith(mockError)
    })
  })

  describe('POST handler (sync single user to Clerk)', () => {
    it('should sync current user metadata from database to Clerk', async () => {
      // Setup mocks
      const mockUser = {
        id: '1',
        clerkUserId: 'user_123',
        role: 'admin',
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      // Mock authentication
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      jest.mocked(auth).mockResolvedValue({ userId: 'user_123' } as any)

      // Mock database query
      prismaMock.user.findUnique.mockResolvedValue(mockUser)

      // Mock Clerk client
      const mockClerkClient = await clerkClient()
      jest
        .mocked(mockClerkClient.users.updateUserMetadata)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .mockResolvedValue({} as any)

      // Execute the handler
      const response = await POST()
      const responseData = await response.json()

      // Assertions
      expect(response.status).toBe(200)
      expect(responseData.success).toBe(true)
      expect(responseData.metadata).toEqual({
        role: 'admin',
        status: 'active',
      })
      expect(mockClerkClient.users.updateUserMetadata).toHaveBeenCalledWith(
        'user_123',
        {
          publicMetadata: {
            role: 'admin',
            status: 'active',
          },
        }
      )
    })

    it('should return 401 when user is not authenticated', async () => {
      // Mock authentication to return no user
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      jest.mocked(auth).mockResolvedValue({ userId: null } as any)

      // Execute the handler
      const response = await POST()
      const responseData = await response.json()

      // Assertions
      expect(response.status).toBe(401)
      expect(responseData).toEqual({ error: 'Unauthorized' })
      expect(prismaMock.user.findUnique).not.toHaveBeenCalled()
    })

    it('should return 404 when user is not found in database', async () => {
      // Mock authentication
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      jest.mocked(auth).mockResolvedValue({ userId: 'user_123' } as any)

      // Mock database query to return null
      prismaMock.user.findUnique.mockResolvedValue(null)

      // Execute the handler
      const response = await POST()
      const responseData = await response.json()

      // Assertions
      expect(response.status).toBe(404)
      expect(responseData).toEqual({ error: 'User not found' })
    })

    it('should handle Clerk API errors', async () => {
      // Mock authentication
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      jest.mocked(auth).mockResolvedValue({ userId: 'user_123' } as any)

      // Mock database query
      prismaMock.user.findUnique.mockResolvedValue({
        id: '1',
        clerkUserId: 'user_123',
        role: 'admin',
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      // Mock Clerk client to throw error
      const mockError = new Error('Clerk API error')
      const mockClerkClient = await clerkClient()
      jest
        .mocked(mockClerkClient.users.updateUserMetadata)
        .mockRejectedValue(mockError)

      // Execute the handler
      const response = await POST()
      const responseData = await response.json()

      // Assertions
      expect(response.status).toBe(500)
      expect(responseData.error).toBe('Gagal menyinkronisasi metadata')
      expect(Sentry.captureException).toHaveBeenCalledWith(mockError)
    })
  })
})
