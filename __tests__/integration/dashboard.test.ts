import { PrismaClient } from '@prisma/client'
import { auth } from '@clerk/nextjs'
import { getUserStats } from '@/features/dashboard/service/stats'
import { processChartData } from '@/features/dashboard/service/charts'
import { GET as getUsers } from '@/app/api/users/route'

jest.mock('@clerk/nextjs')
jest.mock('@prisma/client')

const mockPrisma = {
  user: {
    findMany: jest.fn(),
    count: jest.fn(),
  },
  $transaction: jest.fn(),
}

const mockAuth = auth as jest.Mock

describe('Dashboard Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockAuth.mockResolvedValue({ userId: 'test_admin_id' })
    ;(PrismaClient as jest.Mock).mockImplementation(() => mockPrisma)
  })

  describe('Dashboard Statistics Flow', () => {
    it('should aggregate user statistics correctly', async () => {
      // Mock data
      const users = [
        {
          id: 'user1',
          role: 'admin',
          status: 'active',
          createdAt: new Date(),
        },
        {
          id: 'user2',
          role: 'mahasiswa',
          status: 'active',
          createdAt: new Date(),
        },
        {
          id: 'user3',
          role: 'dosen',
          status: 'inactive',
          createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), // 90 days ago
        },
      ]

      // Mock database calls
      mockPrisma.user.count.mockResolvedValueOnce(3) // total users
      mockPrisma.user.findMany
        .mockResolvedValueOnce([users[0], users[1]]) // new users this month
        .mockResolvedValueOnce([users[0]]) // active admins

      // Get statistics
      const stats = await getUserStats()

      // Verify statistics
      expect(stats.totalUsers).toBe(3)
      expect(stats.newUsers).toBe(2)
      expect(stats.activeAdmins).toBe(1)
    })

    it('should process chart data correctly', async () => {
      // Mock users data for the last 6 months
      const users = Array.from({ length: 6 }, (_, i) => ({
        id: `user${i}`,
        role: 'mahasiswa',
        status: 'active',
        createdAt: new Date(Date.now() - i * 30 * 24 * 60 * 60 * 1000),
      }))

      // Mock database call
      mockPrisma.user.findMany.mockResolvedValueOnce(users)

      // Process chart data
      const chartData = await processChartData()

      // Verify chart data
      expect(chartData).toHaveLength(6) // Last 6 months
      expect(chartData[0].count).toBe(1) // Current month
      expect(chartData[5].count).toBe(1) // 5 months ago
    })
  })

  describe('Dashboard API Integration', () => {
    it('should return user data with correct pagination and filtering', async () => {
      // Mock users data
      const users = Array.from({ length: 15 }, (_, i) => ({
        id: `user${i}`,
        email: `user${i}@example.com`,
        name: `User ${i}`,
        role: i % 3 === 0 ? 'admin' : 'mahasiswa',
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
      }))

      // Mock database calls for paginated results
      mockPrisma.user.findMany.mockResolvedValueOnce(users.slice(0, 10))
      mockPrisma.user.count.mockResolvedValueOnce(15)

      // Request first page
      const req = new Request('http://localhost/api/users?page=1&limit=10')
      const res = await getUsers(req)

      expect(res.status).toBe(200)
      const data = await res.json()

      // Verify pagination
      expect(data.users).toHaveLength(10)
      expect(data.total).toBe(15)
      expect(data.hasMore).toBe(true)

      // Mock database calls for filtered results
      mockPrisma.user.findMany.mockResolvedValueOnce(
        users.filter((u) => u.role === 'admin')
      )
      mockPrisma.user.count.mockResolvedValueOnce(5)

      // Request filtered by role
      const filteredReq = new Request('http://localhost/api/users?role=admin')
      const filteredRes = await getUsers(filteredReq)

      expect(filteredRes.status).toBe(200)
      const filteredData = await filteredRes.json()

      // Verify filtering
      expect(filteredData.users.every((u) => u.role === 'admin')).toBe(true)
      expect(filteredData.total).toBe(5)
    })
  })
})
