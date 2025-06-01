import { NextRequest } from 'next/server'
import { GET, PUT, DELETE } from './route'
import { modulePageService } from '@/features/manage-module/services/modulePageService'

// Mock modulePageService
jest.mock('@/features/manage-module/services/modulePageService', () => ({
  modulePageService: {
    getModulePage: jest.fn(),
    updateModulePage: jest.fn(),
    deleteModulePage: jest.fn(),
  },
}))

// Tipe untuk handler
type RequestHandler = (req: NextRequest) => Promise<Response>

// Mock middleware
jest.mock('../../../middleware', () => ({
  withAdminAuth: (handler: RequestHandler) => handler,
  withAuditTrail: (handler: RequestHandler) => handler,
  composeMiddlewares: (_: unknown[], handler: RequestHandler) => handler,
}))

describe('Module Page API Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  // Helper untuk membuat NextRequest
  const createRequest = (method: string, body?: Record<string, unknown>) => {
    // Gunakan URL yang valid dengan protokol dan host
    const req = new NextRequest(
      new URL('http://localhost:3000/api/module/123/pages/456'),
      {
        method,
      }
    )

    // Tambahkan body jika ada
    if (body) {
      Object.defineProperty(req, 'json', {
        writable: true,
        value: jest.fn().mockResolvedValue(body),
      })
    }

    return req
  }

  describe('GET /api/module/[id]/pages/[pageid]', () => {
    it('should get page with draft information successfully', async () => {
      // Mock data dengan informasi draft
      const mockPage = {
        success: true,
        data: {
          id: '456',
          moduleId: '123',
          title: 'Test Page',
          content: { type: 'doc', content: [] },
          draftData: {
            type: 'doc',
            content: [
              {
                type: 'paragraph',
                content: [{ type: 'text', text: 'Draft content' }],
              },
            ],
          },
          draftSavedAt: new Date(),
          hasUnpublishedChanges: true,
          isDraft: false,
          lastEditBy: 'user-123',
        },
      }

      // Setup mock
      ;(modulePageService.getModulePage as jest.Mock).mockResolvedValue(
        mockPage
      )

      // Execute
      const req = createRequest('GET')
      const res = await GET(req)
      const data = await res.json()

      // Assert
      expect(res.status).toBe(200)
      expect(data.success).toBe(true)
      expect(modulePageService.getModulePage).toHaveBeenCalledWith('456')
      expect(data.meta.hasUnpublishedChanges).toBe(true)
      expect(data.meta.draftSavedAt).toBeDefined()
      expect(data.meta.lastEditBy).toBe('user-123')
    })

    it('should get page without draft information successfully', async () => {
      // Mock data tanpa informasi draft
      const mockPage = {
        success: true,
        data: {
          id: '456',
          moduleId: '123',
          title: 'Test Page',
          content: { type: 'doc', content: [] },
          // Tidak ada draftData, draftSavedAt, dll.
        },
      }

      // Setup mock
      ;(modulePageService.getModulePage as jest.Mock).mockResolvedValue(
        mockPage
      )

      // Execute
      const req = createRequest('GET')
      const res = await GET(req)
      const data = await res.json()

      // Assert
      expect(res.status).toBe(200)
      expect(data.success).toBe(true)
      expect(modulePageService.getModulePage).toHaveBeenCalledWith('456')
      expect(data.meta.hasUnpublishedChanges).toBe(false)
      expect(data.meta.draftSavedAt).toBeNull()
      expect(data.meta.isDraft).toBe(false)
      expect(data.meta.lastEditBy).toBeNull()
    })
  })

  describe('PUT /api/module/[id]/pages/[pageid]', () => {
    it('should update page with draft data successfully', async () => {
      // Mock data dengan draftData
      const updateData = {
        title: 'Updated Title',
        content: {
          type: 'doc',
          content: [
            {
              type: 'paragraph',
              content: [{ type: 'text', text: 'Updated content' }],
            },
          ],
        },
        draftData: {
          type: 'doc',
          content: [
            {
              type: 'paragraph',
              content: [{ type: 'text', text: 'Draft content' }],
            },
          ],
        },
        authorId: 'user-123',
      }

      // Mock response dari service
      const mockResponse = {
        success: true,
        data: {
          id: '456',
          moduleId: '123',
          title: 'Updated Title',
          content: updateData.content,
          draftData: updateData.draftData,
          draftSavedAt: new Date(),
          hasUnpublishedChanges: true,
          isDraft: false,
          lastEditBy: 'user-123',
        },
      }

      // Setup mock
      ;(modulePageService.updateModulePage as jest.Mock).mockResolvedValue(
        mockResponse
      )

      // Execute
      const req = createRequest('PUT', updateData)
      const res = await PUT(req)
      const data = await res.json()

      // Assert
      expect(res.status).toBe(200)
      expect(data.success).toBe(true)
      expect(modulePageService.updateModulePage).toHaveBeenCalledWith(
        '456',
        expect.objectContaining({
          title: 'Updated Title',
          content: updateData.content,
          draftData: updateData.draftData,
          lastEditBy: 'user-123',
        })
      )
      expect(data.meta.hasUnpublishedChanges).toBe(true)
      expect(data.meta.draftSavedAt).toBeDefined()
      expect(data.meta.lastEditBy).toBe('user-123')
    })

    it('should return 400 for invalid draftData format', async () => {
      // Mock data dengan format draftData yang tidak valid
      const invalidData = {
        title: 'Updated Title',
        content: {
          type: 'doc',
          content: [
            {
              type: 'paragraph',
              content: [{ type: 'text', text: 'Updated content' }],
            },
          ],
        },
        draftData: 'not a valid tiptap format',
        authorId: 'user-123',
      }

      // Execute
      const req = createRequest('PUT', invalidData)
      const res = await PUT(req)
      const data = await res.json()

      // Assert
      expect(res.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error).toContain('Format draftData tidak valid')
      expect(modulePageService.updateModulePage).not.toHaveBeenCalled()
    })

    it('should set lastEditBy from authorId if not provided', async () => {
      // Mock data dengan authorId tapi tanpa lastEditBy
      const updateData = {
        title: 'Updated Title',
        content: {
          type: 'doc',
          content: [
            {
              type: 'paragraph',
              content: [{ type: 'text', text: 'Updated content' }],
            },
          ],
        },
        authorId: 'user-123',
        // lastEditBy tidak disediakan
      }

      // Mock response dari service
      const mockResponse = {
        success: true,
        data: {
          id: '456',
          moduleId: '123',
          title: 'Updated Title',
          content: updateData.content,
          lastEditBy: 'user-123', // Diisi otomatis dari authorId
        },
      }

      // Setup mock
      ;(modulePageService.updateModulePage as jest.Mock).mockResolvedValue(
        mockResponse
      )

      // Execute
      const req = createRequest('PUT', updateData)
      const res = await PUT(req)
      const data = await res.json()

      // Assert
      expect(res.status).toBe(200)
      expect(data.success).toBe(true)
      expect(modulePageService.updateModulePage).toHaveBeenCalledWith(
        '456',
        expect.objectContaining({
          lastEditBy: 'user-123', // Pastikan lastEditBy diisi dari authorId
        })
      )
    })
  })

  describe('DELETE /api/module/[id]/pages/[pageid]', () => {
    it('should delete page successfully', async () => {
      // Setup mock
      ;(modulePageService.deleteModulePage as jest.Mock).mockResolvedValue(true)

      // Execute
      const req = createRequest('DELETE')
      const res = await DELETE(req)
      const data = await res.json()

      // Assert
      expect(res.status).toBe(200)
      expect(data.success).toBe(true)
      expect(modulePageService.deleteModulePage).toHaveBeenCalledWith('456')
      expect(data.message).toContain('Halaman berhasil dihapus')
    })
  })
})
