import { PrismaClient } from '@prisma/client'
import { auth } from '@clerk/nextjs'
import { GET, POST } from '@/app/api/users/route'
import { PATCH, DELETE } from '@/app/api/users/[userId]/route'
import { getUserStats } from '@/features/dashboard/service/stats'

jest.mock('@clerk/nextjs')
jest.mock('@prisma/client')

const mockPrisma = {
  user: {
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
  $transaction: jest.fn(),
}

const mockAuth = auth as jest.Mock

describe('User Management Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockAuth.mockResolvedValue({ userId: 'test_admin_id' })
    ;(PrismaClient as jest.Mock).mockImplementation(() => mockPrisma)
  })

  describe('Create and List Users Flow', () => {
    it('should create a new user and list it', async () => {
      // Setup mock data
      const newUser = {
        id: 'new_user_id',
        email: 'test@example.com',
        name: 'Test User',
        role: 'mahasiswa',
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      // Mock create user
      mockPrisma.user.create.mockResolvedValueOnce(newUser)
      mockPrisma.user.findMany.mockResolvedValueOnce([newUser])
      mockPrisma.user.count.mockResolvedValueOnce(1)

      // Create user request
      const createReq = new Request('http://localhost/api/users', {
        method: 'POST',
        body: JSON.stringify({
          email: 'test@example.com',
          name: 'Test User',
          role: 'mahasiswa',
        }),
      })

      const createRes = await POST(createReq)
      expect(createRes.status).toBe(201)

      // List users request
      const listReq = new Request('http://localhost/api/users?page=1&limit=10')
      const listRes = await GET(listReq)
      expect(listRes.status).toBe(200)

      const listData = await listRes.json()
      expect(listData.users).toHaveLength(1)
      expect(listData.users[0].email).toBe('test@example.com')
    })
  })

  describe('Update and Delete User Flow', () => {
    it('should update user role and then delete the user', async () => {
      const userId = 'test_user_id'
      const updatedUser = {
        id: userId,
        email: 'test@example.com',
        name: 'Test User',
        role: 'dosen',
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      // Mock update user
      mockPrisma.user.update.mockResolvedValueOnce(updatedUser)

      // Update user request
      const updateReq = new Request(`http://localhost/api/users/${userId}`, {
        method: 'PATCH',
        body: JSON.stringify({
          role: 'dosen',
        }),
      })

      const updateRes = await PATCH(updateReq, { params: { userId } })
      expect(updateRes.status).toBe(200)

      // Mock delete user
      mockPrisma.user.delete.mockResolvedValueOnce(updatedUser)

      // Delete user request
      const deleteReq = new Request(`http://localhost/api/users/${userId}`, {
        method: 'DELETE',
      })

      const deleteRes = await DELETE(deleteReq, { params: { userId } })
      expect(deleteRes.status).toBe(200)
    })
  })

  describe('User Statistics Flow', () => {
    it('should reflect changes in user statistics after CRUD operations', async () => {
      // Mock initial stats
      mockPrisma.user.count.mockResolvedValueOnce(5) // total users
      mockPrisma.user.findMany
        .mockResolvedValueOnce([]) // new users this month
        .mockResolvedValueOnce([]) // active admins

      const initialStats = await getUserStats()
      expect(initialStats.totalUsers).toBe(5)

      // Create new user
      const newUser = {
        id: 'new_user_id',
        email: 'new@example.com',
        name: 'New User',
        role: 'mahasiswa',
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      mockPrisma.user.create.mockResolvedValueOnce(newUser)
      mockPrisma.user.count.mockResolvedValueOnce(6)

      const createReq = new Request('http://localhost/api/users', {
        method: 'POST',
        body: JSON.stringify({
          email: 'new@example.com',
          name: 'New User',
          role: 'mahasiswa',
        }),
      })

      await POST(createReq)

      // Mock updated stats
      mockPrisma.user.count.mockResolvedValueOnce(6)
      mockPrisma.user.findMany
        .mockResolvedValueOnce([newUser]) // new users this month
        .mockResolvedValueOnce([]) // active admins

      const updatedStats = await getUserStats()
      expect(updatedStats.totalUsers).toBe(6)
    })
  })
})
