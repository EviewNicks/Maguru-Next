import { modulePageAdapter } from './modulePageAdapter'
import { ModulePageStatus } from '../types'

// Mock fetch API
global.fetch = jest.fn()

describe('modulePageAdapter', () => {
  // Reset mocks before each test
  beforeEach(() => {
    jest.resetAllMocks()

    // Reset cache
    modulePageAdapter._cache = {
      pages: {},
      page: {},
      drafts: {},
    }

    // Spy pada fungsi invalidasi cache
    jest.spyOn(modulePageAdapter, 'invalidateDraftCache')
    jest.spyOn(modulePageAdapter, 'invalidatePageCache')
  })

  describe('discardDraft', () => {
    const mockPageId = 'mock-page-id'
    const mockModuleId = 'mock-module-id'
    const mockSuccessResponse = {
      success: true,
      data: {
        id: mockPageId,
        moduleId: mockModuleId,
        title: 'Mock Page',
        content: { type: 'doc', content: [] },
        status: ModulePageStatus.PUBLISHED,
        isDraft: false,
        hasUnpublishedChanges: false,
      },
      message: 'Draft berhasil dibuang',
    }

    // Setup mock untuk getPage
    beforeEach(() => {
      jest.spyOn(modulePageAdapter, 'getPage').mockResolvedValue({
        id: mockPageId,
        moduleId: mockModuleId,
        title: 'Mock Page',
        content: { type: 'doc', content: [] },
        order: 1,
        type: 'content',
        version: 1,
        status: ModulePageStatus.DRAFT,
        createdAt: new Date(),
        updatedAt: new Date(),
        isDraft: true,
        hasUnpublishedChanges: true,
      })
    })

    test('should throw error if pageId is invalid', async () => {
      // Test dengan pageId undefined
      await expect(
        modulePageAdapter.discardDraft(undefined as unknown as string)
      ).rejects.toThrow()

      // Test dengan pageId null
      await expect(
        modulePageAdapter.discardDraft(null as unknown as string)
      ).rejects.toThrow()

      // Test dengan pageId bukan string
      await expect(
        modulePageAdapter.discardDraft(123 as unknown as string)
      ).rejects.toThrow()
    })

    test('should call API with correct URL and method', async () => {
      // Setup mock response
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValueOnce(mockSuccessResponse),
      })

      // Call the function
      await modulePageAdapter.discardDraft(mockPageId)

      // Verify fetch was called with correct URL and method
      expect(global.fetch).toHaveBeenCalledWith(
        `/api/module/${mockModuleId}/pages/${mockPageId}/draft`,
        expect.objectContaining({
          method: 'DELETE',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        })
      )
    })

    test('should return null if API returns 404', async () => {
      // Setup mock response
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: jest.fn().mockResolvedValueOnce({ error: 'Not found' }),
      })

      // Call the function
      const result = await modulePageAdapter.discardDraft(mockPageId)

      // Verify result
      expect(result).toBeNull()
    })

    test('should throw error if API returns error', async () => {
      // Setup mock response
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: jest.fn().mockResolvedValueOnce({ error: 'Server error' }),
      })

      // Call the function and expect error
      await expect(modulePageAdapter.discardDraft(mockPageId)).rejects.toThrow()
    })

    test('should return success response if API returns success', async () => {
      // Setup mock response
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValueOnce(mockSuccessResponse),
      })

      // Call the function
      const result = await modulePageAdapter.discardDraft(mockPageId)

      // Verify result
      expect(result).toEqual(mockSuccessResponse)
    })

    test('should invalidate cache after successful discard', async () => {
      // Setup mock response
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValueOnce(mockSuccessResponse),
      })

      // Call the function
      await modulePageAdapter.discardDraft(mockPageId)

      // Verify cache invalidation
      expect(modulePageAdapter.invalidateDraftCache).toHaveBeenCalledWith(
        mockPageId
      )
      expect(modulePageAdapter.invalidatePageCache).toHaveBeenCalledWith(
        mockPageId
      )
    })

    test('should not invalidate cache if API returns error', async () => {
      // Setup mock response
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: jest.fn().mockResolvedValueOnce({ error: 'Server error' }),
      })

      // Call the function and expect error
      await expect(modulePageAdapter.discardDraft(mockPageId)).rejects.toThrow()

      // Verify cache invalidation was not called
      expect(modulePageAdapter.invalidateDraftCache).not.toHaveBeenCalled()
      expect(modulePageAdapter.invalidatePageCache).not.toHaveBeenCalled()
    })

    test('should handle case when moduleId is not found', async () => {
      // Override getPage mock to return null
      jest.spyOn(modulePageAdapter, 'getPage').mockResolvedValueOnce(null)

      // Call the function
      const result = await modulePageAdapter.discardDraft(mockPageId)

      // Verify result
      expect(result).toBeNull()

      // Verify fetch was not called
      expect(global.fetch).not.toHaveBeenCalled()
    })
  })
})
