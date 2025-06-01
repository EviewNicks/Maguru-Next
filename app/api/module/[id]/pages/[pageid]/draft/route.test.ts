import { NextRequest } from 'next/server'
import { POST, GET, PATCH, DELETE } from './route'
import { modulePageService } from '@/features/manage-module/services/modulePageService'

// Mock modulePageService
jest.mock('@/features/manage-module/services/modulePageService', () => ({
  modulePageService: {
    saveDraft: jest.fn(),
    getDraft: jest.fn(),
    publishDraft: jest.fn(),
    discardDraft: jest.fn(),
  },
}))

// Tipe untuk handler
type RequestHandler = (req: NextRequest) => Promise<Response>

// Mock middleware
jest.mock('../../../../middleware', () => ({
  withAdminAuth: (handler: RequestHandler) => handler,
  withAuditTrail: (handler: RequestHandler) => handler,
  composeMiddlewares: (_: unknown[], handler: RequestHandler) => handler,
}))

describe('Draft API Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  // Helper untuk membuat NextRequest
  const createRequest = (method: string, body?: Record<string, unknown>) => {
    // Gunakan URL yang valid dengan protokol dan host
    const req = new NextRequest(
      new URL('http://localhost:3000/api/module/123/pages/456/draft'),
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

  describe('POST /api/module/[id]/pages/[pageid]/draft', () => {
    it('should save draft successfully', async () => {
      // Mock data
      const draftData = {
        content: {
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
          title: 'Test Page',
          content: { type: 'doc', content: [] },
          draftData: draftData.content,
          draftSavedAt: new Date(),
          hasUnpublishedChanges: true,
          isDraft: true,
        },
      }

      // Setup mock
      ;(modulePageService.saveDraft as jest.Mock).mockResolvedValue(
        mockResponse
      )

      // Execute
      const req = createRequest('POST', draftData)
      const res = await POST(req)
      const data = await res.json()

      // Assert
      expect(res.status).toBe(200)
      expect(data.success).toBe(true)
      expect(modulePageService.saveDraft).toHaveBeenCalledWith(
        '456',
        draftData.content,
        draftData.authorId
      )
    })

    it('should return 400 for invalid content format', async () => {
      // Mock data dengan format konten yang tidak valid
      const invalidData = {
        content: 'not a valid tiptap format',
        authorId: 'user-123',
      }

      // Execute
      const req = createRequest('POST', invalidData)
      const res = await POST(req)
      const data = await res.json()

      // Assert
      expect(res.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error).toContain('Format content tidak valid')
      expect(modulePageService.saveDraft).not.toHaveBeenCalled()
    })

    it('should return 400 if authorId is missing', async () => {
      // Mock data tanpa authorId
      const invalidData = {
        content: {
          type: 'doc',
          content: [
            {
              type: 'paragraph',
              content: [{ type: 'text', text: 'Draft content' }],
            },
          ],
        },
      }

      // Execute
      const req = createRequest('POST', invalidData)
      const res = await POST(req)
      const data = await res.json()

      // Assert
      expect(res.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error).toContain('AuthorId diperlukan')
      expect(modulePageService.saveDraft).not.toHaveBeenCalled()
    })

    it('should return 404 if page not found', async () => {
      // Mock data
      const draftData = {
        content: {
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

      // Setup mock
      ;(modulePageService.saveDraft as jest.Mock).mockResolvedValue(null)

      // Execute
      const req = createRequest('POST', draftData)
      const res = await POST(req)
      const data = await res.json()

      // Assert
      expect(res.status).toBe(404)
      expect(data.success).toBe(false)
      expect(data.error).toContain('Halaman tidak ditemukan')
    })

    it('should handle service errors', async () => {
      // Mock data
      const draftData = {
        content: {
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

      // Setup mock
      const mockError = new Error('Service error')
      ;(modulePageService.saveDraft as jest.Mock).mockRejectedValue(mockError)

      // Execute
      const req = createRequest('POST', draftData)
      const res = await POST(req)
      const data = await res.json()

      // Assert
      expect(res.status).toBe(500)
      expect(data.success).toBe(false)
      expect(data.error).toContain('Terjadi kesalahan')
    })
  })

  describe('GET /api/module/[id]/pages/[pageid]/draft', () => {
    it('should get draft successfully', async () => {
      // Mock response dari service
      const mockResponse = {
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
          isDraft: true,
        },
      }

      // Setup mock
      ;(modulePageService.getDraft as jest.Mock).mockResolvedValue(mockResponse)

      // Execute
      const req = createRequest('GET')
      const res = await GET(req)
      const data = await res.json()

      // Assert
      expect(res.status).toBe(200)
      expect(data.success).toBe(true)
      expect(modulePageService.getDraft).toHaveBeenCalledWith('456')
      expect(data.data.draftData).toBeDefined()
      expect(data.meta.hasUnpublishedChanges).toBe(true)
    })

    it('should return 404 if page not found', async () => {
      // Setup mock
      ;(modulePageService.getDraft as jest.Mock).mockResolvedValue(null)

      // Execute
      const req = createRequest('GET')
      const res = await GET(req)
      const data = await res.json()

      // Assert
      expect(res.status).toBe(404)
      expect(data.success).toBe(false)
      expect(data.error).toContain('Halaman tidak ditemukan')
    })
  })

  describe('PATCH /api/module/[id]/pages/[pageid]/draft', () => {
    it('should publish draft successfully', async () => {
      // Mock response dari service
      const mockResponse = {
        success: true,
        data: {
          id: '456',
          moduleId: '123',
          title: 'Test Page',
          content: {
            type: 'doc',
            content: [
              {
                type: 'paragraph',
                content: [{ type: 'text', text: 'Published content' }],
              },
            ],
          },
          version: 2,
          draftData: null,
          draftSavedAt: null,
          hasUnpublishedChanges: false,
          isDraft: false,
          updatedAt: new Date(),
        },
      }

      // Setup mock
      ;(modulePageService.publishDraft as jest.Mock).mockResolvedValue(
        mockResponse
      )

      // Execute
      const req = createRequest('PATCH')
      const res = await PATCH(req)
      const data = await res.json()

      // Assert
      expect(res.status).toBe(200)
      expect(data.success).toBe(true)
      expect(modulePageService.publishDraft).toHaveBeenCalledWith('456')
      expect(data.meta.version).toBe(2)
      expect(data.meta.publishedAt).toBeDefined()
    })

    it('should return 404 if page or draft not found', async () => {
      // Setup mock
      ;(modulePageService.publishDraft as jest.Mock).mockResolvedValue(null)

      // Execute
      const req = createRequest('PATCH')
      const res = await PATCH(req)
      const data = await res.json()

      // Assert
      expect(res.status).toBe(404)
      expect(data.success).toBe(false)
      expect(data.error).toContain('Halaman atau draft tidak ditemukan')
    })
  })

  describe('DELETE /api/module/[id]/pages/[pageid]/draft', () => {
    it('should discard draft successfully', async () => {
      // Setup mock
      ;(modulePageService.discardDraft as jest.Mock).mockResolvedValue(true)

      // Execute
      const req = createRequest('DELETE')
      const res = await DELETE(req)
      const data = await res.json()

      // Assert
      expect(res.status).toBe(200)
      expect(data.success).toBe(true)
      expect(modulePageService.discardDraft).toHaveBeenCalledWith('456')
      expect(data.message).toContain('Draft berhasil dibuang')
    })

    it('should return 404 if page not found', async () => {
      // Setup mock
      ;(modulePageService.discardDraft as jest.Mock).mockResolvedValue(false)

      // Execute
      const req = createRequest('DELETE')
      const res = await DELETE(req)
      const data = await res.json()

      // Assert
      expect(res.status).toBe(404)
      expect(data.success).toBe(false)
      expect(data.error).toContain('Halaman tidak ditemukan')
    })
  })
})
