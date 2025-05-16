import { renderHook, act, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { modulePageService } from '../services/modulePageService'
import { useModulePageCRUD } from './useModulePageCRUD'
import { ReactNode } from 'react'
import { toast } from 'sonner'

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

  test('should handle error in updatePage', async () => {
    // Setup error
    ;(modulePageService.updateModulePage as jest.Mock).mockRejectedValue(
      new Error('Update failed')
    )

    const wrapper = createWrapper()
    const { result } = renderHook(() => useModulePageCRUD(moduleId), { wrapper })

    // Act
    await act(async () => {
      try {
        await result.current.updatePage.mutateAsync({
          pageId: 'mock-page-id',
          updateData: { title: 'Will Fail' },
        })
      } catch (error) {
        // Expected to throw
      }
    })

    // Assert
    expect(toast.error).toHaveBeenCalled()
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
}) 