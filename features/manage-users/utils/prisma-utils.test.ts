import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { PrismaClient } from '@prisma/client'
import { mockDeep, mockReset } from 'vitest-mock-extended'
import {
  batchUpdateUsers,
  updateUserWithHistory,
  executeComplexOperation,
  getOptimizedUsers,
  setupPrismaMiddleware,
} from './prisma-utils'

// Mock Prisma Client
vi.mock('../../../lib/prisma', () => {
  return {
    __esModule: true,
    default: mockDeep<PrismaClient>(),
  }
})

// Import prisma setelah mock
import prisma from '../../../lib/prisma'

describe('Prisma Client Optimization Tests', () => {
  beforeEach(() => {
    mockReset(prisma)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('batchUpdateUsers', () => {
    it('should update multiple users in a single query', async () => {
      // Arrange
      const userIds = ['user1', 'user2', 'user3']
      const updateData = { status: 'active' }
      const mockResult = { count: 3 }

      // Mock prisma updateMany
      prisma.user.updateMany.mockResolvedValue(mockResult)

      // Act
      const result = await batchUpdateUsers(userIds, updateData)

      // Assert
      expect(prisma.user.updateMany).toHaveBeenCalledWith({
        where: { id: { in: userIds } },
        data: updateData,
      })
      expect(result).toEqual(mockResult)
      expect(prisma.user.updateMany).toHaveBeenCalledTimes(1)
    })
  })

  describe('updateUserWithHistory', () => {
    it('should update user with transaction', async () => {
      // Arrange
      const userId = 'user1'
      const updateData = { name: 'Updated Name' }
      const changedBy = 'admin1'
      const oldUser = { id: userId, name: 'Old Name' }
      const updatedUser = { id: userId, name: 'Updated Name' }

      // Mock transaction
      prisma.$transaction.mockImplementation(async (callback) => {
        // Mock transaction client
        const tx = {
          user: {
            findUnique: vi.fn().mockResolvedValue(oldUser),
            update: vi.fn().mockResolvedValue(updatedUser),
          },
        }
        return callback(tx)
      })

      // Act
      const result = await updateUserWithHistory(userId, updateData, changedBy)

      // Assert
      expect(prisma.$transaction).toHaveBeenCalled()
      expect(result).toEqual(updatedUser)
    })

    it('should throw error if user not found', async () => {
      // Arrange
      const userId = 'nonexistent'
      const updateData = { name: 'Updated Name' }
      const changedBy = 'admin1'

      // Mock transaction
      prisma.$transaction.mockImplementation(async (callback) => {
        // Mock transaction client
        const tx = {
          user: {
            findUnique: vi.fn().mockResolvedValue(null),
          },
        }
        return callback(tx)
      })

      // Act & Assert
      await expect(
        updateUserWithHistory(userId, updateData, changedBy)
      ).rejects.toThrow(`User dengan ID ${userId} tidak ditemukan`)
    })
  })

  describe('executeComplexOperation', () => {
    it('should execute callback in transaction with timeout options', async () => {
      // Arrange
      const mockCallback = vi.fn().mockResolvedValue({ success: true })
      const expectedOptions = {
        maxWait: 5000,
        timeout: 10000,
      }

      // Act
      await executeComplexOperation(mockCallback)

      // Assert
      expect(prisma.$transaction).toHaveBeenCalledWith(
        expect.any(Function),
        expectedOptions
      )
      expect(mockCallback).toHaveBeenCalled()
    })

    it('should return callback result', async () => {
      // Arrange
      const expectedResult = { data: 'test' }
      const mockCallback = vi.fn().mockResolvedValue(expectedResult)

      // Mock transaction
      prisma.$transaction.mockImplementation(async (callback, _options) => {
        const tx = mockDeep<PrismaClient>()
        return callback(tx)
      })

      // Act
      const result = await executeComplexOperation(mockCallback)

      // Assert
      expect(result).toEqual(expectedResult)
    })
  })

  describe('getOptimizedUsers', () => {
    it('should query users with optimized select fields', async () => {
      // Arrange
      const options = {
        page: 1,
        limit: 10,
        role: 'admin',
        status: 'active',
        searchTerm: 'test',
      }
      const mockCount = 5
      const mockUsers = [{ id: 'user1', name: 'Test User' }]

      // Mock transaction
      prisma.$transaction.mockResolvedValue([mockCount, mockUsers])

      // Act
      const result = await getOptimizedUsers(options)

      // Assert
      expect(prisma.$transaction).toHaveBeenCalled()
      expect(result).toEqual([mockCount, mockUsers])

      // Verify correct where clause construction
      const transactionCallback = prisma.$transaction.mock.calls[0][0]
      expect(Array.isArray(transactionCallback)).toBe(true)
      expect(transactionCallback).toHaveLength(2)
    })

    it('should apply search filters correctly', async () => {
      // Arrange
      const options = {
        searchTerm: 'test',
      }
      const mockCount = 3
      const mockUsers = [
        { id: 'user1', name: 'Test User' },
        { id: 'user2', email: 'test@example.com' },
      ]

      // Mock transaction
      prisma.$transaction.mockResolvedValue([mockCount, mockUsers])

      // Act
      const result = await getOptimizedUsers(options)

      // Assert
      expect(result).toEqual([mockCount, mockUsers])
      expect(prisma.$transaction).toHaveBeenCalled()
    })
  })

  describe('setupPrismaMiddleware', () => {
    it('should set up middleware for performance monitoring', () => {
      // Arrange
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      
      // Act
      const result = setupPrismaMiddleware()

      // Assert
      expect(prisma.$use).toHaveBeenCalled()
      expect(result).toBe(prisma)

      // Cleanup
      consoleSpy.mockRestore()
    })

    it('should log slow queries', async () => {
      // Arrange
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      
      // Mock $use to execute middleware
      prisma.$use.mockImplementation((middleware) => {
        // Simulate middleware execution with a slow query
        const startTime = Date.now() - 600 // 600ms ago
        const params = { model: 'User', action: 'findMany' }
        const next = vi.fn().mockResolvedValue({ id: 'user1' })
        
        // Execute middleware
        middleware(params, next)
        
        // Simulate time passing
        vi.advanceTimersByTime(600)
        
        return prisma
      })

      // Act
      setupPrismaMiddleware()

      // Assert
      expect(prisma.$use).toHaveBeenCalled()
      
      // Wait for any promises to resolve
      await new Promise(process.nextTick)
      
      // Verify console.warn was called for slow query
      expect(consoleSpy).toHaveBeenCalled()

      // Cleanup
      consoleSpy.mockRestore()
    })
  })
})
