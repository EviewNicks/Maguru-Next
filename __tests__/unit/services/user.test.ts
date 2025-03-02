import { PrismaClient } from '@prisma/client'
import { getUserStats } from '@/features/dashboard/service/stats'
import { processChartData } from '@/features/dashboard/service/charts'

jest.mock('@prisma/client')

const mockPrisma = {
  user: {
    findMany: jest.fn(),
    count: jest.fn(),
  },
  $transaction: jest.fn(),
}

describe('User Service Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(PrismaClient as jest.Mock).mockImplementation(() => mockPrisma)
  })

  describe('getUserStats', () => {
    it('should calculate user statistics correctly', async () => {
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
      ]

      // Mock database calls
      mockPrisma.user.count.mockResolvedValueOnce(2) // total users
      mockPrisma.user.findMany
        .mockResolvedValueOnce(users) // new users this month
        .mockResolvedValueOnce([users[0]]) // active admins

      const stats = await getUserStats()

      expect(stats).toEqual({
        totalUsers: 2,
        newUsers: 2,
        activeAdmins: 1,
      })
    })

    it('should handle empty database', async () => {
      // Mock empty database
      mockPrisma.user.count.mockResolvedValueOnce(0)
      mockPrisma.user.findMany
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])

      const stats = await getUserStats()

      expect(stats).toEqual({
        totalUsers: 0,
        newUsers: 0,
        activeAdmins: 0,
      })
    })
  })

  describe('processChartData', () => {
    it('should process user data into monthly chart data', async () => {
      const today = new Date()
      const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1)
      const twoMonthsAgo = new Date(
        today.getFullYear(),
        today.getMonth() - 2,
        1
      )

      const users = [
        { createdAt: today },
        { createdAt: today },
        { createdAt: lastMonth },
        { createdAt: twoMonthsAgo },
      ]

      mockPrisma.user.findMany.mockResolvedValueOnce(users)

      const chartData = await processChartData()

      expect(chartData).toHaveLength(6) // Last 6 months
      expect(chartData[0].count).toBe(2) // Current month
      expect(chartData[1].count).toBe(1) // Last month
      expect(chartData[2].count).toBe(1) // Two months ago
    })

    it('should handle no users', async () => {
      mockPrisma.user.findMany.mockResolvedValueOnce([])

      const chartData = await processChartData()

      expect(chartData).toHaveLength(6)
      expect(chartData.every((data) => data.count === 0)).toBe(true)
    })

    it('should group users by month correctly', async () => {
      const date = new Date()
      const users = Array.from({ length: 5 }, (_, i) => ({
        createdAt: new Date(date.getFullYear(), date.getMonth() - i, 1),
      }))

      mockPrisma.user.findMany.mockResolvedValueOnce(users)

      const chartData = await processChartData()

      expect(chartData).toHaveLength(6)
      expect(chartData[0].count).toBe(1) // Current month
      expect(chartData[1].count).toBe(1) // Last month
      expect(chartData[2].count).toBe(1) // Two months ago
      expect(chartData[3].count).toBe(1) // Three months ago
      expect(chartData[4].count).toBe(1) // Four months ago
    })
  })
})
