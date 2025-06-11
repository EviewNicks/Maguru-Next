import { renderHook, act } from '@testing-library/react-hooks'
import { useModulePageData } from './useModulePageData'
import { modulePageAdapter } from '../adapters/modulePageAdapter'
import { ModulePage, StandardEditorContent } from '../types'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'

// Mock modulePageAdapter
jest.mock('../../adapters/modulePageAdapter', () => ({
  modulePageAdapter: {
    getPages: jest.fn(),
    getPage: jest.fn(),
    saveDraft: jest.fn(),
    getDraft: jest.fn(),
    publishDraft: jest.fn(),
    discardDraft: jest.fn(),
    hasDraft: jest.fn(),
    getParsedEditorContent: jest.fn(),
  },
}))

// Mock sonner toast
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}))

// Mock data
const mockModuleId = 'test-module-id'
const mockPageId = 'test-page-id'
const mockAuthorId = 'test-user-id'

const mockStandardContent: StandardEditorContent = {
  type: 'doc',
  content: [
    {
      type: 'paragraph',
      content: [{ type: 'text', text: 'Test content' }],
    },
  ],
}

const mockDraftContent: StandardEditorContent = {
  type: 'doc',
  content: [
    {
      type: 'paragraph',
      content: [{ type: 'text', text: 'Draft content' }],
    },
  ],
}

describe('useModulePageData - Draft Features', () => {
  let queryClient: QueryClient

  // Wrapper for renderHook with QueryClientProvider
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    })
    jest.clearAllMocks()

    // Default mock implementations
    ;(modulePageAdapter.getPages as jest.Mock).mockResolvedValue([])
    ;(modulePageAdapter.getParsedEditorContent as jest.Mock).mockReturnValue(
      mockStandardContent
    )
  })

  afterEach(() => {
    queryClient.clear()
  })

  it('should check for draft existence', async () => {
    // Setup mock implementation
    const mockHasDraft = modulePageAdapter.hasDraft as jest.Mock
    mockHasDraft.mockResolvedValue(true)

    // Render the hook
    const { result, waitFor } = renderHook(
      () => useModulePageData(mockModuleId),
      {
        wrapper,
      }
    )

    // Call checkHasDraft
    let hasDraft: boolean
    await act(async () => {
      hasDraft = await result.current.checkHasDraft(mockPageId)
    })

    // Verify hasDraft was called
    await waitFor(() => {
      expect(mockHasDraft).toHaveBeenCalledWith(mockPageId)
      expect(hasDraft).toBe(true)
    })
  })

  it('should get draft', async () => {
    // Setup mock implementation
    const mockGetDraft = modulePageAdapter.getDraft as jest.Mock
    mockGetDraft.mockResolvedValue({
      id: mockPageId,
      draftData: mockDraftContent,
    })

    // Render the hook
    const { result, waitFor } = renderHook(
      () => useModulePageData(mockModuleId),
      {
        wrapper,
      }
    )

    // Call getDraft
    let draft: ModulePage
    await act(async () => {
      draft = await result.current.getDraft(mockPageId)
    })

    // Verify getDraft was called
    await waitFor(() => {
      expect(mockGetDraft).toHaveBeenCalledWith(mockPageId)
      expect(draft).toEqual({
        id: mockPageId,
        draftData: mockDraftContent,
      })
    })
  })

  it('should save draft', async () => {
    // Setup mock implementation
    const mockSaveDraft = modulePageAdapter.saveDraft as jest.Mock
    mockSaveDraft.mockResolvedValue({
      id: mockPageId,
      draftData: mockDraftContent,
    })

    // Render the hook
    const { result } = renderHook(() => useModulePageData(mockModuleId), {
      wrapper,
    })

    // Call saveDraft
    await act(async () => {
      result.current.saveDraft({
        pageId: mockPageId,
        content: mockDraftContent,
        authorId: mockAuthorId,
      })
    })

    // Verify saveDraft was called
    expect(mockSaveDraft).toHaveBeenCalledWith(
      mockPageId,
      expect.objectContaining({
        type: 'doc',
        content: expect.any(Array),
      }),
      mockAuthorId
    )
  })

  it('should publish draft', async () => {
    // Setup mock implementation
    const mockPublishDraft = modulePageAdapter.publishDraft as jest.Mock
    mockPublishDraft.mockResolvedValue({
      id: mockPageId,
      content: mockDraftContent,
    })

    // Render the hook
    const { result } = renderHook(() => useModulePageData(mockModuleId), {
      wrapper,
    })

    // Call publishDraft
    await act(async () => {
      result.current.publishDraft(mockPageId)
    })

    // Verify publishDraft was called
    expect(mockPublishDraft).toHaveBeenCalledWith(mockPageId)
  })

  it('should discard draft', async () => {
    // Setup mock implementation
    const mockDiscardDraft = modulePageAdapter.discardDraft as jest.Mock
    mockDiscardDraft.mockResolvedValue(true)

    // Render the hook
    const { result } = renderHook(() => useModulePageData(mockModuleId), {
      wrapper,
    })

    // Call discardDraft
    await act(async () => {
      result.current.discardDraft(mockPageId)
    })

    // Verify discardDraft was called
    expect(mockDiscardDraft).toHaveBeenCalledWith(mockPageId)
  })

  it('should handle error when saving draft', async () => {
    // Setup mock implementation to throw error
    const mockSaveDraft = modulePageAdapter.saveDraft as jest.Mock
    mockSaveDraft.mockRejectedValue(new Error('Failed to save draft'))

    // Render the hook
    const { result } = renderHook(() => useModulePageData(mockModuleId), {
      wrapper,
    })

    // Call saveDraft
    await act(async () => {
      result.current.saveDraft({
        pageId: mockPageId,
        content: mockDraftContent,
        authorId: mockAuthorId,
      })
    })

    // Verify saveDraft was called
    expect(mockSaveDraft).toHaveBeenCalledWith(
      mockPageId,
      expect.objectContaining({
        type: 'doc',
        content: expect.any(Array),
      }),
      mockAuthorId
    )

    // Verify loading state is false after error
    expect(result.current.isSavingDraft).toBe(false)
  })

  it('should handle error when publishing draft', async () => {
    // Setup mock implementation to throw error
    const mockPublishDraft = modulePageAdapter.publishDraft as jest.Mock
    mockPublishDraft.mockRejectedValue(new Error('Failed to publish draft'))

    // Render the hook
    const { result } = renderHook(() => useModulePageData(mockModuleId), {
      wrapper,
    })

    // Call publishDraft
    await act(async () => {
      result.current.publishDraft(mockPageId)
    })

    // Verify publishDraft was called
    expect(mockPublishDraft).toHaveBeenCalledWith(mockPageId)

    // Verify loading state is false after error
    expect(result.current.isPublishingDraft).toBe(false)
  })

  it('should handle error when discarding draft', async () => {
    // Setup mock implementation to throw error
    const mockDiscardDraft = modulePageAdapter.discardDraft as jest.Mock
    mockDiscardDraft.mockRejectedValue(new Error('Failed to discard draft'))

    // Render the hook
    const { result } = renderHook(() => useModulePageData(mockModuleId), {
      wrapper,
    })

    // Call discardDraft
    await act(async () => {
      result.current.discardDraft(mockPageId)
    })

    // Verify discardDraft was called
    expect(mockDiscardDraft).toHaveBeenCalledWith(mockPageId)

    // Verify loading state is false after error
    expect(result.current.isDiscardingDraft).toBe(false)
  })

  it('should update cache when saving draft successfully', async () => {
    // Setup mock implementation
    const mockSaveDraft = modulePageAdapter.saveDraft as jest.Mock
    const mockDraftResponse = {
      id: mockPageId,
      draftData: mockDraftContent,
      draftSavedAt: new Date(),
    }
    mockSaveDraft.mockResolvedValue(mockDraftResponse)

    // Set up spy on queryClient
    const setQueryDataSpy = jest.spyOn(queryClient, 'setQueryData')

    // Render the hook
    const { result, waitFor } = renderHook(
      () => useModulePageData(mockModuleId),
      {
        wrapper,
      }
    )

    // Call saveDraft
    await act(async () => {
      result.current.saveDraft({
        pageId: mockPageId,
        content: mockDraftContent,
        authorId: mockAuthorId,
      })
    })

    // Verify cache was updated
    await waitFor(() => {
      expect(setQueryDataSpy).toHaveBeenCalledWith(
        ['modulePage', mockPageId],
        expect.objectContaining({
          success: true,
          data: mockDraftResponse,
        })
      )

      expect(setQueryDataSpy).toHaveBeenCalledWith(
        ['modulePage', mockPageId, 'draft'],
        expect.objectContaining({
          success: true,
          data: mockDraftResponse,
        })
      )
    })
  })

  it('should invalidate cache when publishing draft successfully', async () => {
    // Setup mock implementation
    const mockPublishDraft = modulePageAdapter.publishDraft as jest.Mock
    mockPublishDraft.mockResolvedValue({
      id: mockPageId,
      content: mockDraftContent,
    })

    // Set up spy on queryClient
    const removeQueriesSpy = jest.spyOn(queryClient, 'removeQueries')
    const invalidateQueriesSpy = jest.spyOn(queryClient, 'invalidateQueries')

    // Render the hook
    const { result, waitFor } = renderHook(
      () => useModulePageData(mockModuleId),
      {
        wrapper,
      }
    )

    // Call publishDraft
    await act(async () => {
      result.current.publishDraft(mockPageId)
    })

    // Verify cache was invalidated
    await waitFor(() => {
      expect(removeQueriesSpy).toHaveBeenCalledWith({
        queryKey: ['modulePage', mockPageId, 'draft'],
      })

      expect(invalidateQueriesSpy).toHaveBeenCalledWith({
        queryKey: ['modulePages', mockModuleId],
      })
    })
  })
})
