import { modulePageService } from './modulePageService'
import prisma from '@/lib/prisma'
import { ModulePageStatus, ModuleStatus, StandardEditorContent } from '../types'

// Mock prisma
jest.mock('@/lib/prisma', () => ({
  module: {
    findUnique: jest.fn(),
  },
  modulePage: {
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
  },
  $transaction: jest.fn(),
}))

// Mock logger
jest.mock('./logger', () => ({
  logger: {
    info: jest.fn(),
    debug: jest.fn(),
    error: jest.fn(),
  },
}))

describe('modulePageService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('saveDraft', () => {
    it('should save draft successfully', async () => {
      // Mock data
      const pageId = 'page-123'
      const authorId = 'user-123'
      const draftData = {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [{ type: 'text', text: 'Draft content' }],
          },
        ],
      }

      // Mock Prisma response
      const mockPage = {
        id: pageId,
        moduleId: 'module-123',
        title: 'Test Page',
        order: 1,
        type: 'content',
        content: {
          type: 'doc',
          content: [
            {
              type: 'paragraph',
              content: [{ type: 'text', text: 'Original content' }],
            },
          ],
        },
        version: 1,
        status: ModuleStatus.DRAFT,
        createdAt: new Date(),
        updatedAt: new Date(),
        draftData,
        draftSavedAt: new Date(),
        lastEditBy: authorId,
        hasUnpublishedChanges: true,
        isDraft: true,
      }

      // Setup mocks
      prisma.modulePage.findUnique = jest.fn().mockResolvedValue(mockPage)
      prisma.modulePage.update = jest.fn().mockResolvedValue(mockPage)

      // Execute
      const result = await modulePageService.saveDraft(
        pageId,
        draftData as StandardEditorContent,
        authorId
      )

      // Assert
      expect(prisma.modulePage.findUnique).toHaveBeenCalledWith({
        where: { id: pageId },
      })
      expect(prisma.modulePage.update).toHaveBeenCalledWith({
        where: { id: pageId },
        data: expect.objectContaining({
          draftData,
          lastEditBy: authorId,
          hasUnpublishedChanges: true,
          isDraft: true,
        }),
      })
      expect(result).toEqual({
        success: true,
        data: expect.objectContaining({
          id: pageId,
          draftData,
          hasUnpublishedChanges: true,
          isDraft: true,
        }),
      })
    })

    it('should return null if page not found', async () => {
      // Mock data
      const pageId = 'non-existent-page'
      const authorId = 'user-123'
      const draftData = {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [{ type: 'text', text: 'Draft content' }],
          },
        ],
      }

      // Setup mocks
      prisma.modulePage.findUnique = jest.fn().mockResolvedValue(null)

      // Execute
      const result = await modulePageService.saveDraft(
        pageId,
        draftData as StandardEditorContent,
        authorId
      )

      // Assert
      expect(prisma.modulePage.findUnique).toHaveBeenCalledWith({
        where: { id: pageId },
      })
      expect(prisma.modulePage.update).not.toHaveBeenCalled()
      expect(result).toBeNull()
    })

    it('should handle errors', async () => {
      // Mock data
      const pageId = 'page-123'
      const authorId = 'user-123'
      const draftData = {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [{ type: 'text', text: 'Draft content' }],
          },
        ],
      }

      // Setup mocks
      const mockError = new Error('Database error')
      prisma.modulePage.findUnique = jest.fn().mockResolvedValue({
        id: pageId,
        moduleId: 'module-123',
      })
      prisma.modulePage.update = jest.fn().mockRejectedValue(mockError)

      // Execute & Assert
      await expect(
        modulePageService.saveDraft(
          pageId,
          draftData as StandardEditorContent,
          authorId
        )
      ).rejects.toThrow(mockError)
    })
  })

  describe('getDraft', () => {
    it('should get draft successfully', async () => {
      // Mock data
      const pageId = 'page-123'
      const draftData = {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [{ type: 'text', text: 'Draft content' }],
          },
        ],
      }

      // Mock Prisma response
      const mockPage = {
        id: pageId,
        moduleId: 'module-123',
        title: 'Test Page',
        order: 1,
        type: 'content',
        content: {
          type: 'doc',
          content: [
            {
              type: 'paragraph',
              content: [{ type: 'text', text: 'Original content' }],
            },
          ],
        },
        version: 1,
        status: ModuleStatus.DRAFT,
        createdAt: new Date(),
        updatedAt: new Date(),
        draftData,
        draftSavedAt: new Date(),
        lastEditBy: 'user-123',
        hasUnpublishedChanges: true,
        isDraft: true,
      }

      // Setup mocks
      prisma.modulePage.findUnique = jest.fn().mockResolvedValue(mockPage)

      // Execute
      const result = await modulePageService.getDraft(pageId)

      // Assert
      expect(prisma.modulePage.findUnique).toHaveBeenCalledWith({
        where: { id: pageId },
      })
      expect(result).toEqual({
        success: true,
        data: expect.objectContaining({
          id: pageId,
          draftData,
          hasUnpublishedChanges: true,
          isDraft: true,
        }),
      })
    })

    it('should return page without draft data if no draft exists', async () => {
      // Mock data
      const pageId = 'page-123'

      // Mock Prisma response
      const mockPage = {
        id: pageId,
        moduleId: 'module-123',
        title: 'Test Page',
        order: 1,
        type: 'content',
        content: {
          type: 'doc',
          content: [
            {
              type: 'paragraph',
              content: [{ type: 'text', text: 'Original content' }],
            },
          ],
        },
        version: 1,
        status: ModuleStatus.DRAFT,
        createdAt: new Date(),
        updatedAt: new Date(),
        draftData: null,
        draftSavedAt: null,
        lastEditBy: 'user-123',
        hasUnpublishedChanges: false,
        isDraft: false,
      }

      // Setup mocks
      prisma.modulePage.findUnique = jest.fn().mockResolvedValue(mockPage)

      // Execute
      const result = await modulePageService.getDraft(pageId)

      // Assert
      expect(prisma.modulePage.findUnique).toHaveBeenCalledWith({
        where: { id: pageId },
      })
      expect(result).toEqual({
        success: true,
        data: expect.objectContaining({
          id: pageId,
          draftData: undefined,
          hasUnpublishedChanges: false,
          isDraft: false,
        }),
      })
    })

    it('should return null if page not found', async () => {
      // Mock data
      const pageId = 'non-existent-page'

      // Setup mocks
      prisma.modulePage.findUnique = jest.fn().mockResolvedValue(null)

      // Execute
      const result = await modulePageService.getDraft(pageId)

      // Assert
      expect(prisma.modulePage.findUnique).toHaveBeenCalledWith({
        where: { id: pageId },
      })
      expect(result).toBeNull()
    })
  })

  describe('publishDraft', () => {
    it('should publish draft successfully', async () => {
      // Mock data
      const pageId = 'page-123'
      const draftData = {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [{ type: 'text', text: 'Draft content' }],
          },
        ],
      }

      // Mock Prisma response
      const mockExistingPage = {
        id: pageId,
        moduleId: 'module-123',
        title: 'Test Page',
        order: 1,
        type: 'content',
        content: {
          type: 'doc',
          content: [
            {
              type: 'paragraph',
              content: [{ type: 'text', text: 'Original content' }],
            },
          ],
        },
        version: 1,
        status: ModuleStatus.DRAFT,
        createdAt: new Date(),
        updatedAt: new Date(),
        draftData,
        draftSavedAt: new Date(),
        lastEditBy: 'user-123',
        hasUnpublishedChanges: true,
        isDraft: true,
      }

      const mockUpdatedPage = {
        ...mockExistingPage,
        content: draftData,
        draftData: null,
        draftSavedAt: null,
        version: 2,
        status: ModuleStatus.ACTIVE, // Prisma returns ModuleStatus
        hasUnpublishedChanges: false,
        isDraft: false,
      }

      // Setup mocks
      prisma.modulePage.findUnique = jest
        .fn()
        .mockResolvedValue(mockExistingPage)
      prisma.modulePage.update = jest.fn().mockResolvedValue(mockUpdatedPage)

      // Execute
      const result = await modulePageService.publishDraft(pageId)

      // Assert
      expect(prisma.modulePage.findUnique).toHaveBeenCalledWith({
        where: { id: pageId },
      })
      expect(prisma.modulePage.update).toHaveBeenCalledWith({
        where: { id: pageId },
        data: expect.objectContaining({
          content: draftData,
          draftData: undefined,
          draftSavedAt: undefined,
          isDraft: false,
          hasUnpublishedChanges: false,
          version: { increment: 1 },
        }),
      })
      expect(result).toEqual({
        success: true,
        data: expect.objectContaining({
          id: pageId,
          content: draftData,
          draftData: undefined,
          status: ModulePageStatus.PUBLISHED,
          version: 2,
          hasUnpublishedChanges: false,
          isDraft: false,
        }),
      })
    })

    it('should return null if page not found', async () => {
      // Mock data
      const pageId = 'non-existent-page'

      // Setup mocks
      prisma.modulePage.findUnique = jest.fn().mockResolvedValue(null)

      // Execute
      const result = await modulePageService.publishDraft(pageId)

      // Assert
      expect(prisma.modulePage.findUnique).toHaveBeenCalledWith({
        where: { id: pageId },
      })
      expect(prisma.modulePage.update).not.toHaveBeenCalled()
      expect(result).toBeNull()
    })

    it('should return null if no draft exists', async () => {
      // Mock data
      const pageId = 'page-123'

      // Mock Prisma response
      const mockPage = {
        id: pageId,
        moduleId: 'module-123',
        title: 'Test Page',
        order: 1,
        type: 'content',
        content: {
          type: 'doc',
          content: [
            {
              type: 'paragraph',
              content: [{ type: 'text', text: 'Original content' }],
            },
          ],
        },
        version: 1,
        status: ModuleStatus.DRAFT,
        createdAt: new Date(),
        updatedAt: new Date(),
        draftData: null,
        draftSavedAt: null,
        lastEditBy: 'user-123',
        hasUnpublishedChanges: false,
        isDraft: false,
      }

      // Setup mocks
      prisma.modulePage.findUnique = jest.fn().mockResolvedValue(mockPage)

      // Execute
      const result = await modulePageService.publishDraft(pageId)

      // Assert
      expect(prisma.modulePage.findUnique).toHaveBeenCalledWith({
        where: { id: pageId },
      })
      expect(prisma.modulePage.update).not.toHaveBeenCalled()
      expect(result).toBeNull()
    })
  })

  describe('discardDraft', () => {
    it('should discard draft successfully', async () => {
      // Mock data
      const pageId = 'page-123'

      // Mock Prisma response
      const mockExistingPage = {
        id: pageId,
        moduleId: 'module-123',
        title: 'Test Page',
        draftData: {
          type: 'doc',
          content: [
            {
              type: 'paragraph',
              content: [{ type: 'text', text: 'Draft content' }],
            },
          ],
        },
        isDraft: true,
        hasUnpublishedChanges: true,
      }

      const mockUpdatedPage = {
        ...mockExistingPage,
        draftData: null,
        draftSavedAt: null,
        isDraft: false,
        hasUnpublishedChanges: false,
      }

      // Setup mocks
      prisma.modulePage.findUnique = jest
        .fn()
        .mockResolvedValue(mockExistingPage)
      prisma.modulePage.update = jest.fn().mockResolvedValue(mockUpdatedPage)

      // Execute
      const result = await modulePageService.discardDraft(pageId)

      // Assert
      expect(prisma.modulePage.findUnique).toHaveBeenCalledWith({
        where: { id: pageId },
      })
      expect(prisma.modulePage.update).toHaveBeenCalledWith({
        where: { id: pageId },
        data: {
          draftData: undefined,
          draftSavedAt: undefined,
          isDraft: false,
          hasUnpublishedChanges: false,
        },
      })
      expect(result).toBe(true)
    })

    it('should return false if page not found', async () => {
      // Mock data
      const pageId = 'non-existent-page'

      // Setup mocks
      prisma.modulePage.findUnique = jest.fn().mockResolvedValue(null)

      // Execute
      const result = await modulePageService.discardDraft(pageId)

      // Assert
      expect(prisma.modulePage.findUnique).toHaveBeenCalledWith({
        where: { id: pageId },
      })
      expect(prisma.modulePage.update).not.toHaveBeenCalled()
      expect(result).toBe(false)
    })

    it('should handle errors', async () => {
      // Mock data
      const pageId = 'page-123'

      // Setup mocks
      const mockError = new Error('Database error')
      prisma.modulePage.findUnique = jest.fn().mockResolvedValue({
        id: pageId,
        moduleId: 'module-123',
      })
      prisma.modulePage.update = jest.fn().mockRejectedValue(mockError)

      // Execute & Assert
      await expect(modulePageService.discardDraft(pageId)).rejects.toThrow(
        mockError
      )
    })
  })
})
