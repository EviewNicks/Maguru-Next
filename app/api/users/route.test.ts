import { GET, POST } from './route'
import prisma from '@/lib/prisma'
import { auth, currentUser } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

// Mock dependencies
jest.mock('@/lib/prisma', () => ({
  __esModule: true,
  default: {
    user: {
      findMany: jest.fn(),
      count: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  },
}))

jest.mock('@clerk/nextjs/server', () => ({
  auth: jest.fn(),
  currentUser: jest.fn(),
}))

describe('Users API', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET /api/users', () => {
    const mockUserId = 'user_123'
    const mockUsers = [
      {
        id: '1',
        name: 'Test User',
        email: 'test@example.com',
        role: 'mahasiswa',
        status: 'active',
        createdAt: new Date(),
      },
    ]

    beforeEach(() => {
      // Mock auth to return userId
      ;(auth as jest.Mock).mockResolvedValue({ userId: mockUserId })
    })

    it('returns users with pagination', async () => {
      // Mock database calls
      ;(prisma.user.findMany as jest.Mock).mockResolvedValue(mockUsers)
      ;(prisma.user.count as jest.Mock).mockResolvedValue(1)

      // Create request with query params
      const request = new Request(
        'http://localhost:3000/api/users?page=1&limit=10'
      )

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual({
        users: mockUsers,
        metadata: {
          total: 1,
          page: 1,
          limit: 10,
        },
      })
    })

    it('handles search parameters correctly', async () => {
      // Mock database calls
      ;(prisma.user.findMany as jest.Mock).mockResolvedValue(mockUsers)
      ;(prisma.user.count as jest.Mock).mockResolvedValue(1)

      const request = new Request(
        'http://localhost:3000/api/users?search=test&role=mahasiswa&status=active'
      )

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(prisma.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: [
              { name: { contains: 'test', mode: 'insensitive' } },
              { email: { contains: 'test', mode: 'insensitive' } },
            ],
            role: 'mahasiswa',
            status: 'active',
          }),
        })
      )
    })

    it('returns 401 for unauthorized access', async () => {
      // Mock auth to return no userId
      ;(auth as jest.Mock).mockResolvedValue({ userId: null })

      const request = new Request('http://localhost:3000/api/users')
      const response = await GET(request)

      expect(response.status).toBe(401)
      expect(await response.json()).toEqual({ error: 'Unauthorized' })
    })

    it('handles invalid query parameters', async () => {
      ;(auth as jest.Mock).mockResolvedValue({ userId: 'test_user' })

      const request = new Request(
        'http://localhost:3000/api/users?page=invalid'
      )
      const response = await GET(request)

      expect(response.status).toBe(400)
      expect(await response.json()).toHaveProperty('error')
    })

    it('handles database errors gracefully', async () => {
      ;(prisma.user.findMany as jest.Mock).mockRejectedValue(
        new Error('Database error')
      )

      const request = new Request('http://localhost:3000/api/users')
      const response = await GET(request)

      expect(response.status).toBe(500)
      expect(await response.json()).toEqual({
        error: 'Internal Server Error',
      })
    })
  })

  describe('POST /api/users', () => {
    const mockUserId = 'user_123'
    const mockClerkUser = {
      id: mockUserId,
      emailAddresses: [{ emailAddress: 'test@example.com' }],
      firstName: 'Test',
      lastName: 'User',
    }

    beforeEach(() => {
      ;(auth as jest.Mock).mockResolvedValue({ userId: mockUserId })
      ;(currentUser as jest.Mock).mockResolvedValue(mockClerkUser)
    })

    it('creates a new user when they dont exist', async () => {
      // Mock user not found in database
      ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(null)

      const mockCreatedUser = {
        id: '1',
        clerkUserId: mockUserId,
        email: 'test@example.com',
        name: 'Test User',
        role: 'mahasiswa',
        status: 'active',
      }
      ;(prisma.user.create as jest.Mock).mockResolvedValue(mockCreatedUser)

      const response = await POST()
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual(mockCreatedUser)
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          clerkUserId: mockUserId,
          email: 'test@example.com',
          name: 'Test User',
          role: 'mahasiswa',
          status: 'active',
        },
      })
    })

    it('updates existing user', async () => {
      const existingUser = {
        id: '1',
        clerkUserId: mockUserId,
        email: 'old@example.com',
        name: 'Old Name',
      }
      ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(existingUser)

      const updatedUser = {
        ...existingUser,
        email: 'test@example.com',
        name: 'Test User',
      }
      ;(prisma.user.update as jest.Mock).mockResolvedValue(updatedUser)

      const response = await POST()
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual(updatedUser)
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { clerkUserId: mockUserId },
        data: {
          email: 'test@example.com',
          name: 'Test User',
        },
      })
    })

    it('returns 401 for unauthorized access', async () => {
      ;(auth as jest.Mock).mockResolvedValue({ userId: null })

      const response = await POST()

      expect(response.status).toBe(401)
      expect(await response.json()).toEqual({ error: 'Unauthorized' })
    })

    it('returns 404 when clerk user not found', async () => {
      ;(currentUser as jest.Mock).mockResolvedValue(null)

      const response = await POST()

      expect(response.status).toBe(404)
      expect(await response.json()).toEqual({ error: 'User not found' })
    })

    it('handles database errors gracefully', async () => {
      ;(prisma.user.findUnique as jest.Mock).mockRejectedValue(
        new Error('Database error')
      )

      const response = await POST()

      expect(response.status).toBe(500)
      expect(await response.json()).toEqual({
        error: 'Internal Server Error',
      })
    })
  })
})
