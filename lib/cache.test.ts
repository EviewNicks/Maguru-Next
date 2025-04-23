import { PrismaClient } from '@prisma/client'
import { roleCache, getUserRole, invalidateUserRoles } from './cache'
import * as Sentry from '@sentry/nextjs'

// Jest akan otomatis menggunakan mock dari __tests__/__mocks__/@sentry/nextjs.ts
jest.mock('@sentry/nextjs')

// Mock dependencies
jest.mock('@prisma/client', () => {
  return {
    PrismaClient: jest.fn().mockImplementation(() => ({
      user: {
        findUnique: jest.fn(),
      },
    })),
  }
})

const mockPrisma = new PrismaClient() as jest.Mocked<PrismaClient>

// Spy on cache methods
jest.spyOn(roleCache, 'get')
jest.spyOn(roleCache, 'set')
jest.spyOn(roleCache, 'delete')
jest.spyOn(roleCache, 'clear')

describe('Role Cache Utility', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    roleCache.clear()
  })

  it('should return role from cache if available', async () => {
    // Arrange
    const userId = 'user_123'
    const cachedRole = 'admin'
    roleCache.set(userId, cachedRole)

    // Act
    const result = await getUserRole(userId, mockPrisma)

    // Assert
    expect(roleCache.get).toHaveBeenCalledWith(userId)
    expect(mockPrisma.user.findUnique).not.toHaveBeenCalled()
    expect(result).toBe(cachedRole)
  })

  it('should query database and cache result when cache misses', async () => {
    // Arrange
    const userId = 'user_123'
    const dbRole = 'dosen'
    ;(mockPrisma.user.findUnique as jest.Mock).mockResolvedValue({
      role: dbRole,
    })

    // Act
    const result = await getUserRole(userId, mockPrisma)

    // Assert
    expect(roleCache.get).toHaveBeenCalledWith(userId)
    expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
      where: { clerkUserId: userId },
      select: { role: true },
    })
    expect(roleCache.set).toHaveBeenCalledWith(userId, dbRole)
    expect(result).toBe(dbRole)
  })

  it('should return default role when user not found in database', async () => {
    // Arrange
    const userId = 'nonexistent_user'
    ;(mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(null)

    // Act
    const result = await getUserRole(userId, mockPrisma)

    // Assert
    expect(result).toBe('mahasiswa') // Default role
    expect(roleCache.set).toHaveBeenCalledWith(userId, 'mahasiswa')
  })

  it('should handle database errors and return default role', async () => {
    // Arrange
    const userId = 'error_user'
    const mockError = new Error('Database connection failed')
    ;(mockPrisma.user.findUnique as jest.Mock).mockRejectedValue(mockError)

    // Act
    const result = await getUserRole(userId, mockPrisma)

    // Assert
    expect(Sentry.captureException).toHaveBeenCalledWith(
      mockError,
      expect.objectContaining({
        tags: expect.objectContaining({
          component: 'getUserRole',
          userId: 'error_user',
        }),
      })
    )
    expect(result).toBe('mahasiswa') // Default fallback role
  })

  it('should invalidate specific user roles from cache', async () => {
    // Arrange
    roleCache.set('user1', 'admin')
    roleCache.set('user2', 'dosen')
    roleCache.set('user3', 'mahasiswa')

    // Act
    invalidateUserRoles(['user1', 'user3'])

    // Assert
    expect(roleCache.delete).toHaveBeenCalledWith('user1')
    expect(roleCache.delete).toHaveBeenCalledWith('user3')
    expect(roleCache.delete).not.toHaveBeenCalledWith('user2')

    // Verify cache state
    expect(roleCache.get('user1')).toBeUndefined()
    expect(roleCache.get('user2')).toBe('dosen')
    expect(roleCache.get('user3')).toBeUndefined()
  })

  it('should clear entire cache when no userIds provided', async () => {
    // Arrange
    roleCache.set('user1', 'admin')
    roleCache.set('user2', 'dosen')

    // Act
    invalidateUserRoles()

    // Assert
    expect(roleCache.clear).toHaveBeenCalled()
    expect(roleCache.get('user1')).toBeUndefined()
    expect(roleCache.get('user2')).toBeUndefined()
  })
})
