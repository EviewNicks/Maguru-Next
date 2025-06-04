import { renderHook, act } from '@testing-library/react'
import { useRichTextAutosave } from './useRichTextAutosave'
import { modulePageAdapter } from '../../adapters/modulePageAdapter'
import { StandardEditorContent } from '../../types'
import { ModulePageEditor } from '../../types/modulePageSchema'

// Mock modulePageAdapter
jest.mock('../../../adapters/modulePageAdapter', () => ({
  modulePageAdapter: {
    saveDraft: jest.fn(),
  },
}))

// Mock Clerk
jest.mock('@clerk/nextjs', () => ({
  useClerk: () => ({
    user: { id: 'test-user-id' },
  }),
}))

// Mock Editor
const mockEditor = {
  getJSON: jest.fn(),
  on: jest.fn(),
  off: jest.fn(),
}

describe('useRichTextAutosave', () => {
  beforeEach(() => {
    jest.useFakeTimers()
    jest.clearAllMocks()

    // Reset online status
    Object.defineProperty(navigator, 'onLine', {
      configurable: true,
      value: true,
    })

    // Mock getJSON to return valid content
    mockEditor.getJSON.mockReturnValue({
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [{ type: 'text', text: 'Test content' }],
        },
      ],
    })
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('should initialize with idle status', () => {
    const { result } = renderHook(() =>
      useRichTextAutosave({
        editor: mockEditor as ModulePageEditor,
        enabled: true,
        pageId: 'test-page-id',
      })
    )

    expect(result.current.saveStatus).toBe('idle')
    expect(result.current.lastSavedAt).toBeNull()
    expect(result.current.hasUnsavedChanges).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it('should register and unregister editor event handlers', () => {
    const { unmount } = renderHook(() =>
      useRichTextAutosave({
        editor: mockEditor as ModulePageEditor,
        enabled: true,
        pageId: 'test-page-id',
      })
    )

    expect(mockEditor.on).toHaveBeenCalledWith('update', expect.any(Function))

    unmount()

    expect(mockEditor.off).toHaveBeenCalledWith('update', expect.any(Function))
  })

  it('should not register event handlers when disabled', () => {
    renderHook(() =>
      useRichTextAutosave({
        editor: mockEditor as ModulePageEditor,
        enabled: false,
        pageId: 'test-page-id',
      })
    )

    expect(mockEditor.on).not.toHaveBeenCalled()
  })

  it('should trigger save after debounce delay', async () => {
    // Setup mock implementation for saveDraft
    const mockSaveDraft = modulePageAdapter.saveDraft as jest.Mock
    mockSaveDraft.mockResolvedValue({
      id: 'test-page-id',
      title: 'Test Page',
      content: {} as StandardEditorContent,
    })

    // Render the hook
    const { result } = renderHook(() =>
      useRichTextAutosave({
        editor: mockEditor as ModulePageEditor,
        enabled: true,
        pageId: 'test-page-id',
      })
    )

    // Simulate editor update
    const updateHandler = mockEditor.on.mock.calls[0][1]
    act(() => {
      updateHandler({ editor: mockEditor })
    })

    // Verify status changed to unsaved
    expect(result.current.saveStatus).toBe('unsaved')
    expect(result.current.hasUnsavedChanges).toBe(true)

    // Fast-forward debounce timer
    act(() => {
      jest.advanceTimersByTime(5000) // DEBOUNCE_DELAY
    })

    // Verify saveDraft was called
    expect(mockSaveDraft).toHaveBeenCalledWith(
      'test-page-id',
      expect.objectContaining({
        type: 'doc',
        content: expect.any(Array),
      }),
      'test-user-id'
    )

    // Wait for the async operation to complete
    await act(async () => {
      await Promise.resolve()
    })

    // Verify status changed to saved
    expect(result.current.saveStatus).toBe('saved')
    expect(result.current.hasUnsavedChanges).toBe(false)
  })

  it('should handle offline status', () => {
    // Set navigator.onLine to false
    Object.defineProperty(navigator, 'onLine', {
      configurable: true,
      value: false,
    })

    const { result } = renderHook(() =>
      useRichTextAutosave({
        editor: mockEditor as ModulePageEditor,
        enabled: true,
        pageId: 'test-page-id',
      })
    )

    // Simulate editor update
    const updateHandler = mockEditor.on.mock.calls[0][1]
    act(() => {
      updateHandler({ editor: mockEditor })
    })

    // Fast-forward debounce timer
    act(() => {
      jest.advanceTimersByTime(5000) // DEBOUNCE_DELAY
    })

    // Verify status changed to offline
    expect(result.current.saveStatus).toBe('offline')
  })

  it('should handle error during save', async () => {
    // Setup mock implementation for saveDraft to throw error
    const mockSaveDraft = modulePageAdapter.saveDraft as jest.Mock
    mockSaveDraft.mockRejectedValue(new Error('Test error'))

    // Render the hook
    const { result } = renderHook(() =>
      useRichTextAutosave({
        editor: mockEditor as ModulePageEditor,
        enabled: true,
        pageId: 'test-page-id',
      })
    )

    // Simulate editor update
    const updateHandler = mockEditor.on.mock.calls[0][1]
    act(() => {
      updateHandler({ editor: mockEditor })
    })

    // Fast-forward debounce timer
    act(() => {
      jest.advanceTimersByTime(5000) // DEBOUNCE_DELAY
    })

    // Wait for the async operation to complete
    await act(async () => {
      await Promise.resolve()
    })

    // Verify status changed to error
    expect(result.current.saveStatus).toBe('error')
    expect(result.current.error).toBeInstanceOf(Error)
    expect(result.current.error?.message).toBe('Test error')
  })

  it('should provide forceSave function that saves immediately', async () => {
    // Setup mock implementation for saveDraft
    const mockSaveDraft = modulePageAdapter.saveDraft as jest.Mock
    mockSaveDraft.mockResolvedValue({
      id: 'test-page-id',
      title: 'Test Page',
      content: {} as StandardEditorContent,
    })

    // Render the hook
    const { result } = renderHook(() =>
      useRichTextAutosave({
        editor: mockEditor as ModulePageEditor,
        enabled: true,
        pageId: 'test-page-id',
      })
    )

    // Call forceSave
    act(() => {
      result.current.forceSave()
    })

    // Verify saveDraft was called immediately without waiting for debounce
    expect(mockSaveDraft).toHaveBeenCalledWith(
      'test-page-id',
      expect.objectContaining({
        type: 'doc',
        content: expect.any(Array),
      }),
      'test-user-id'
    )
  })

  it('should handle visibility change events', () => {
    // Setup mock implementation for saveDraft
    const mockSaveDraft = modulePageAdapter.saveDraft as jest.Mock
    mockSaveDraft.mockResolvedValue({
      id: 'test-page-id',
      title: 'Test Page',
      content: {} as StandardEditorContent,
    })

    // Render the hook
    renderHook(() =>
      useRichTextAutosave({
        editor: mockEditor as ModulePageEditor,
        enabled: true,
        pageId: 'test-page-id',
      })
    )

    // Simulate editor update to set hasUnsavedChanges to true
    const updateHandler = mockEditor.on.mock.calls[0][1]
    act(() => {
      updateHandler({ editor: mockEditor })
    })

    // Mock visibilityState
    Object.defineProperty(document, 'visibilityState', {
      configurable: true,
      get: () => 'hidden',
    })

    // Simulate visibilitychange event
    act(() => {
      document.dispatchEvent(new Event('visibilitychange'))
    })

    // Verify saveDraft was called
    expect(mockSaveDraft).toHaveBeenCalled()
  })

  it('should throttle save calls', async () => {
    // Setup mock implementation for saveDraft
    const mockSaveDraft = modulePageAdapter.saveDraft as jest.Mock
    mockSaveDraft.mockResolvedValue({
      id: 'test-page-id',
      title: 'Test Page',
      content: {} as StandardEditorContent,
    })

    // Render the hook
    const { result } = renderHook(() =>
      useRichTextAutosave({
        editor: mockEditor as ModulePageEditor,
        enabled: true,
        pageId: 'test-page-id',
      })
    )

    // Simulate multiple editor updates in quick succession
    const updateHandler = mockEditor.on.mock.calls[0][1]

    act(() => {
      updateHandler({ editor: mockEditor })
    })

    // Fast-forward less than minimum save interval
    act(() => {
      jest.advanceTimersByTime(1000) // Less than MINIMUM_SAVE_INTERVAL
    })

    act(() => {
      updateHandler({ editor: mockEditor })
    })

    // Fast-forward debounce timer
    act(() => {
      jest.advanceTimersByTime(5000) // DEBOUNCE_DELAY
    })

    // Verify saveDraft was called only once
    expect(mockSaveDraft).toHaveBeenCalledTimes(1)
  })
})
