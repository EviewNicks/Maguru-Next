// features/manage-module/services/modulePageService.test.ts
import {
  createModulePage,
  getModulePages,
  getModulePageById,
  updateModulePage,
  deleteModulePage,
  reorderModulePages,
} from './modulePageService'
import prisma from '@/lib/prisma'
import DOMPurify from 'isomorphic-dompurify'
import {
  ModulePageType,
  ProgrammingLanguage,
} from '../schemas/modulePageSchema'
import {
  ModulePageCreateInput,
  ModulePageUpdateInput,
} from '../types'
import { Prisma } from '@prisma/client'

// Interface untuk Prisma error
interface PrismaError extends Error {
  name: string;
  code?: string;
}

// Mock prisma
jest.mock('@/lib/prisma', () => {
  return {
    __esModule: true,
    default: {
      modulePage: {
        findFirst: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        updateMany: jest.fn(),
        delete: jest.fn(),
      },
      module: {
        findUnique: jest.fn(),
      },
      $transaction: jest.fn((callback) => callback()),
    },
  }
})

// Mock DOMPurify
jest.mock('isomorphic-dompurify', () => ({
  sanitize: jest.fn((content) => content),
}))

describe('modulePageService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('createModulePage', () => {
    it('creates a theory page with sanitized content', async () => {
      // Mock data
      const moduleId = 'module-1'
      const input: ModulePageCreateInput = {
        moduleId,
        type: ModulePageType.TEORI,
        content: '<p>Konten teori</p><script>alert("xss")</script>',
        order: 0,
      }

      const sanitizedContent = '<p>Konten teori</p>'
      ;(DOMPurify.sanitize as jest.Mock).mockReturnValue(sanitizedContent)

      // Mock last page query
      ;(prisma.modulePage.findFirst as jest.Mock).mockResolvedValue({
        order: 2,
      })

      // Mock create
      const createdPage = {
        id: '1',
        moduleId,
        order: 0,
        type: ModulePageType.TEORI,
        content: sanitizedContent,
        createdAt: new Date(),
        updatedAt: new Date(),
        version: 1,
      }
      ;(prisma.modulePage.create as jest.Mock).mockResolvedValue(createdPage)

      const result = await createModulePage(input)

      // Verify sanitize was called
      expect(DOMPurify.sanitize).toHaveBeenCalledWith(
        input.content,
        expect.any(Object)
      )

      // Verify create was called with sanitized content
      expect(prisma.modulePage.create).toHaveBeenCalledWith({
        data: {
          module: { connect: { id: moduleId } },
          type: ModulePageType.TEORI,
          content: sanitizedContent,
          order: 0,
          version: 1,
        },
      })

      expect(result).toEqual(createdPage)
    })

    it('creates a code page without sanitizing content', async () => {
      // Mock data
      const moduleId = 'module-1'
      const input: ModulePageCreateInput = {
        moduleId,
        type: ModulePageType.KODE,
        content: 'console.log("<script>alert(\'xss\')</script>")',
        language: ProgrammingLanguage.JAVASCRIPT,
        order: 0,
      }

      // Mock last page query
      ;(prisma.modulePage.findFirst as jest.Mock).mockResolvedValue(null)

      // Mock create
      const createdPage = {
        id: '1',
        moduleId,
        order: 0,
        type: ModulePageType.KODE,
        content: input.content,
        language: ProgrammingLanguage.JAVASCRIPT,
        createdAt: new Date(),
        updatedAt: new Date(),
        version: 1,
      }
      ;(prisma.modulePage.create as jest.Mock).mockResolvedValue(createdPage)

      const result = await createModulePage(input)

      // Verify sanitize was NOT called
      expect(DOMPurify.sanitize).not.toHaveBeenCalled()

      // Verify create was called with original content
      expect(prisma.modulePage.create).toHaveBeenCalledWith({
        data: {
          module: { connect: { id: moduleId } },
          type: ModulePageType.KODE,
          content: input.content,
          language: ProgrammingLanguage.JAVASCRIPT,
          order: 0,
          version: 1,
        },
      })

      expect(result).toEqual(createdPage)
    })

    it('handles errors during creation', async () => {
      // Mock data
      const moduleId = 'module-1'
      const input: ModulePageCreateInput = {
        moduleId,
        type: ModulePageType.TEORI,
        content: '<p>Konten teori</p>',
        order: 1,
      }

      // Mock error
      const error = new Error('Database error')
      ;(prisma.modulePage.findFirst as jest.Mock).mockRejectedValue(error)

      await expect(createModulePage(input)).rejects.toThrow(
        'Gagal membuat halaman modul: Database error'
      )
    })

    it('throws error if order is not provided', async () => {
      // Mock data
      const moduleId = 'module-1'
      const input: ModulePageCreateInput = {
        moduleId,
        type: ModulePageType.TEORI,
        content: '<p>Konten teori</p>',
        order: 1,
      }

      // Mock error during findFirst
      const error = new Error('Database error')
      ;(prisma.modulePage.findFirst as jest.Mock).mockRejectedValue(error)

      await expect(createModulePage(input)).rejects.toThrow(
        'Gagal membuat halaman modul: Database error'
      )
    })

    it('uses default order when not provided', async () => {
      // Mock data
      const moduleId = 'module-1'
      const input: ModulePageCreateInput = {
        moduleId,
        type: ModulePageType.TEORI,
        content: '<p>Konten teori</p>',
      } as ModulePageCreateInput // Casting karena order adalah opsional dalam implementasi

      // Mock last page query
      ;(prisma.modulePage.findFirst as jest.Mock).mockResolvedValue({
        order: 2,
      })

      // Mock create
      const createdPage = {
        id: '1',
        moduleId,
        order: 3, // order terakhir + 1
        type: ModulePageType.TEORI,
        content: '<p>Konten teori</p>',
        createdAt: new Date(),
        updatedAt: new Date(),
        version: 1,
      }
      ;(prisma.modulePage.create as jest.Mock).mockResolvedValue(createdPage)

      const result = await createModulePage(input)

      // Verify create was called with calculated order
      expect(prisma.modulePage.create).toHaveBeenCalledWith({
        data: {
          module: { connect: { id: moduleId } },
          type: ModulePageType.TEORI,
          content: input.content,
          order: 3, // order terakhir + 1
          version: 1,
        },
      })

      expect(result).toEqual(createdPage)
    })
  })

  describe('getModulePages', () => {
    it('returns module pages in order', async () => {
      // Mock data
      const moduleId = 'module-1'
      const pages = [
        {
          id: '1',
          moduleId,
          order: 1,
          type: ModulePageType.TEORI,
          content: '<p>Konten teori</p>',
          createdAt: new Date(),
          updatedAt: new Date(),
          version: 1,
        },
        {
          id: '2',
          moduleId,
          order: 2,
          type: ModulePageType.KODE,
          content: 'console.log("Hello")',
          language: ProgrammingLanguage.JAVASCRIPT,
          createdAt: new Date(),
          updatedAt: new Date(),
          version: 1,
        },
      ]

      ;(prisma.modulePage.findMany as jest.Mock).mockResolvedValue(pages)

      const result = await getModulePages(moduleId)

      expect(prisma.modulePage.findMany).toHaveBeenCalledWith({
        where: { moduleId },
        orderBy: { order: 'asc' },
      })

      expect(result).toEqual(pages)
    })
  })

  describe('getModulePageById', () => {
    it('returns a module page by id', async () => {
      // Mock data
      const pageId = '1'
      const page = {
        id: pageId,
        moduleId: 'module-1',
        order: 1,
        type: ModulePageType.TEORI,
        content: '<p>Konten teori</p>',
        createdAt: new Date(),
        updatedAt: new Date(),
        version: 1,
      }

      ;(prisma.modulePage.findUnique as jest.Mock).mockResolvedValue(page)

      const result = await getModulePageById(pageId)

      expect(prisma.modulePage.findUnique).toHaveBeenCalledWith({
        where: { id: pageId },
      })

      expect(result).toEqual(page)
    })

    it('returns null if page not found', async () => {
      // Mock not found
      ;(prisma.modulePage.findUnique as jest.Mock).mockResolvedValue(null)

      const result = await getModulePageById('non-existent')

      expect(result).toBeNull()
    })
  })

  describe('updateModulePage', () => {
    it('updates a theory page with sanitized content', async () => {
      // Mock data
      const pageId = '1'
      const input: ModulePageUpdateInput = {
        id: pageId,
        type: ModulePageType.TEORI,
        content: '<p>Konten teori yang diperbarui</p><script>alert("xss")</script>',
      }

      const sanitizedContent = '<p>Konten teori yang diperbarui</p>'
      ;(DOMPurify.sanitize as jest.Mock).mockReturnValue(sanitizedContent)

      // Mock existing page
      const existingPage = {
        id: pageId,
        moduleId: 'module-1',
        order: 1,
        type: ModulePageType.TEORI,
        content: '<p>Konten teori lama</p>',
        createdAt: new Date(),
        updatedAt: new Date(),
        version: 1,
      }
      ;(prisma.modulePage.findUnique as jest.Mock).mockResolvedValue(existingPage)

      // Mock update
      const updatedPage = {
        ...existingPage,
        content: sanitizedContent,
        updatedAt: new Date(),
        version: 2,
      }
      ;(prisma.modulePage.update as jest.Mock).mockResolvedValue(updatedPage)

      const result = await updateModulePage(pageId, input, 1)

      // Verify sanitize was called
      expect(DOMPurify.sanitize).toHaveBeenCalledWith(
        input.content,
        expect.any(Object)
      )

      // Verify update was called with sanitized content and version check
      expect(prisma.modulePage.update).toHaveBeenCalledWith({
        where: { id: pageId, version: 1 },
        data: {
          type: ModulePageType.TEORI,
          content: sanitizedContent,
          version: { increment: 1 },
        },
      })

      expect(result).toEqual(updatedPage)
    })

    it('updates a code page without sanitizing content', async () => {
      // Mock data
      const pageId = '1'
      const input: ModulePageUpdateInput = {
        id: pageId,
        type: ModulePageType.KODE,
        content: 'console.log("<script>alert(\'xss\')</script>")',
        language: ProgrammingLanguage.JAVASCRIPT,
      }

      // Mock existing page
      const existingPage = {
        id: pageId,
        moduleId: 'module-1',
        order: 1,
        type: ModulePageType.KODE,
        content: 'console.log("Hello")',
        language: ProgrammingLanguage.PYTHON,
        createdAt: new Date(),
        updatedAt: new Date(),
        version: 1,
      }
      ;(prisma.modulePage.findUnique as jest.Mock).mockResolvedValue(existingPage)

      // Mock update
      const updatedPage = {
        ...existingPage,
        content: input.content,
        language: ProgrammingLanguage.JAVASCRIPT,
        updatedAt: new Date(),
        version: 2,
      }
      ;(prisma.modulePage.update as jest.Mock).mockResolvedValue(updatedPage)

      const result = await updateModulePage(pageId, input, 1)

      // Verify sanitize was NOT called
      expect(DOMPurify.sanitize).not.toHaveBeenCalled()

      // Verify update was called with original content and language update
      expect(prisma.modulePage.update).toHaveBeenCalledWith({
        where: { id: pageId, version: 1 },
        data: {
          type: ModulePageType.KODE,
          content: input.content,
          language: ProgrammingLanguage.JAVASCRIPT,
          version: { increment: 1 },
        },
      })

      expect(result).toEqual(updatedPage)
    })

    it('throws error if page not found', async () => {
      // Mock not found
      ;(prisma.modulePage.findUnique as jest.Mock).mockResolvedValue(null)

      await expect(
        updateModulePage(
          'non-existent',
          {
            id: 'non-existent',
            type: ModulePageType.TEORI,
            content: '<p>Konten</p>',
          },
          1
        )
      ).rejects.toThrow('Halaman modul tidak ditemukan')
    })

    it('throws error if version mismatch (optimistic locking)', async () => {
      // Mock existing page
      const pageId = '1'
      const existingPage = {
        id: pageId,
        moduleId: 'module-1',
        order: 1,
        type: ModulePageType.TEORI,
        content: '<p>Konten teori lama</p>',
        createdAt: new Date(),
        updatedAt: new Date(),
        version: 2, // Version in database is 2
      }
      ;(prisma.modulePage.findUnique as jest.Mock).mockResolvedValue(existingPage)

      // Mock Prisma error for version mismatch
      const mockPrismaError = new Error('Version mismatch') as PrismaError
      mockPrismaError.name = 'PrismaClientKnownRequestError'
      mockPrismaError.code = 'P2034' // Contoh kode error Prisma
      ;(prisma.modulePage.update as jest.Mock).mockRejectedValue(mockPrismaError)

      await expect(
        updateModulePage(
          pageId,
          {
            id: pageId,
            type: ModulePageType.TEORI,
            content: '<p>Konten baru</p>',
          },
          1 // Version yang dikirim client adalah 1 (tidak sesuai dengan 2 di database)
        )
      ).rejects.toThrow('Konflik versi: Halaman telah diperbarui oleh pengguna lain')
    })
  })

  describe('deleteModulePage', () => {
    it('deletes a module page and reorders remaining pages', async () => {
      // Mock data
      const pageId = '2'
      const moduleId = 'module-1'

      // Mock existing page
      const existingPage = {
        id: pageId,
        moduleId,
        order: 2,
        type: ModulePageType.TEORI,
        content: '<p>Konten teori</p>',
        createdAt: new Date(),
        updatedAt: new Date(),
        version: 1,
      }
      ;(prisma.modulePage.findUnique as jest.Mock).mockResolvedValue(existingPage)

      // Mock delete
      ;(prisma.modulePage.delete as jest.Mock).mockResolvedValue(existingPage)

      // Mock transaction
      ;(prisma.$transaction as jest.Mock).mockImplementation(async (callback) => {
        return await callback(prisma)
      })

      const result = await deleteModulePage(pageId)

      // Verify delete was called
      expect(prisma.modulePage.delete).toHaveBeenCalledWith({
        where: { id: pageId },
      })

      // Verify updateMany was called to reorder pages
      expect(prisma.modulePage.updateMany).toHaveBeenCalledWith({
        where: {
          moduleId,
          order: { gt: 2 },
        },
        data: {
          order: { decrement: 1 },
        },
      })

      expect(result).toEqual(existingPage)
    })

    it('throws error if page not found', async () => {
      // Mock not found
      ;(prisma.modulePage.findUnique as jest.Mock).mockResolvedValue(null)

      await expect(deleteModulePage('non-existent')).rejects.toThrow(
        'Halaman modul tidak ditemukan'
      )
    })
  })

  describe('reorderModulePages', () => {
    it('reorders module pages', async () => {
      // Mock data
      const moduleId = 'module-1'
      const updates = [
        { pageId: '1', order: 2 },
        { pageId: '2', order: 1 },
      ]

      // Mock module
      ;(prisma.module.findUnique as jest.Mock).mockResolvedValue({
        id: moduleId,
        name: 'Module 1',
      })

      // Mock pages after update
      const updatedPages = [
        {
          id: '2',
          moduleId,
          order: 1,
          type: ModulePageType.KODE,
          content: 'console.log("Hello")',
          language: ProgrammingLanguage.JAVASCRIPT,
          createdAt: new Date(),
          updatedAt: new Date(),
          version: 1,
        },
        {
          id: '1',
          moduleId,
          order: 2,
          type: ModulePageType.TEORI,
          content: '<p>Konten teori</p>',
          createdAt: new Date(),
          updatedAt: new Date(),
          version: 1,
        },
      ]
      ;(prisma.modulePage.findMany as jest.Mock).mockResolvedValue(updatedPages)

      // Mock transaction
      ;(prisma.$transaction as jest.Mock).mockImplementation(async (callback) => {
        return await callback(prisma)
      })

      const result = await reorderModulePages(moduleId, { updates })

      // Verify module was checked
      expect(prisma.module.findUnique).toHaveBeenCalledWith({
        where: { id: moduleId },
      })

      // Verify each update was called
      updates.forEach((update) => {
        expect(prisma.modulePage.update).toHaveBeenCalledWith({
          where: { id: update.pageId, moduleId },
          data: { order: update.order, version: { increment: 1 } },
        })
      })

      expect(result).toEqual(updatedPages)
    })

    it('throws error if module not found', async () => {
      // Mock module not found
      ;(prisma.module.findUnique as jest.Mock).mockResolvedValue(null)

      await expect(
        reorderModulePages('non-existent', {
          updates: [{ pageId: '1', order: 1 }],
        })
      ).rejects.toThrow('Modul tidak ditemukan')
    })
  })
})
