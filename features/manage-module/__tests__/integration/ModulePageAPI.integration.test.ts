import {
  GET as getModulePages,
  POST as createModulePage,
} from '@/app/api/module/[id]/pages/route'
import {
  GET as getModulePage,
  PUT as updateModulePage,
  DELETE as deleteModulePage,
} from '@/app/api/pages/[id]/route'
import { modulePageService } from '../../services/modulePageService'
import { ContentBlockType } from '../../types/modulePageSchema'
import { NextRequest, NextResponse } from 'next/server'

// Mock modulePageService
jest.mock('../../services/modulePageService', () => ({
  modulePageService: {
    createModulePage: jest.fn(),
    getModulePages: jest.fn(),
    getModulePage: jest.fn(),
    updateModulePage: jest.fn(),
    deleteModulePage: jest.fn(),
  },
}))

// Mock next/server
jest.mock('next/server', () => {
  return jest.requireActual('../../../../__tests__/__mocks__/next-server')
})

// Mock clerk auth
jest.mock('@clerk/nextjs/server', () => ({
  auth: jest.fn().mockReturnValue({
    userId: 'test-user-id',
    sessionClaims: {
      metadata: {
        role: 'admin',
      },
    },
  }),
}))

describe('ModulePage API Integration Tests', () => {
  // URL constants
  const baseApiUrl = 'http://localhost:3000/api'
  const moduleId = '123e4567-e89b-12d3-a456-426614174000'
  const pageId = '123e4567-e89b-12d3-a456-426614174001'

  // Test data
  const mockPage = {
    id: pageId,
    moduleId,
    title: 'Test Page',
    order: 1,
    blocks: [
      {
        type: ContentBlockType.TEXT,
        content: 'Test content',
      },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  const mockCreatePageInput = {
    title: 'New Test Page',
    order: 2,
    blocks: [
      {
        type: ContentBlockType.TEXT,
        content: 'New test content',
      },
    ],
  }

  const mockUpdatePageInput = {
    title: 'Updated Test Page',
    blocks: [
      {
        type: ContentBlockType.TEXT,
        content: 'Updated content',
      },
    ],
  }

  // Helper to create request
  const createRequest = (method: string, url: string, body?: unknown) => {
    const request = new NextRequest(url, { method })

    // Override json method to return the mock body
    jest.spyOn(request, 'json').mockResolvedValue(body || {})

    return request
  }

  beforeEach(() => {
    jest.clearAllMocks()

    // Default mocks
    ;(modulePageService.getModulePages as jest.Mock).mockResolvedValue({
      success: true,
      data: [mockPage],
      meta: { page: 1, limit: 10, total: 1, totalPages: 1 },
    })
    ;(modulePageService.getModulePage as jest.Mock).mockResolvedValue({
      success: true,
      data: mockPage,
    })
    ;(modulePageService.createModulePage as jest.Mock).mockResolvedValue({
      success: true,
      data: { ...mockPage, ...mockCreatePageInput },
    })
    ;(modulePageService.updateModulePage as jest.Mock).mockResolvedValue({
      success: true,
      data: { ...mockPage, ...mockUpdatePageInput },
    })
    ;(modulePageService.deleteModulePage as jest.Mock).mockResolvedValue(true)

    // Clear NextResponse mock
    ;(NextResponse.json as jest.Mock).mockClear()
  })

  describe('GET /api/module/:id/pages', () => {
    it('should return list of pages for a module', async () => {
      // Arrange
      const url = `${baseApiUrl}/module/${moduleId}/pages`
      const request = createRequest('GET', url)

      // Act
      await getModulePages(request)

      // Assert
      expect(modulePageService.getModulePages).toHaveBeenCalledWith(
        moduleId,
        expect.any(Object)
      )
      expect(NextResponse.json).toHaveBeenCalledWith(
        {
          success: true,
          data: [mockPage],
          meta: expect.any(Object),
        },
        { status: 200 }
      )
    })

    it('should handle query parameters correctly', async () => {
      // Arrange
      const url = `${baseApiUrl}/module/${moduleId}/pages?page=2&limit=5&includeContent=true`
      const request = createRequest('GET', url)

      // Act
      await getModulePages(request)

      // Assert
      expect(modulePageService.getModulePages).toHaveBeenCalledWith(moduleId, {
        page: 2,
        limit: 5,
        includeContent: true,
      })
    })

    it('should handle error gracefully', async () => {
      // Arrange
      const url = `${baseApiUrl}/module/${moduleId}/pages`
      const request = createRequest('GET', url)
      ;(modulePageService.getModulePages as jest.Mock).mockRejectedValue(
        new Error('Database error')
      )

      // Act
      await getModulePages(request)

      // Assert
      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: expect.any(String) },
        { status: 500 }
      )
    })
  })

  describe('POST /api/module/:id/pages', () => {
    it('should create a new page', async () => {
      // Arrange
      const url = `${baseApiUrl}/module/${moduleId}/pages`
      const request = createRequest('POST', url, mockCreatePageInput)

      // Act
      await createModulePage(request)

      // Assert
      expect(modulePageService.createModulePage).toHaveBeenCalledWith({
        ...mockCreatePageInput,
        moduleId,
      })
      expect(NextResponse.json).toHaveBeenCalledWith(
        {
          success: true,
          data: expect.objectContaining({
            title: mockCreatePageInput.title,
          }),
        },
        { status: 201 }
      )
    })

    it('should handle module not found error', async () => {
      // Arrange
      const url = `${baseApiUrl}/module/${moduleId}/pages`
      const request = createRequest('POST', url, mockCreatePageInput)
      ;(modulePageService.createModulePage as jest.Mock).mockRejectedValue(
        new Error('Modul tidak ditemukan')
      )

      // Act
      await createModulePage(request)

      // Assert
      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'Modul tidak ditemukan' },
        { status: 404 }
      )
    })

    it('should handle other errors gracefully', async () => {
      // Arrange
      const url = `${baseApiUrl}/module/${moduleId}/pages`
      const request = createRequest('POST', url, mockCreatePageInput)
      ;(modulePageService.createModulePage as jest.Mock).mockRejectedValue(
        new Error('Database error')
      )

      // Act
      await createModulePage(request)

      // Assert
      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: expect.any(String) },
        { status: 500 }
      )
    })
  })

  describe('GET /api/pages/:id', () => {
    it('should return a page by id', async () => {
      // Arrange
      const url = `${baseApiUrl}/pages/${pageId}`
      const request = createRequest('GET', url)

      // Act
      await getModulePage(request)

      // Assert
      expect(modulePageService.getModulePage).toHaveBeenCalledWith(pageId)
      expect(NextResponse.json).toHaveBeenCalledWith(
        {
          success: true,
          data: mockPage,
        },
        { status: 200 }
      )
    })

    it('should return 404 if page not found', async () => {
      // Arrange
      const url = `${baseApiUrl}/pages/${pageId}`
      const request = createRequest('GET', url)
      ;(modulePageService.getModulePage as jest.Mock).mockResolvedValue(null)

      // Act
      await getModulePage(request)

      // Assert
      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'Halaman tidak ditemukan' },
        { status: 404 }
      )
    })

    it('should handle error gracefully', async () => {
      // Arrange
      const url = `${baseApiUrl}/pages/${pageId}`
      const request = createRequest('GET', url)
      ;(modulePageService.getModulePage as jest.Mock).mockRejectedValue(
        new Error('Database error')
      )

      // Act
      await getModulePage(request)

      // Assert
      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: expect.any(String) },
        { status: 500 }
      )
    })
  })

  describe('PUT /api/pages/:id', () => {
    it('should update a page', async () => {
      // Arrange
      const url = `${baseApiUrl}/pages/${pageId}`
      const request = createRequest('PUT', url, mockUpdatePageInput)

      // Act
      await updateModulePage(request)

      // Assert
      expect(modulePageService.updateModulePage).toHaveBeenCalledWith(
        pageId,
        mockUpdatePageInput
      )
      expect(NextResponse.json).toHaveBeenCalledWith(
        {
          success: true,
          data: expect.objectContaining({
            title: mockUpdatePageInput.title,
          }),
        },
        { status: 200 }
      )
    })

    it('should return 404 if page not found', async () => {
      // Arrange
      const url = `${baseApiUrl}/pages/${pageId}`
      const request = createRequest('PUT', url, mockUpdatePageInput)
      ;(modulePageService.updateModulePage as jest.Mock).mockResolvedValue(null)

      // Act
      await updateModulePage(request)

      // Assert
      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'Halaman tidak ditemukan' },
        { status: 404 }
      )
    })

    it('should handle error gracefully', async () => {
      // Arrange
      const url = `${baseApiUrl}/pages/${pageId}`
      const request = createRequest('PUT', url, mockUpdatePageInput)
      ;(modulePageService.updateModulePage as jest.Mock).mockRejectedValue(
        new Error('Database error')
      )

      // Act
      await updateModulePage(request)

      // Assert
      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: expect.any(String) },
        { status: 500 }
      )
    })
  })

  describe('DELETE /api/pages/:id', () => {
    it('should delete a page', async () => {
      // Arrange
      const url = `${baseApiUrl}/pages/${pageId}`
      const request = createRequest('DELETE', url)

      // Act
      await deleteModulePage(request)

      // Assert
      expect(modulePageService.deleteModulePage).toHaveBeenCalledWith(pageId)
      expect(NextResponse.json).toHaveBeenCalledWith(
        { success: true, message: 'Halaman berhasil dihapus' },
        { status: 200 }
      )
    })

    it('should return 404 if page not found', async () => {
      // Arrange
      const url = `${baseApiUrl}/pages/${pageId}`
      const request = createRequest('DELETE', url)
      ;(modulePageService.deleteModulePage as jest.Mock).mockResolvedValue(
        false
      )

      // Act
      await deleteModulePage(request)

      // Assert
      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'Halaman tidak ditemukan' },
        { status: 404 }
      )
    })

    it('should handle error gracefully', async () => {
      // Arrange
      const url = `${baseApiUrl}/pages/${pageId}`
      const request = createRequest('DELETE', url)
      ;(modulePageService.deleteModulePage as jest.Mock).mockRejectedValue(
        new Error('Database error')
      )

      // Act
      await deleteModulePage(request)

      // Assert
      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: expect.any(String) },
        { status: 500 }
      )
    })
  })
})
