import { PATCH, DELETE } from './route'
import prisma from '@/lib/prisma'
import { auth } from '@clerk/nextjs/server'
import { NextRequest } from 'next/server'

// Mock dependencies
jest.mock('@/lib/prisma', () => ({
  __esModule: true,
  default: {
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}))

jest.mock('@clerk/nextjs/server', () => ({
  auth: jest.fn(),
}))

describe('User Detail API', () => {
  const mockUserId = 'user_123'
  const mockUser = {
    id: '1',
    name: 'Test User',
    email: 'test@example.com',
    role: 'mahasiswa',
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(auth as jest.Mock).mockResolvedValue({ userId: mockUserId })
  })

  describe('PATCH /api/users/[userId]', () => {
    const createRequest = (body: any) =>
      new NextRequest('http://localhost:3000/api/users/1', {
        method: 'PATCH',
        body: JSON.stringify(body),
      })

    const mockContext = {
      params: Promise.resolve({ userId: '1' }),
    }

    it('updates user successfully', async () => {
      const updateData = {
        name: 'Updated Name',
        role: 'admin' as const,
        status: 'active' as const,
      }

      ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser)
      ;(prisma.user.update as jest.Mock).mockResolvedValue({
        ...mockUser,
        ...updateData,
      })

      const response = await PATCH(createRequest(updateData), mockContext)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual({
        data: { ...mockUser, ...updateData },
        message: 'User updated successfully',
      })
    })

    it('handles concurrent modifications', async () => {
      const updateData = {
        name: 'Updated Name',
        lastKnownUpdate: new Date(2024, 0, 1).toISOString(), // Older date
      }

      ;(prisma.user.findUnique as jest.Mock).mockResolvedValue({
        ...mockUser,
        updatedAt: new Date(), // Newer date
      })

      const response = await PATCH(createRequest(updateData), mockContext)
      const data = await response.json()

      expect(response.status).toBe(409)
      expect(data.error.code).toBe('CONCURRENT_MODIFICATION')
    })

    it('returns 401 for unauthorized access', async () => {
      ;(auth as jest.Mock).mockResolvedValue({ userId: null })

      const response = await PATCH(createRequest({ name: 'Test' }), mockContext)

      expect(response.status).toBe(401)
      expect(await response.json()).toEqual({
        error: { code: 'UNAUTHORIZED', message: 'Unauthorized' },
      })
    })

    it('returns 404 when user not found', async () => {
      ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(null)

      const response = await PATCH(createRequest({ name: 'Test' }), mockContext)

      expect(response.status).toBe(404)
      expect(await response.json()).toEqual({
        error: { code: 'NOT_FOUND', message: 'User not found' },
      })
    })

    it('validates input data', async () => {
      const response = await PATCH(
        createRequest({ role: 'invalid_role' }),
        mockContext
      )

      expect(response.status).toBe(400)
      expect(await response.json()).toHaveProperty(
        'error.code',
        'VALIDATION_ERROR'
      )
    })

    it('handles database errors gracefully', async () => {
      ;(prisma.user.findUnique as jest.Mock).mockRejectedValue(
        new Error('Database error')
      )

      const response = await PATCH(createRequest({ name: 'Test' }), mockContext)

      expect(response.status).toBe(500)
      expect(await response.json()).toEqual({
        error: 'Internal Server Error',
      })
    })
  })

  describe('DELETE /api/users/[userId]', () => {
    const createRequest = () =>
      new NextRequest('http://localhost:3000/api/users/1', {
        method: 'DELETE',
      })

    const mockContext = {
      params: Promise.resolve({ userId: '1' }),
    }

    it('deletes user successfully', async () => {
      ;(prisma.user.delete as jest.Mock).mockResolvedValue(mockUser)

      const response = await DELETE(createRequest(), mockContext)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual({ message: 'User deleted successfully' })
      expect(prisma.user.delete).toHaveBeenCalledWith({
        where: { id: '1' },
      })
    })

    it('returns 401 for unauthorized access', async () => {
      ;(auth as jest.Mock).mockResolvedValue({ userId: null })

      const response = await DELETE(createRequest(), mockContext)

      expect(response.status).toBe(401)
      expect(await response.json()).toEqual({ error: 'Unauthorized' })
    })

    it('returns 404 when user not found', async () => {
      ;(prisma.user.delete as jest.Mock).mockRejectedValue({
        code: 'P2025',
      })

      const response = await DELETE(createRequest(), mockContext)

      expect(response.status).toBe(404)
      expect(await response.json()).toEqual({ error: 'User not found' })
    })

    it('handles database errors gracefully', async () => {
      ;(prisma.user.delete as jest.Mock).mockRejectedValue(
        new Error('Database error')
      )

      const response = await DELETE(createRequest(), mockContext)

      expect(response.status).toBe(500)
      expect(await response.json()).toEqual({
        error: 'Internal Server Error',
      })
    })
  })
})
