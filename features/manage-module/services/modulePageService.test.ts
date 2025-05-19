import { modulePageService } from './modulePageService'
import { ContentBlockType } from '../types/modulePageSchema'

// Mock prisma client (seharusnya mock dari @/lib/prisma, bukan @prisma/client langsung)
jest.mock('@/lib/prisma', () => {
  const mockPrismaClient = {
    modulePage: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    module: {
      findUnique: jest.fn(),
    },
  }

  return {
    __esModule: true,
    default: mockPrismaClient,
  }
})

// Import mocked prisma
import prisma from '@/lib/prisma'

describe('modulePageService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  // Sample data for tests
  const moduleId = '123e4567-e89b-12d3-a456-426614174000'
  const pageId = '123e4567-e89b-12d3-a456-426614174001'
  const mockPage = {
    id: pageId,
    moduleId,
    title: 'Test Page',
    order: 1,
    content: JSON.stringify([
      {
        type: ContentBlockType.TEXT,
        content: 'This is a test content',
      },
    ]),
    createdAt: new Date(),
    updatedAt: new Date(),
    version: 1,
  }

  const mockCreateInput = {
    moduleId,
    title: 'New Test Page',
    order: 2,
    blocks: [
      {
        type: ContentBlockType.TEXT,
        content: 'New test content',
      },
    ],
  }

  const mockUpdateInput = {
    title: 'Updated Test Page',
    blocks: [
      {
        type: ContentBlockType.TEXT,
        content: 'Updated content',
      },
    ],
  }

  describe('createModulePage', () => {
    it('should create a new module page', async () => {
      // Mock implementation
      ;(prisma.module.findUnique as jest.Mock).mockResolvedValue({
        id: moduleId,
      })
      ;(prisma.modulePage.create as jest.Mock).mockResolvedValue({
        ...mockPage,
        title: mockCreateInput.title,
        content: JSON.stringify(mockCreateInput.blocks),
      })

      // Call the service method
      const result = await modulePageService.createModulePage(mockCreateInput)

      // Assertions
      expect(prisma.module.findUnique).toHaveBeenCalledWith({
        where: { id: moduleId },
      })
      expect(prisma.modulePage.create).toHaveBeenCalledWith({
        data: {
          moduleId,
          title: mockCreateInput.title,
          order: mockCreateInput.order,
          content: expect.any(String), // JSON string of blocks
        },
      })
      expect(result).toEqual({
        success: true,
        data: expect.objectContaining({
          id: expect.any(String),
          title: mockCreateInput.title,
          moduleId,
          blocks: mockCreateInput.blocks,
        }),
      })
    })

    it('should throw error if module does not exist', async () => {
      // Mock implementation
      ;(prisma.module.findUnique as jest.Mock).mockResolvedValue(null)

      // Call and assertions
      await expect(
        modulePageService.createModulePage(mockCreateInput)
      ).rejects.toThrow('Modul tidak ditemukan')

      expect(prisma.module.findUnique).toHaveBeenCalledWith({
        where: { id: moduleId },
      })
      expect(prisma.modulePage.create).not.toHaveBeenCalled()
    })
  })

  describe('getModulePages', () => {
    it('should return list of pages for a module', async () => {
      // Mock implementation
      ;(prisma.modulePage.findMany as jest.Mock).mockResolvedValue([mockPage])
      ;(prisma.modulePage.count as jest.Mock).mockResolvedValue(1)

      // Call the service method
      const result = await modulePageService.getModulePages(moduleId)

      // Assertions
      expect(prisma.modulePage.findMany).toHaveBeenCalledWith({
        where: { moduleId },
        orderBy: { order: 'asc' },
        skip: 0,
        take: 10,
      })
      expect(result).toEqual({
        success: true,
        data: [
          expect.objectContaining({
            id: pageId,
            title: mockPage.title,
            blocks: expect.any(Array),
          }),
        ],
        meta: {
          currentPage: 1,
          pageSize: 10,
          totalItems: 1,
          totalPages: 1,
        },
      })
    })

    it('should handle pagination correctly', async () => {
      // Mock implementation
      ;(prisma.modulePage.findMany as jest.Mock).mockResolvedValue([mockPage])
      ;(prisma.modulePage.count as jest.Mock).mockResolvedValue(25)

      // Call the service method
      const result = await modulePageService.getModulePages(moduleId, {
        page: 2,
        limit: 10,
      })

      // Assertions
      expect(prisma.modulePage.findMany).toHaveBeenCalledWith({
        where: { moduleId },
        orderBy: { order: 'asc' },
        skip: 10,
        take: 10,
      })
      expect(result.meta).toEqual({
        currentPage: 2,
        pageSize: 10,
        totalItems: 25,
        totalPages: 3,
      })
    })
  })

  describe('getModulePage', () => {
    it('should return a module page by id', async () => {
      // Mock implementation
      ;(prisma.modulePage.findUnique as jest.Mock).mockResolvedValue(mockPage)

      // Call the service method
      const result = await modulePageService.getModulePage(pageId)

      // Assertions
      expect(prisma.modulePage.findUnique).toHaveBeenCalledWith({
        where: { id: pageId },
      })
      expect(result).toEqual({
        success: true,
        data: expect.objectContaining({
          id: pageId,
          title: mockPage.title,
          blocks: expect.any(Array),
        }),
      })
    })

    it('should return null if page does not exist', async () => {
      // Mock implementation
      ;(prisma.modulePage.findUnique as jest.Mock).mockResolvedValue(null)

      // Call the service method
      const result = await modulePageService.getModulePage('nonexistent-id')

      // Assertions
      expect(result).toBeNull()
    })
  })

  describe('updateModulePage', () => {
    it('should update a module page', async () => {
      // Mock implementation
      ;(prisma.modulePage.findUnique as jest.Mock).mockResolvedValue(mockPage)
      ;(prisma.modulePage.update as jest.Mock).mockResolvedValue({
        ...mockPage,
        title: mockUpdateInput.title,
        content: JSON.stringify(mockUpdateInput.blocks),
        updatedAt: new Date(),
      })

      // Call the service method
      const result = await modulePageService.updateModulePage(
        pageId,
        mockUpdateInput
      )

      // Assertions
      expect(prisma.modulePage.findUnique).toHaveBeenCalledWith({
        where: { id: pageId },
      })
      expect(prisma.modulePage.update).toHaveBeenCalledWith({
        where: { id: pageId },
        data: {
          title: mockUpdateInput.title,
          content: expect.any(String),
          version: { increment: 1 },
        },
      })
      expect(result).toEqual({
        success: true,
        data: expect.objectContaining({
          id: pageId,
          title: mockUpdateInput.title,
          blocks: mockUpdateInput.blocks,
        }),
      })
    })

    it('should return null if page does not exist', async () => {
      // Mock implementation
      ;(prisma.modulePage.findUnique as jest.Mock).mockResolvedValue(null)

      // Call the service method
      const result = await modulePageService.updateModulePage(
        'nonexistent-id',
        mockUpdateInput
      )

      // Assertions
      expect(result).toBeNull()
    })
  })

  describe('deleteModulePage', () => {
    it('should delete a module page', async () => {
      // Mock implementation
      ;(prisma.modulePage.findUnique as jest.Mock).mockResolvedValue(mockPage)
      ;(prisma.modulePage.delete as jest.Mock).mockResolvedValue(mockPage)

      // Call the service method
      const result = await modulePageService.deleteModulePage(pageId)

      // Assertions
      expect(prisma.modulePage.delete).toHaveBeenCalledWith({
        where: { id: pageId },
      })
      expect(result).toBe(true)
    })

    it('should return false if page does not exist', async () => {
      // Mock implementation
      ;(prisma.modulePage.findUnique as jest.Mock).mockResolvedValue(null)

      // Call the service method
      const result = await modulePageService.deleteModulePage('nonexistent-id')

      // Assertions
      expect(result).toBe(false)
    })
  })
})
