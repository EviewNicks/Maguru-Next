import { renderHook, act } from '@testing-library/react-hooks'
import { useDraftRecovery } from './useDraftRecovery'
import { modulePageAdapter } from '../../adapters/modulePageAdapter'
import { ModulePage, ModulePageStatus, StandardEditorContent } from '../../types'


// Mock modulePageAdapter
jest.mock('../../../adapters/modulePageAdapter', () => ({
  modulePageAdapter: {
    hasDraft: jest.fn(),
    getDraft: jest.fn(),
    discardDraft: jest.fn(),
  },
}))

// Mock date-fns
jest.mock('date-fns', () => ({
  formatDistanceToNow: jest.fn().mockReturnValue('5 menit yang lalu'),
}))

describe('useDraftRecovery', () => {
  const mockPageId = 'test-page-id'
  const mockOnRecover = jest.fn()
  const mockOnDiscard = jest.fn()

  const mockDraftData: ModulePage = {
    id: mockPageId,
    title: 'Test Page',
    moduleId: 'test-module-id',
    order: 1,
    type: 'content',
    content: { type: 'doc', content: [] } as StandardEditorContent,
    version: 1,
    status: ModulePageStatus.DRAFT,
    createdAt: new Date(),
    updatedAt: new Date(),
    isDraft: true,
    hasUnpublishedChanges: true,
    draftData: {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [{ type: 'text', text: 'Draft content' }],
        },
      ],
    } as StandardEditorContent,
    draftSavedAt: new Date(),
    lastEditBy: 'test-user',
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should initialize with default values', () => {
    const { result } = renderHook(() =>
      useDraftRecovery({
        pageId: mockPageId,
        autoCheckOnMount: false,
      })
    )

    expect(result.current.hasDraft).toBe(false)
    expect(result.current.draftData).toBeNull()
    expect(result.current.isLoading).toBe(false)
    expect(result.current.showRecoveryDialog).toBe(false)
  })

  it('should check for draft on mount when autoCheckOnMount is true', async () => {
    // Setup mock implementation
    const mockHasDraft = modulePageAdapter.hasDraft as jest.Mock
    mockHasDraft.mockResolvedValue(true)

    const mockGetDraft = modulePageAdapter.getDraft as jest.Mock
    mockGetDraft.mockResolvedValue(mockDraftData)

    // Render the hook
    const { result, waitForNextUpdate } = renderHook(() =>
      useDraftRecovery({
        pageId: mockPageId,
        autoCheckOnMount: true,
      })
    )

    // Wait for the async operations to complete
    await waitForNextUpdate()

    // Verify hasDraft was called
    expect(mockHasDraft).toHaveBeenCalledWith(mockPageId)

    // Verify getDraft was called
    expect(mockGetDraft).toHaveBeenCalledWith(mockPageId)

    // Verify state was updated
    expect(result.current.hasDraft).toBe(true)
    expect(result.current.draftData).toEqual(mockDraftData)
  })

  it('should not check for draft on mount when autoCheckOnMount is false', () => {
    const mockHasDraft = modulePageAdapter.hasDraft as jest.Mock

    renderHook(() =>
      useDraftRecovery({
        pageId: mockPageId,
        autoCheckOnMount: false,
      })
    )

    expect(mockHasDraft).not.toHaveBeenCalled()
  })

  it('should check for draft when checkDraft is called', async () => {
    // Setup mock implementation
    const mockHasDraft = modulePageAdapter.hasDraft as jest.Mock
    mockHasDraft.mockResolvedValue(true)

    // Render the hook
    const { result, waitForNextUpdate } = renderHook(() =>
      useDraftRecovery({
        pageId: mockPageId,
        autoCheckOnMount: false,
      })
    )

    // Call checkDraft
    act(() => {
      result.current.checkDraft()
    })

    // Wait for the async operation to complete
    await waitForNextUpdate()

    // Verify hasDraft was called
    expect(mockHasDraft).toHaveBeenCalledWith(mockPageId)

    // Verify state was updated
    expect(result.current.hasDraft).toBe(true)
  })

  it('should fetch draft when fetchDraft is called', async () => {
    // Setup mock implementation
    const mockGetDraft = modulePageAdapter.getDraft as jest.Mock
    mockGetDraft.mockResolvedValue(mockDraftData)

    // Render the hook
    const { result, waitForNextUpdate } = renderHook(() =>
      useDraftRecovery({
        pageId: mockPageId,
        autoCheckOnMount: false,
      })
    )

    // Call fetchDraft
    act(() => {
      result.current.fetchDraft()
    })

    // Wait for the async operation to complete
    await waitForNextUpdate()

    // Verify getDraft was called
    expect(mockGetDraft).toHaveBeenCalledWith(mockPageId)

    // Verify state was updated
    expect(result.current.draftData).toEqual(mockDraftData)
    expect(result.current.hasDraft).toBe(true)
  })

  it('should show recovery dialog when showRecovery is called', async () => {
    // Setup mock implementation
    const mockGetDraft = modulePageAdapter.getDraft as jest.Mock
    mockGetDraft.mockResolvedValue(mockDraftData)

    // Render the hook
    const { result, waitForNextUpdate } = renderHook(() =>
      useDraftRecovery({
        pageId: mockPageId,
        autoCheckOnMount: false,
      })
    )

    // Call showRecovery
    let showResult
    act(() => {
      showResult = result.current.showRecovery()
    })

    // Wait for the async operation to complete
    await waitForNextUpdate()

    // Verify getDraft was called
    expect(mockGetDraft).toHaveBeenCalledWith(mockPageId)

    // Verify state was updated
    expect(result.current.showRecoveryDialog).toBe(true)
    expect(await showResult).toBe(true)
  })

  it('should call onRecover when handleRecover is called', () => {
    // Setup mock implementation
    const mockGetDraft = modulePageAdapter.getDraft as jest.Mock
    mockGetDraft.mockResolvedValue(mockDraftData)

    // Render the hook
    const { result } = renderHook(() =>
      useDraftRecovery({
        pageId: mockPageId,
        onRecover: mockOnRecover,
        autoCheckOnMount: false,
      })
    )

    // Set draftData manually for testing
    act(() => {
      result.current.draftData = mockDraftData
    })

    // Call handleRecover
    act(() => {
      result.current.handleRecover()
    })

    // Verify onRecover was called with the draft content
    expect(mockOnRecover).toHaveBeenCalledWith(mockDraftData.draftData)

    // Verify dialog was closed
    expect(result.current.showRecoveryDialog).toBe(false)
  })

  it('should discard draft when handleDiscard is called', async () => {
    // Setup mock implementation
    const mockDiscardDraft = modulePageAdapter.discardDraft as jest.Mock
    mockDiscardDraft.mockResolvedValue(true)

    // Render the hook
    const { result, waitForNextUpdate } = renderHook(() =>
      useDraftRecovery({
        pageId: mockPageId,
        onDiscard: mockOnDiscard,
        autoCheckOnMount: false,
      })
    )

    // Set showRecoveryDialog to true for testing
    act(() => {
      result.current.showRecoveryDialog = true
    })

    // Call handleDiscard
    act(() => {
      result.current.handleDiscard()
    })

    // Wait for the async operation to complete
    await waitForNextUpdate()

    // Verify discardDraft was called
    expect(mockDiscardDraft).toHaveBeenCalledWith(mockPageId)

    // Verify onDiscard was called
    expect(mockOnDiscard).toHaveBeenCalled()

    // Verify state was updated
    expect(result.current.hasDraft).toBe(false)
    expect(result.current.draftData).toBeNull()
    expect(result.current.showRecoveryDialog).toBe(false)
  })

  it('should close dialog when closeDialog is called', () => {
    // Render the hook
    const { result } = renderHook(() =>
      useDraftRecovery({
        pageId: mockPageId,
        autoCheckOnMount: false,
      })
    )

    // Set showRecoveryDialog to true for testing
    act(() => {
      result.current.showRecoveryDialog = true
    })

    // Call closeDialog
    act(() => {
      result.current.closeDialog()
    })

    // Verify dialog was closed
    expect(result.current.showRecoveryDialog).toBe(false)
  })

  it('should format draft time correctly', async () => {
    // Setup mock implementation
    const mockGetDraft = modulePageAdapter.getDraft as jest.Mock
    mockGetDraft.mockResolvedValue(mockDraftData)

    // Render the hook
    const { result, waitForNextUpdate } = renderHook(() =>
      useDraftRecovery({
        pageId: mockPageId,
        autoCheckOnMount: false,
      })
    )

    // Call fetchDraft
    act(() => {
      result.current.fetchDraft()
    })

    // Wait for the async operation to complete
    await waitForNextUpdate()

    // Verify formatted time
    expect(result.current.formattedDraftTime).toBe('5 menit yang lalu')

    // Verify editor name
    expect(result.current.editorName).toBe('test-user')
  })
})
