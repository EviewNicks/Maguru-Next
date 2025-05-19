import { renderHook, act, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { modulePageService } from '../services/modulePageService'
import { useModulePageCRUD } from './useModulePageCRUD'
import { ReactNode } from 'react'
import { toast } from 'sonner'
import { showErrorNotification, categorizeError, isErrorRetryable } from '../components/ErrorNotifier'

// Mock modulePageService
jest.mock('../services/modulePageService', () => ({
  modulePageService: {
    createModulePage: jest.fn(),
    getModulePages: jest.fn(),
    getModulePage: jest.fn(),
    updateModulePage: jest.fn(),
    deleteModulePage: jest.fn(),
    reorderModulePages: jest.fn(),
  },
}))

// Mock toast
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}))

// Mock ErrorNotifier
jest.mock('../components/ErrorNotifier', () => ({
  showErrorNotification: jest.fn(),
  categorizeError: jest.fn().mockReturnValue('network'),
  isErrorRetryable: jest.fn().mockReturnValue(true),
}))

// Setup QueryClient untuk testing
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  })
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

describe('useModulePageCRUD', () => {
  const moduleId = 'mock-module-id'
  const mockPage = {
    id: 'mock-page-id',
    title: 'Mock Page',
    moduleId,
    order: 1,
    blocks: [{ type: 'text', content: 'Test content' }],
    status: 'DRAFT',
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
    
    // Reset mocks dengan default responses
    ;(modulePageService.createModulePage as jest.Mock).mockResolvedValue({
      success: true,
      data: mockPage,
    })
    ;(modulePageService.getModulePages as jest.Mock).mockResolvedValue({
      success: true,
      data: [mockPage],
      meta: { totalItems: 1 },
    })
    ;(modulePageService.getModulePage as jest.Mock).mockResolvedValue({
      success: true,
      data: mockPage,
    })
    ;(modulePageService.updateModulePage as jest.Mock).mockResolvedValue({
      success: true,
      data: { ...mockPage, title: 'Updated Title' },
    })
    ;(modulePageService.deleteModulePage as jest.Mock).mockResolvedValue(true)
    ;(modulePageService.reorderModulePages as jest.Mock).mockResolvedValue(true)
  })

  test('createPage should call service and update cache', async () => {
    const wrapper = createWrapper()
    const { result } = renderHook(() => useModulePageCRUD(moduleId), { wrapper })

    // Act
    await act(async () => {
      await result.current.createPage.mutateAsync({
        title: 'New Page',
        moduleId,
        order: 0,
        blocks: [{ type: 'text', content: 'New content' }],
      })
    })

    // Assert
    expect(modulePageService.createModulePage).toHaveBeenCalledWith({
      title: 'New Page',
      moduleId,
      order: 0,
      blocks: [{ type: 'text', content: 'New content' }],
    })
    expect(toast.success).toHaveBeenCalledWith('Halaman berhasil dibuat')
  })

  test('updatePage should call service and update cache', async () => {
    const wrapper = createWrapper()
    const { result } = renderHook(() => useModulePageCRUD(moduleId), { wrapper })

    // Act
    await act(async () => {
      await result.current.updatePage.mutateAsync({
        pageId: 'mock-page-id',
        updateData: { title: 'Updated Title' },
      })
    })

    // Assert
    expect(modulePageService.updateModulePage).toHaveBeenCalledWith(
      'mock-page-id',
      { title: 'Updated Title' }
    )
    expect(toast.success).toHaveBeenCalledWith('Halaman berhasil diperbarui')
  })

  test('deletePage should call service and update cache', async () => {
    const wrapper = createWrapper()
    const { result } = renderHook(() => useModulePageCRUD(moduleId), { wrapper })

    // Act
    await act(async () => {
      await result.current.deletePage.mutateAsync('mock-page-id')
    })

    // Assert
    expect(modulePageService.deleteModulePage).toHaveBeenCalledWith('mock-page-id')
    expect(toast.success).toHaveBeenCalledWith('Halaman berhasil dihapus')
  })

  test('reorderPages should call service and update cache', async () => {
    const wrapper = createWrapper()
    const { result } = renderHook(() => useModulePageCRUD(moduleId), { wrapper })

    // Act
    await act(async () => {
      await result.current.reorderPages.mutateAsync(['page-1', 'page-2'])
    })

    // Assert
    expect(modulePageService.reorderModulePages).toHaveBeenCalledWith(moduleId, ['page-1', 'page-2'])
    expect(toast.success).toHaveBeenCalledWith('Urutan halaman berhasil diperbarui')
  })

  test('savePage should update with optimistic updates', async () => {
    const wrapper = createWrapper()
    const { result } = renderHook(() => useModulePageCRUD(moduleId), { wrapper })

    // Act
    await act(async () => {
      await result.current.savePage({
        pageId: 'mock-page-id',
        title: 'New Title',
        blocks: [{ type: 'text', content: 'Updated content' }],
      })
    })

    // Assert
    expect(modulePageService.updateModulePage).toHaveBeenCalledWith(
      'mock-page-id',
      {
        title: 'New Title',
        blocks: [{ type: 'text', content: 'Updated content' }],
      }
    )
  })

  test('should handle error in updatePage with enhanced error notification', async () => {
    // Setup error
    const mockError = new Error('Update failed')
    ;(modulePageService.updateModulePage as jest.Mock).mockRejectedValue(mockError)

    const wrapper = createWrapper()
    const { result } = renderHook(() => useModulePageCRUD(moduleId), { wrapper })
    
    const updateData = { title: 'Will Fail' }

    // Act
    await act(async () => {
      try {
        await result.current.updatePage.mutateAsync({
          pageId: 'mock-page-id',
          updateData,
        })
      } catch (error) {
        // Expected to throw
      }
    })

    // Assert
    expect(categorizeError).toHaveBeenCalledWith(mockError)
    expect(isErrorRetryable).toHaveBeenCalled()
    expect(showErrorNotification).toHaveBeenCalledWith(
      mockError,
      expect.objectContaining({
        retryFn: expect.any(Function)
      })
    )
  })

  test('getPageById should fetch page data', async () => {
    const wrapper = createWrapper()
    const { result } = renderHook(() => useModulePageCRUD(moduleId), { wrapper })

    // Act
    let pageData
    await act(async () => {
      pageData = await result.current.getPageById('mock-page-id')
    })

    // Assert
    expect(modulePageService.getModulePage).toHaveBeenCalledWith('mock-page-id')
    expect(pageData).toEqual(mockPage)
  })

  test('should handle error in getPageById with retry option', async () => {
    // Setup error
    const mockError = new Error('Network failed')
    ;(modulePageService.getModulePage as jest.Mock).mockRejectedValue(mockError)

    const wrapper = createWrapper()
    const { result } = renderHook(() => useModulePageCRUD(moduleId), { wrapper })

    // Act
    let pageData
    await act(async () => {
      pageData = await result.current.getPageById('mock-page-id')
    })

    // Assert
    expect(modulePageService.getModulePage).toHaveBeenCalledWith('mock-page-id')
    expect(pageData).toBeNull()
    expect(categorizeError).toHaveBeenCalledWith(mockError)
    expect(showErrorNotification).toHaveBeenCalledWith(
      mockError,
      expect.objectContaining({
        retryFn: expect.any(Function)
      })
    )
  })

  test('should provide retry function when error is retryable', async () => {
    // Setup error and retry flag
    const mockError = new Error('Network failed')
    ;(modulePageService.deleteModulePage as jest.Mock).mockRejectedValue(mockError)
    ;(isErrorRetryable as jest.Mock).mockReturnValue(true)

    const wrapper = createWrapper()
    const { result } = renderHook(() => useModulePageCRUD(moduleId), { wrapper })

    // Act
    await act(async () => {
      try {
        await result.current.deletePage.mutateAsync('mock-page-id')
      } catch (error) {
        // Expected to throw
      }
    })

    // Assert
    expect(categorizeError).toHaveBeenCalledWith(mockError)
    expect(isErrorRetryable).toHaveBeenCalled()
    expect(showErrorNotification).toHaveBeenCalledWith(
      mockError,
      expect.objectContaining({
        retryFn: expect.any(Function)
      })
    )
  })

  test('should not provide retry function when error is not retryable', async () => {
    // Setup error and retry flag
    const mockError = new Error('Validation failed')
    ;(modulePageService.createModulePage as jest.Mock).mockRejectedValue(mockError)
    ;(isErrorRetryable as jest.Mock).mockReturnValue(false)

    const wrapper = createWrapper()
    const { result } = renderHook(() => useModulePageCRUD(moduleId), { wrapper })

    // Act
    await act(async () => {
      try {
        await result.current.createPage.mutateAsync({
          title: 'Will Fail',
          moduleId,
          order: 0,
          blocks: [],
        })
      } catch (error) {
        // Expected to throw
      }
    })

    // Get the last call to isErrorRetryable and showErrorNotification
    const lastIsRetryableCall = (isErrorRetryable as jest.Mock).mock.calls.length - 1
    const lastNotificationCall = (showErrorNotification as jest.Mock).mock.calls.length - 1

    // Assert retry function is not provided
    expect(categorizeError).toHaveBeenCalledWith(mockError)
    expect((isErrorRetryable as jest.Mock).mock.calls[lastIsRetryableCall][0]).toBe('network')
    expect((isErrorRetryable as jest.Mock).mock.results[lastIsRetryableCall].value).toBe(false)
    
    // Check that retry function is undefined
    const options = (showErrorNotification as jest.Mock).mock.calls[lastNotificationCall][1]
    expect(options.retryFn).toBeUndefined()
  })
}) 