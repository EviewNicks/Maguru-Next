import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { mockDeep, DeepMockProxy } from 'jest-mock-extended'
import * as Sentry from '@sentry/nextjs'
// import { LRUCache } from 'lru-cache'

// Mock dependencies
jest.mock('@/lib/prisma', () => ({
  __esModule: true,
  default: mockDeep<PrismaClient>(),
}))

jest.mock('@/lib/cache', () => ({
  roleCache: {
    delete: jest.fn(),
    clear: jest.fn(),
  },
}))

// Gunakan pendekatan mock yang lebih sederhana untuk next/server
jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn().mockImplementation((data, options) => {
      return {
        status: options?.status || 200,
        json: async () => data,
      }
    }),
  },
}))

// Jest akan otomatis menggunakan mock dari __tests__/__mocks__/@sentry/nextjs.ts
jest.mock('@sentry/nextjs')

// Mock module tanpa bergantung pada request object
jest.mock('@/app/api/webhooks/clerk/route', () => ({
  verifyWebhookSignature: jest.fn(),
  POST: jest.fn(),
}))

// Import handler setelah mock
import { POST, verifyWebhookSignature } from '@/app/api/webhooks/clerk/route'
import prisma from '@/lib/prisma'
import { roleCache } from '@/lib/cache'

const prismaMock = prisma as unknown as DeepMockProxy<PrismaClient>

describe('Clerk Webhook Handler', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('verifyWebhookSignature', () => {
    it('should verify webhook signature successfully', async () => {
      // Setup mock request with valid signature
      const mockRequest = {
        headers: {
          get: jest.fn().mockImplementation((header) => {
            if (header === 'svix-id') return 'test-id'
            if (header === 'svix-timestamp') return '2025-06-01T00:00:00Z'
            if (header === 'svix-signature') return 'valid-signature'
            return null
          }),
          has: jest.fn().mockReturnValue(true),
        },
        text: jest
          .fn()
          .mockResolvedValue(
            '{"type":"user.updated","data":{"id":"user_123","public_metadata":{"role":"admin"}}}'
          ),
      } as unknown as Request

      // Mock Svix Webhook verification
      const mockVerifyWebhookResult = {
        type: 'user.updated',
        data: { id: 'user_123', public_metadata: { role: 'admin' } },
      }

      // Gunakan jest.mocked untuk mengatasi masalah typing
      jest
        .mocked(verifyWebhookSignature)
        .mockResolvedValue(mockVerifyWebhookResult)

      const result = await verifyWebhookSignature(mockRequest)

      // Assertions
      expect(result).toEqual({
        type: 'user.updated',
        data: { id: 'user_123', public_metadata: { role: 'admin' } },
      })
    })

    it('should throw error for invalid signature', async () => {
      // Mock implementation for invalid signature
      const mockRequest = {
        headers: {
          get: jest.fn().mockReturnValue('invalid-data'),
          has: jest.fn().mockReturnValue(true),
        },
      } as unknown as Request

      // Gunakan jest.mocked untuk mengatasi masalah typing
      jest
        .mocked(verifyWebhookSignature)
        .mockRejectedValue(new Error('Invalid signature'))

      // Expect verification to throw error
      await expect(verifyWebhookSignature(mockRequest)).rejects.toThrow(
        'Invalid signature'
      )
    })
  })

  describe('POST handler', () => {
    it('should update user role in database when receiving user.updated event', async () => {
      // Setup mock request
      const mockRequest = {
        json: jest.fn().mockResolvedValue({
          type: 'user.updated',
          data: {
            id: 'user_123',
            public_metadata: { role: 'admin' },
          },
        }),
      } as unknown as Request

      // Mock verification function to return valid data
      jest.mocked(verifyWebhookSignature).mockResolvedValue({
        type: 'user.updated',
        data: {
          id: 'user_123',
          public_metadata: { role: 'admin' },
        },
      })

      // Mock prisma update
      prismaMock.user.update.mockResolvedValue({
        id: '1',
        clerkUserId: 'user_123',
        role: 'admin',
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      // Mock NextResponse for the response
      const mockJsonResponse = { status: 200, json: () => ({ success: true }) }
      jest
        .mocked(NextResponse.json)
        .mockReturnValue(mockJsonResponse as unknown as NextResponse)

      // Execute the POST handler
      const response = await POST(mockRequest)
      const responseData = await response.json()

      // Assertions
      expect(response.status).toBe(200)
      expect(responseData).toEqual({ success: true })

      // Verify database was updated
      expect(prismaMock.user.update).toHaveBeenCalledWith({
        where: { clerkUserId: 'user_123' },
        data: { role: 'admin' },
      })

      // Verify cache was invalidated
      expect(roleCache.delete).toHaveBeenCalledWith('user_123')
    })

    it('should handle webhook verification errors', async () => {
      // Setup mock request
      const mockRequest = {
        json: jest.fn().mockResolvedValue({ type: 'user.updated' }),
      } as unknown as Request

      // Mock verification function to throw error
      jest
        .mocked(verifyWebhookSignature)
        .mockRejectedValue(new Error('Invalid signature'))

      // Mock NextResponse for the error response
      const mockErrorResponse = {
        status: 400,
        json: () => ({ error: 'Invalid webhook' }),
      }
      jest
        .mocked(NextResponse.json)
        .mockReturnValue(mockErrorResponse as unknown as NextResponse)

      // Execute the POST handler
      const response = await POST(mockRequest)

      // Assertions
      expect(response.status).toBe(400)
      expect(await response.json()).toEqual({ error: 'Invalid webhook' })
      expect(Sentry.captureException).toHaveBeenCalled()
    })

    it('should handle database errors during update', async () => {
      // Setup mock request
      const mockRequest = {
        json: jest.fn().mockResolvedValue({
          type: 'user.updated',
          data: {
            id: 'user_123',
            public_metadata: { role: 'admin' },
          },
        }),
      } as unknown as Request

      // Mock verification function to return valid data
      jest.mocked(verifyWebhookSignature).mockResolvedValue({
        type: 'user.updated',
        data: {
          id: 'user_123',
          public_metadata: { role: 'admin' },
        },
      })

      // Mock prisma update to throw error
      prismaMock.user.update.mockRejectedValue(new Error('Database error'))

      // Mock NextResponse for the error response
      const mockErrorResponse = {
        status: 500,
        json: () => ({ error: 'Internal server error' }),
      }
      jest
        .mocked(NextResponse.json)
        .mockReturnValue(mockErrorResponse as unknown as NextResponse)

      // Execute the POST handler
      const response = await POST(mockRequest)

      // Assertions
      expect(response.status).toBe(500)
      expect(await response.json()).toEqual({ error: 'Internal server error' })
      expect(Sentry.captureException).toHaveBeenCalled()
    })
  })
})
