import { renderHook, act } from '@testing-library/react'
import { useRichTextAutosave } from './useRichTextAutosave'
import { useModulePageCRUDContext } from '../context/ModulePageCRUDContext'
import { toast } from 'sonner'
import { ContentBlockType } from '../types/modulePageSchema'

// Mock toast
jest.mock('sonner', () => ({
  toast: {
    error: jest.fn(),
  },
}))

// Mock ModulePageCRUDContext
jest.mock('../context/ModulePageCRUDContext', () => ({
  useModulePageCRUDContext: jest.fn(),
}))

// Mock useDebounce untuk menghindari efek debounce dalam tes
jest.mock('../hooks/useDebounce', () => ({
  useDebounce: <T>(value: T) => value, // Langsung mengembalikan nilai tanpa debounce
}))

describe('useRichTextAutosave', () => {
  // Mock data dan fungsi
  const mockPageId = 'page-123'
  const mockContent = '<p>Test content</p>'
  const mockSavePage = jest.fn().mockResolvedValue({ success: true })

  beforeEach(() => {
    jest.clearAllMocks()
    // Setup mock untuk useModulePageCRUDContext
    ;(useModulePageCRUDContext as jest.Mock).mockReturnValue({
      savePage: mockSavePage,
    })
  })

  test('should initialize with correct state', () => {
    const { result } = renderHook(() =>
      useRichTextAutosave(mockPageId, mockContent)
    )

    expect(result.current.saveStatus).toBe('saved')
    expect(result.current.content).toBe(mockContent)
  })

  test('should update content and start saving when handleContentChange is called', () => {
    // Karena useDebounce di-mock untuk langsung mengembalikan nilai,
    // useEffect untuk autosave akan langsung dijalankan
    const { result } = renderHook(() =>
      useRichTextAutosave(mockPageId, mockContent)
    )

    const newContent = '<p>Updated content</p>'

    act(() => {
      result.current.handleContentChange(newContent)
    })

    // Content diperbarui
    expect(result.current.content).toBe(newContent)

    // Karena useDebounce di-mock untuk langsung mengembalikan nilai,
    // status akan langsung berubah menjadi 'saving'
    expect(result.current.saveStatus).toBe('saving')

    // Verifikasi savePage dipanggil dengan parameter yang benar
    expect(mockSavePage).toHaveBeenCalledWith({
      pageId: mockPageId,
      blocks: [{ type: ContentBlockType.TEXT, content: newContent }],
    })
  })

  test('should save content after content change', async () => {
    const { result } = renderHook(() =>
      useRichTextAutosave(mockPageId, mockContent)
    )

    const newContent = '<p>Updated content</p>'

    await act(async () => {
      result.current.handleContentChange(newContent)
      // Tunggu proses save selesai
      await Promise.resolve()
    })

    // Verifikasi savePage dipanggil dengan parameter yang benar
    expect(mockSavePage).toHaveBeenCalledWith({
      pageId: mockPageId,
      blocks: [{ type: ContentBlockType.TEXT, content: newContent }],
    })

    // Status berubah menjadi 'saved' setelah proses save selesai
    expect(result.current.saveStatus).toBe('saved')
  })

  test('should handle error when save fails', async () => {
    // Override mock to simulate error
    const mockError = new Error('Save failed')

    // Pastikan mockSavePage mengembalikan rejected promise
    const mockSavePageWithError = jest.fn().mockImplementation(() => {
      return Promise.reject(mockError)
    })

    // Override context dengan fungsi yang akan selalu error
    ;(useModulePageCRUDContext as jest.Mock).mockReturnValue({
      savePage: mockSavePageWithError,
    })

    const { result } = renderHook(() =>
      useRichTextAutosave(mockPageId, mockContent)
    )

    const newContent = '<p>Updated content</p>'

    await act(async () => {
      result.current.handleContentChange(newContent)
      // Tunggu proses save (yang akan gagal) selesai
      await Promise.resolve()
    })

    expect(mockSavePageWithError).toHaveBeenCalled()
    expect(toast.error).toHaveBeenCalled()

    // Verifikasi bahwa status berubah menjadi error
    expect(result.current.saveStatus).toBe('error')
  })

  test('should not attempt to save if pageId is not provided', async () => {
    const { result } = renderHook(() =>
      useRichTextAutosave(undefined, mockContent)
    )

    const newContent = '<p>Updated content</p>'

    await act(async () => {
      result.current.handleContentChange(newContent)
      await Promise.resolve()
    })

    expect(mockSavePage).not.toHaveBeenCalled()
  })

  test('should set content from initialContent if provided', () => {
    const initialContent = '<p>Initial content</p>'
    const { result } = renderHook(() =>
      useRichTextAutosave(mockPageId, initialContent)
    )

    expect(result.current.content).toBe(initialContent)
  })

  test('should update saveStatus during manual save operation', async () => {
    const { result } = renderHook(() =>
      useRichTextAutosave(mockPageId, mockContent)
    )

    // Set isContentDirty to true first
    const newContent = '<p>Updated content</p>'
    act(() => {
      result.current.handleContentChange(newContent)
    })

    // Reset mock to clear previous calls
    mockSavePage.mockClear()

    // Trigger manual save
    await act(async () => {
      await result.current.saveContent()
    })

    // Verify savePage was called
    expect(mockSavePage).toHaveBeenCalledWith({
      pageId: mockPageId,
      blocks: [{ type: ContentBlockType.TEXT, content: newContent }],
    })

    // Status should be 'saved' after successful save
    expect(result.current.saveStatus).toBe('saved')
  })
})
