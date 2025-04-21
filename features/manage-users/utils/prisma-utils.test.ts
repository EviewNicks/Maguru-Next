import { describe, it, expect, beforeEach } from '@jest/globals'
import {
  batchUpdateUsers,
  updateUserWithHistory,
  executeComplexOperation,
  getOptimizedUsers,
  setupPrismaMiddleware,
} from './prisma-utils'
import { UserRole, UserStatus } from '@/prisma/generated/client'
import { prismaMock } from '@/singleton'
import { Prisma } from '@/prisma/generated/client'

// Tipe untuk query Prisma dalam test
// interface PrismaQuery {
//   where?: Record<string, unknown>
//   skip?: number
//   take?: number
//   select?: Record<string, boolean>
//   orderBy?: Record<string, string>
// }

describe('batchUpdateUsers', () => {
  it('should update multiple users in a single query', async () => {
    // Arrange
    const userIds = ['user1', 'user2', 'user3']
    const updateData = { status: UserStatus.active }
    const expectedResult = { count: 3 }

    // Mock prisma updateMany
    prismaMock.user.updateMany.mockResolvedValue(expectedResult)

    // Act
    const result = await batchUpdateUsers(userIds, updateData)

    // Assert
    expect(prismaMock.user.updateMany).toHaveBeenCalledWith({
      where: { id: { in: userIds } },
      data: updateData,
    })
    expect(result).toEqual(expectedResult)
    expect(prismaMock.user.updateMany).toHaveBeenCalledTimes(1)
  })

  it('should handle empty user IDs array', async () => {
    // Arrange
    const emptyUserIds: string[] = []
    const updateData = { status: UserStatus.inactive }
    const expectedResult = { count: 0 }

    // Mock prisma updateMany
    prismaMock.user.updateMany.mockResolvedValue(expectedResult)

    // Act
    const result = await batchUpdateUsers(emptyUserIds, updateData)

    // Assert
    expect(prismaMock.user.updateMany).toHaveBeenCalledWith({
      where: { id: { in: emptyUserIds } },
      data: updateData,
    })
    expect(result.count).toBe(0)
    expect(prismaMock.user.updateMany).toHaveBeenCalledTimes(1)
  })
})

describe('updateUserWithHistory', () => {
  it('should update user data in a transaction', async () => {
    // Arrange
    const userId = 'user123'
    const userData = {
      name: 'John Updated',
      role: UserRole.mahasiswa,
    }
    const changedBy = 'admin123'

    const existingUser = {
      id: userId,
      name: 'John',
      email: 'john@example.com',
      role: UserRole.mahasiswa,
      status: UserStatus.active,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const updatedUser = {
      ...existingUser,
      name: 'John Updated',
      role: UserRole.mahasiswa,
      updatedAt: new Date(),
    }

    // Mock transaction execution dan hasilnya
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    prismaMock.$transaction.mockImplementation((callback: any) => {
      if (typeof callback === 'function') {
        // Mock prisma client untuk digunakan dalam transaksi
        const transactionClient = {
          user: {
            findUnique: jest.fn().mockResolvedValue(existingUser),
            update: jest.fn().mockResolvedValue(updatedUser),
          },
        }
        // Execute callback dengan mocked transaction client
        return Promise.resolve(
          callback(transactionClient as unknown as Prisma.TransactionClient)
        )
      }
      return Promise.resolve([])
    })

    // Act
    const result = await updateUserWithHistory(userId, userData, changedBy)

    // Assert
    expect(result).toEqual(updatedUser)
    // Transaksi seharusnya dipanggil tepat sekali
    expect(prismaMock.$transaction).toHaveBeenCalledTimes(1)
  })

  it('should throw error if user not found', async () => {
    // Arrange
    const userId = 'nonexistent'
    const userData = { name: 'John Updated' }
    const changedBy = 'admin123'

    // Mock transaction execution
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    prismaMock.$transaction.mockImplementation((callback: any) => {
      if (typeof callback === 'function') {
        // Mock prisma client untuk digunakan dalam transaksi
        const transactionClient = {
          user: {
            findUnique: jest.fn().mockResolvedValue(null),
            update: jest.fn(),
          },
        }
        // Execute callback dengan mocked transaction client
        return Promise.resolve(
          callback(transactionClient as unknown as Prisma.TransactionClient)
        ).catch((error) => Promise.reject(error))
      }
      return Promise.resolve([])
    })

    // Act & Assert
    await expect(
      updateUserWithHistory(userId, userData, changedBy)
    ).rejects.toThrow(`User dengan ID ${userId} tidak ditemukan`)

    // Transaksi seharusnya dipanggil tepat sekali
    expect(prismaMock.$transaction).toHaveBeenCalledTimes(1)
  })
})

describe('executeComplexOperation', () => {
  it('should execute callback function within a transaction', async () => {
    // Arrange
    const expectedResult = {
      success: true,
      data: [
        { id: 'user1', name: 'User One' },
        { id: 'user2', name: 'User Two' },
      ],
    }

    // Mock callback function
    const mockCallback = jest.fn().mockResolvedValue(expectedResult)

    // Mock transaction execution

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    prismaMock.$transaction.mockImplementation(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (callback: any) => {
        if (typeof callback === 'function') {
          // Mock transaction client
          const transactionClient = {
            user: {
              findMany: jest.fn().mockResolvedValue(expectedResult.data),
            },
          }
          // Execute callback dengan mocked transaction client
          return Promise.resolve(
            callback(transactionClient as unknown as Prisma.TransactionClient)
          )
        }
        return Promise.resolve([])
      }
    )

    // Act
    const result = await executeComplexOperation(mockCallback)

    // Assert
    expect(result).toEqual(expectedResult)
    expect(mockCallback).toHaveBeenCalledTimes(1)
    expect(prismaMock.$transaction).toHaveBeenCalledTimes(1)
    // Verifikasi bahwa options maxWait dan timeout diteruskan
    expect(prismaMock.$transaction).toHaveBeenCalledWith(expect.any(Function), {
      maxWait: 5000,
      timeout: 10000,
    })
  })

  it('should propagate errors from callback function', async () => {
    // Arrange
    const testError = new Error('Test transaction error')

    // Mock callback function yang melempar error
    const mockCallback = jest.fn().mockRejectedValue(testError)

    // Mock transaction execution

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    prismaMock.$transaction.mockImplementation(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (callback: any) => {
        if (typeof callback === 'function') {
          // Pass the mock transaction client
          const transactionClient = {}
          // Execute callback, dan propagate error
          return Promise.resolve(
            callback(transactionClient as unknown as Prisma.TransactionClient)
          ).catch((error) => Promise.reject(error))
        }
        return Promise.resolve([])
      }
    )

    // Act & Assert
    await expect(executeComplexOperation(mockCallback)).rejects.toThrow(
      'Test transaction error'
    )

    expect(mockCallback).toHaveBeenCalledTimes(1)
    expect(prismaMock.$transaction).toHaveBeenCalledTimes(1)
  })

  it('should handle complex database operations successfully', async () => {
    // Arrange
    const userId = 'user123'
    const newRole = UserRole.mahasiswa
    const newStatus = UserStatus.active

    // Setup hasil yang diharapkan
    const updatedUser = {
      id: userId,
      role: newRole,
      status: newStatus,
      email: 'user@example.com',
      name: 'Test User',
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const relatedData = [
      { id: 'data1', userId, type: 'log' },
      { id: 'data2', userId, type: 'history' },
    ]

    // Final result yang diharapkan
    const expectedResult = {
      user: updatedUser,
      relatedData,
    }

    // Mock transaction execution

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    prismaMock.$transaction.mockImplementation(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (callback: any) => {
        if (typeof callback === 'function') {
          // Mock transaction client dengan operasi kompleks
          const transactionClient = {
            user: {
              update: jest.fn().mockResolvedValue(updatedUser),
              findUnique: jest.fn().mockResolvedValue({
                ...updatedUser,
                role: UserRole.admin,
                status: UserStatus.pending,
              }),
            },
            // Misalkan ada model lain untuk related data
            userLog: {
              findMany: jest.fn().mockResolvedValue(relatedData),
            },
          }

          // Buat complex operation callback
          const complexCallback = async (tx: Prisma.TransactionClient) => {
            // Simulasi penggunaan tx untuk update user dan get related data
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const user = await (tx as any).user.update({
              where: { id: userId },
              data: { role: newRole, status: newStatus },
            })

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const relatedData = await (tx as any).userLog.findMany({
              where: { userId },
            })

            return { user, relatedData }
          }

          // Execute custom callback sebagai ganti callback yang diberikan
          return Promise.resolve(
            complexCallback(
              transactionClient as unknown as Prisma.TransactionClient
            )
          )
        }
        return callback
        // return Promise.resolve([callback])
      }
    )

    // Act
    const result = await executeComplexOperation(async (tx) => {
      // Gunakan tx untuk update user dan get related data
      const user = await tx.user.update({
        where: { id: userId },
        data: { role: newRole, status: newStatus },
      })

      // Anggap ada model related data
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const relatedData = await (tx as any).userLog.findMany({
        where: { userId },
      })

      return { user, relatedData }
    })

    // Assert
    expect(result).toEqual(expectedResult)
    expect(prismaMock.$transaction).toHaveBeenCalledTimes(1)
    expect(prismaMock.$transaction).toHaveBeenCalledWith(expect.any(Function), {
      maxWait: 5000,
      timeout: 10000,
    })
  })
})

describe('getOptimizedUsers', () => {
  beforeEach(() => {
    // Reset mock untuk setiap test case
    jest.clearAllMocks()
  })

  it('should retrieve users with pagination and filter by role', async () => {
    // Arrange
    const options = {
      page: 1,
      limit: 10,
      role: UserRole.mahasiswa,
    }

    const mockUsers = [
      {
        id: 'user1',
        clerkUserId: 'clerk_user1',
        name: 'User One',
        email: 'user1@example.com',
        role: UserRole.mahasiswa,
        status: UserStatus.active,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'user2',
        clerkUserId: 'clerk_user2',
        name: 'User Two',
        email: 'user2@example.com',
        role: UserRole.mahasiswa,
        status: UserStatus.active,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]

    const mockCount = 2
    const mockResult = [mockCount, mockUsers]

    // Setup mock untuk array queries
    prismaMock.$transaction.mockReset()
    prismaMock.$transaction.mockResolvedValue(mockResult)

    // Mock untuk count query
    prismaMock.user.count.mockResolvedValue(mockCount)

    // Mock untuk findMany query
    prismaMock.user.findMany.mockResolvedValue(mockUsers)

    // Act
    const result = await getOptimizedUsers(options)

    // Assert
    expect(result).toEqual(mockResult)
    expect(prismaMock.$transaction).toHaveBeenCalledTimes(1)

    // Verifikasi bahwa $transaction dipanggil dengan array yang berisi query
    const transactionArg = prismaMock.$transaction.mock.calls[0][0]
    expect(Array.isArray(transactionArg)).toBe(true)
    expect(transactionArg.length).toBe(2)

    // Verifikasi bahwa count dipanggil dengan filter yang benar
    expect(prismaMock.user.count).toHaveBeenCalledWith({
      where: { role: UserRole.mahasiswa },
    })

    // Verifikasi bahwa findMany dipanggil dengan parameter yang benar
    expect(prismaMock.user.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { role: UserRole.mahasiswa },
        skip: 0, // (page-1) * limit = (1-1) * 10 = 0
        take: 10,
      })
    )
  })

  it('should apply status filter correctly', async () => {
    // Arrange
    const options = {
      page: 2,
      limit: 5,
      status: UserStatus.active,
    }

    const mockUsers = [
      {
        id: 'user3',
        clerkUserId: 'clerk_user3',
        name: 'User Three',
        email: 'user3@example.com',
        role: UserRole.mahasiswa,
        status: UserStatus.active,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]

    const mockCount = 6 // Total 6 active users
    const mockResult = [mockCount, mockUsers]

    // Setup mock untuk array queries
    prismaMock.$transaction.mockReset()
    prismaMock.$transaction.mockResolvedValue(mockResult)

    // Mock untuk count query
    prismaMock.user.count.mockResolvedValue(mockCount)

    // Mock untuk findMany query
    prismaMock.user.findMany.mockResolvedValue(mockUsers)

    // Act
    const result = await getOptimizedUsers(options)

    // Assert
    expect(result).toEqual(mockResult)

    // Verifikasi bahwa count dipanggil dengan filter yang benar
    expect(prismaMock.user.count).toHaveBeenCalledWith({
      where: { status: UserStatus.active },
    })

    // Verifikasi bahwa findMany dipanggil dengan parameter yang benar
    expect(prismaMock.user.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { status: UserStatus.active },
        skip: 5, // (page-1) * limit = (2-1) * 5 = 5
        take: 5,
      })
    )
  })

  it('should apply search term filter correctly', async () => {
    // Arrange
    const options = {
      page: 1,
      limit: 10,
      searchTerm: 'john',
    }

    const mockUsers = [
      {
        id: 'user4',
        clerkUserId: 'clerk_user4',
        name: 'John Doe',
        email: 'john@example.com',
        role: UserRole.mahasiswa,
        status: UserStatus.active,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]

    const mockCount = 1
    const mockResult = [mockCount, mockUsers]

    // Setup mock untuk array queries
    prismaMock.$transaction.mockReset()
    prismaMock.$transaction.mockResolvedValue(mockResult)

    // Mock untuk count query
    prismaMock.user.count.mockResolvedValue(mockCount)

    // Mock untuk findMany query
    prismaMock.user.findMany.mockResolvedValue(mockUsers)

    // Act
    const result = await getOptimizedUsers(options)

    // Assert
    expect(result).toEqual(mockResult)

    // Verifikasi bahwa count dipanggil dengan filter yang benar
    expect(prismaMock.user.count).toHaveBeenCalledWith({
      where: {
        OR: [
          { name: { contains: 'john', mode: 'insensitive' } },
          { email: { contains: 'john', mode: 'insensitive' } },
        ],
      },
    })

    // Verifikasi bahwa findMany dipanggil dengan parameter yang benar
    expect(prismaMock.user.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          OR: [
            { name: { contains: 'john', mode: 'insensitive' } },
            { email: { contains: 'john', mode: 'insensitive' } },
          ],
        },
      })
    )
  })

  it('should handle multiple filters simultaneously', async () => {
    // Arrange
    const options = {
      page: 1,
      limit: 10,
      role: UserRole.mahasiswa,
      status: UserStatus.active,
      searchTerm: 'doe',
    }

    const mockUsers = [
      {
        id: 'user5',
        clerkUserId: 'clerk_user5',
        name: 'John Doe',
        email: 'john@example.com',
        role: UserRole.mahasiswa,
        status: UserStatus.active,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]

    const mockCount = 1
    const mockResult = [mockCount, mockUsers]

    // Setup mock untuk array queries
    prismaMock.$transaction.mockReset()
    prismaMock.$transaction.mockResolvedValue(mockResult)

    // Mock untuk count query
    prismaMock.user.count.mockResolvedValue(mockCount)

    // Mock untuk findMany query
    prismaMock.user.findMany.mockResolvedValue(mockUsers)

    // Act
    const result = await getOptimizedUsers(options)

    // Assert
    expect(result).toEqual(mockResult)

    // Verifikasi bahwa count dipanggil dengan filter yang benar
    expect(prismaMock.user.count).toHaveBeenCalledWith({
      where: {
        role: UserRole.mahasiswa,
        status: UserStatus.active,
        OR: [
          { name: { contains: 'doe', mode: 'insensitive' } },
          { email: { contains: 'doe', mode: 'insensitive' } },
        ],
      },
    })

    // Verifikasi bahwa findMany dipanggil dengan parameter yang benar
    expect(prismaMock.user.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          role: UserRole.mahasiswa,
          status: UserStatus.active,
          OR: [
            { name: { contains: 'doe', mode: 'insensitive' } },
            { email: { contains: 'doe', mode: 'insensitive' } },
          ],
        },
      })
    )
  })

  it('should use default pagination values when not provided', async () => {
    // Arrange
    const options = {} // No options provided

    const mockUsers = [
      {
        id: 'user6',
        clerkUserId: 'clerk_user6',
        name: 'Default User',
        email: 'default@example.com',
        role: UserRole.mahasiswa,
        status: UserStatus.active,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]

    const mockCount = 1
    const mockResult = [mockCount, mockUsers]

    // Setup mock untuk array queries
    prismaMock.$transaction.mockReset()
    prismaMock.$transaction.mockResolvedValue(mockResult)

    // Mock untuk count query
    prismaMock.user.count.mockResolvedValue(mockCount)

    // Mock untuk findMany query
    prismaMock.user.findMany.mockResolvedValue(mockUsers)

    // Act
    const result = await getOptimizedUsers(options)

    // Assert
    expect(result).toEqual(mockResult)

    // Verifikasi bahwa count dipanggil dengan filter kosong
    expect(prismaMock.user.count).toHaveBeenCalledWith({
      where: {},
    })

    // Verifikasi bahwa findMany dipanggil dengan parameter default
    expect(prismaMock.user.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {},
        skip: 0, // (1-1) * 10 = 0
        take: 10,
      })
    )
  })

  describe('setupPrismaMiddleware', () => {
    beforeEach(() => {
      // Reset mock untuk setiap test case
      jest.clearAllMocks()

      // Mock console.warn
      console.warn = jest.fn()

      // Reset mocks untuk Date.now
      jest.spyOn(Date, 'now').mockReset()
    })

    it('should add middleware that detects slow queries', async () => {
      // Arrange
      // Mock Date.now untuk mengontrol waktu eksekusi
      const dateSpy = jest.spyOn(Date, 'now')
      dateSpy.mockReturnValueOnce(1000) // startTime
      dateSpy.mockReturnValueOnce(1501) // endTime (durasi 501ms)

      // Setup prisma mock untuk $use
      prismaMock.$use.mockImplementation(() => {
        // Pastikan middleware ditambahkan ke Prisma Client
        return prismaMock
      })

      // Act
      const result = setupPrismaMiddleware()

      // Assert
      // Verifikasi bahwa middleware ditambahkan ke Prisma client
      expect(prismaMock.$use).toHaveBeenCalledTimes(1)
      expect(result).toBe(prismaMock)

      // Ambil callback middleware yang ditambahkan
      const middlewareCallback = prismaMock.$use.mock.calls[0][0]

      // Simulasikan pemanggilan middleware dengan next function
      const params = { 
        model: 'User', 
        action: 'findMany',
        args: {},
        dataPath: [],
        runInTransaction: false
      } as Prisma.MiddlewareParams

      const next = jest.fn().mockResolvedValue({ id: 1, name: 'Test User' })

      // Panggil middleware
      await middlewareCallback(params, next)

      // Verifikasi bahwa next dipanggil dengan parameter yang benar
      expect(next).toHaveBeenCalledWith(params)

      // Verifikasi bahwa console.warn dipanggil untuk query lambat (> 500ms)
      expect(console.warn).toHaveBeenCalledWith(
        'Query lambat terdeteksi (501ms): User.findMany'
      )
    })

    it('should not log warning for fast queries', async () => {
      // Arrange
      // Mock Date.now untuk mengontrol waktu eksekusi
      const dateSpy = jest.spyOn(Date, 'now')
      dateSpy.mockReturnValueOnce(1000) // startTime
      dateSpy.mockReturnValueOnce(1200) // endTime (durasi 200ms)

      // Setup prisma mock untuk $use
      prismaMock.$use.mockImplementation(() => {
        return prismaMock
      })

      // Act
      setupPrismaMiddleware()

      // Ambil callback middleware yang ditambahkan
      const middlewareCallback = prismaMock.$use.mock.calls[0][0]

      // Simulasikan pemanggilan middleware dengan next function
      const params = { 
        model: 'User', 
        action: 'findUnique',
        args: {},
        dataPath: [],
        runInTransaction: false
      } as Prisma.MiddlewareParams

      const next = jest.fn().mockResolvedValue({ id: 1, name: 'Test User' })

      // Panggil middleware
      await middlewareCallback(params, next)

      // Verifikasi bahwa next dipanggil dengan parameter yang benar
      expect(next).toHaveBeenCalledWith(params)

      // Verifikasi bahwa console.warn tidak dipanggil untuk query cepat (< 500ms)
      expect(console.warn).not.toHaveBeenCalled()
    })

    it('should return the result from next function', async () => {
      // Arrange
      const mockResult = { id: 1, name: 'Test User' }

      // Mock Date.now untuk mengontrol waktu eksekusi
      jest
        .spyOn(Date, 'now')
        .mockReturnValueOnce(1000) // startTime
        .mockReturnValueOnce(1100) // endTime (durasi 100ms)

      // Setup prisma mock untuk $use
      prismaMock.$use.mockImplementation(() => {
        return prismaMock
      })

      // Act
      setupPrismaMiddleware()

      // Ambil callback middleware yang ditambahkan
      const middlewareCallback = prismaMock.$use.mock.calls[0][0]

      // Simulasikan pemanggilan middleware dengan next function yang mengembalikan result
      const params = { 
        model: 'User', 
        action: 'findUnique',
        args: {},
        dataPath: [],
        runInTransaction: false
      } as Prisma.MiddlewareParams

      const next = jest.fn().mockResolvedValue(mockResult)

      // Panggil middleware dan ambil hasilnya
      const result = await middlewareCallback(params, next)

      // Verifikasi bahwa hasil dari next function dikembalikan
      expect(result).toEqual(mockResult)
    })
  })
})
