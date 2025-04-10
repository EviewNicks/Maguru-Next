import { jest } from '@jest/globals'
import { NextRequest } from 'next/server'
import { auth, clerkClient } from '@/__tests__/__mocks__/@clerk/nextjs/server'
import {
  prisma,
  createMockUser,
  MockUser,
  MockPrismaError,
} from '@/__tests__/__mocks__/prisma'
import { PATCH, DELETE } from './route'
import { UserRole, UserStatus } from '@prisma/client'

// Tipe untuk parameter context
type MockContext = {
  params: Promise<{
    userId: string
  }>
}

// Mock modules
jest.mock('@/lib/prisma', () => prisma)
jest.mock('@clerk/nextjs/server', () => ({
  auth,
  clerkClient,
}))

const mockUserId = '1'
const mockUser: MockUser = createMockUser({
  id: '1',
  clerkUserId: 'clerk_1',
  email: 'test@example.com',
  name: 'Test User',
  role: 'mahasiswa',
  status: 'active',
  createdAt: new Date(),
  updatedAt: new Date(),
})

const mockContext: MockContext = {
  params: Promise.resolve({ userId: '1' }),
}

describe('User API Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.mocked(auth).mockReturnValue({ userId: mockUserId })
  })

  describe('PATCH /api/users/[userId]', () => {
    const createRequest = (body: Record<string, unknown>) =>
      new NextRequest('http://localhost:3000/api/users/1', {
        method: 'PATCH',
        body: JSON.stringify(body),
      })

    const updateData = {
      name: 'Updated Name',
      role: 'admin' as UserRole,
      status: 'active' as UserStatus,
    }

    it('updates user successfully', async () => {
      jest.mocked(prisma.user.findUnique).mockResolvedValue({
        ...mockUser,
        name: 'Updated Name',
        role: 'admin',
        status: 'active',
      })
      jest.mocked(prisma.user.update).mockResolvedValue({
        ...mockUser,
        name: 'Updated Name',
        role: 'admin',
        status: 'active',
      })

      const response = await PATCH(createRequest(updateData), mockContext)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual(expect.objectContaining(updateData))
    })

    it('returns 401 for unauthorized access', async () => {
      jest.mocked(auth).mockReturnValue({ userId: null })

      const response = await PATCH(createRequest({ name: 'Test' }), mockContext)

      expect(response.status).toBe(401)
      expect(await response.json()).toEqual({ error: 'Unauthorized' })
    })

    it('validates input data', async () => {
      const response = await PATCH(
        createRequest({ role: 'invalid_role' }),
        mockContext
      )

      expect(response.status).toBe(400)
      expect(await response.json()).toHaveProperty('error')
    })
  })

  describe('DELETE /api/users/[userId]', () => {
    const createRequest = () =>
      new NextRequest('http://localhost:3000/api/users/1', {
        method: 'DELETE',
      })

    it('deletes user successfully', async () => {
      jest.mocked(prisma.user.delete).mockResolvedValue(mockUser)

      const response = await DELETE(createRequest(), mockContext)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual({ message: 'User deleted successfully' })
      expect(prisma.user.delete).toHaveBeenCalledWith({
        where: { id: '1' },
      })
    })

    it('returns 401 for unauthorized access', async () => {
      jest.mocked(auth).mockReturnValue({ userId: null })

      const response = await DELETE(createRequest(), mockContext)

      expect(response.status).toBe(401)
      expect(await response.json()).toEqual({ error: 'Unauthorized' })
    })

    it('returns 404 when user not found', async () => {
      const mockPrismaError: MockPrismaError = {
        code: 'P2025',
      }
      jest.mocked(prisma.user.delete).mockRejectedValue(mockPrismaError)

      const response = await DELETE(createRequest(), mockContext)

      expect(response.status).toBe(404)
      expect(await response.json()).toEqual({ error: 'User not found' })
    })

    it('handles database errors gracefully', async () => {
      const mockDatabaseError = new Error('Database error')
      jest.mocked(prisma.user.delete).mockRejectedValue(mockDatabaseError)

      const response = await DELETE(createRequest(), mockContext)

      expect(response.status).toBe(500)
      expect(await response.json()).toEqual({
        error: 'Internal Server Error',
      })
    })
  })
})
