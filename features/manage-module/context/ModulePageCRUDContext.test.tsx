import React from 'react'
import { render, screen, act, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { renderHook } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { modulePageService } from '../services/modulePageService'
import {
  ModulePageCRUDProvider,
  useModulePageCRUDContext,
} from './ModulePageCRUDContext'

// Mock service
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

// Mock react-query
jest.mock('@tanstack/react-query', () => {
  const actual = jest.requireActual('@tanstack/react-query')
  return {
    ...actual,
    useQuery: jest.fn(),
    useMutation: jest.fn().mockImplementation(() => ({
      mutateAsync: jest.fn(),
      isPending: false,
      isError: false,
      isSuccess: false,
    })),
  }
})

// Test component yang menggunakan context
const TestComponent = () => {
  const {
    pages,
    activePage,
    isLoading,
    error,
    createPage,
    updatePage,
    deletePage,
    reorderPages,
    setActivePage,
  } = useModulePageCRUDContext()

  return (
    <div>
      <h1>Test Component</h1>
      {isLoading && <p>Loading...</p>}
      {error && <p>Error: {error.message}</p>}
      {pages.length > 0 && <p>Pages count: {pages.length}</p>}
      {activePage && <p>Active page: {activePage.title}</p>}
      <button
        onClick={() =>
          createPage({
            title: 'New Page',
            moduleId: 'test-module',
            order: 0,
            blocks: [],
          })
        }
      >
        Create Page
      </button>
      {activePage && (
        <>
          <button
            onClick={() =>
              updatePage(activePage.id, { title: 'Updated Title' })
            }
          >
            Update Page
          </button>
          <button onClick={() => deletePage(activePage.id)}>Delete Page</button>
        </>
      )}
    </div>
  )
}

// Setup wrapper untuk testing
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  })
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <ModulePageCRUDProvider moduleId="test-module">
        {children}
      </ModulePageCRUDProvider>
    </QueryClientProvider>
  )
}

describe('ModulePageCRUDContext', () => {
  const mockPages = [
    {
      id: 'page-1',
      title: 'Page 1',
      moduleId: 'test-module',
      order: 0,
      blocks: [],
      status: 'DRAFT',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'page-2',
      title: 'Page 2',
      moduleId: 'test-module',
      order: 1,
      blocks: [],
      status: 'DRAFT',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]

  beforeEach(() => {
    jest.clearAllMocks()

    // Setup mock untuk useQuery
    ;(
      require('@tanstack/react-query').useQuery as jest.Mock
    ).mockImplementation(({ queryKey }) => {
      if (queryKey[0] === 'modulePages') {
        return {
          data: { success: true, data: mockPages },
          isLoading: false,
          error: null,
        }
      }
      return {
        data: null,
        isLoading: false,
        error: null,
      }
    })
  })

  test('provides moduleId and pages from context', async () => {
    render(<TestComponent />, { wrapper: createWrapper() })

    // Verify data is provided
    await waitFor(() => {
      expect(screen.getByText('Pages count: 2')).toBeInTheDocument()
    })
  })

  test('setActivePage updates active page', async () => {
    const wrapper = createWrapper()
    const { result } = renderHook(() => useModulePageCRUDContext(), { wrapper })

    // Set active page
    act(() => {
      result.current.setActivePage(mockPages[1])
    })

    // Verify active page is set
    expect(result.current.activePage).toBe(mockPages[1])
  })

  test('createPage calls service with correct data', async () => {
    const mockCreateFn = jest.fn().mockResolvedValue({
      success: true,
      data: {
        id: 'new-page',
        title: 'New Page',
        moduleId: 'test-module',
        order: 2,
        blocks: [],
        status: 'DRAFT',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    })

    // Setup mutation
    ;(
      require('@tanstack/react-query').useMutation as jest.Mock
    ).mockImplementation(({ mutationFn }) => ({
      mutateAsync: mockCreateFn,
      isPending: false,
      isError: false,
      isSuccess: true,
    }))

    const wrapper = createWrapper()
    const { result } = renderHook(() => useModulePageCRUDContext(), { wrapper })

    // Call createPage
    await act(async () => {
      await result.current.createPage({
        title: 'New Page',
        moduleId: 'test-module',
        order: 2,
        blocks: [],
      })
    })

    // Verify service was called
    expect(mockCreateFn).toHaveBeenCalledWith({
      title: 'New Page',
      moduleId: 'test-module',
      order: 2,
      blocks: [],
    })
  })

  test('error state is exposed through context', async () => {
    // Setup error state
    ;(
      require('@tanstack/react-query').useQuery as jest.Mock
    ).mockImplementation(({ queryKey }) => {
      if (queryKey[0] === 'modulePages') {
        return {
          data: null,
          isLoading: false,
          error: new Error('Failed to load pages'),
        }
      }
      return {
        data: null,
        isLoading: false,
        error: null,
      }
    })

    render(<TestComponent />, { wrapper: createWrapper() })

    // Verify error is shown
    await waitFor(() => {
      expect(
        screen.getByText('Error: Failed to load pages')
      ).toBeInTheDocument()
    })
  })

  test('loading state is exposed through context', async () => {
    // Setup loading state
    ;(
      require('@tanstack/react-query').useQuery as jest.Mock
    ).mockImplementation(({ queryKey }) => {
      if (queryKey[0] === 'modulePages') {
        return {
          data: null,
          isLoading: true,
          error: null,
        }
      }
      return {
        data: null,
        isLoading: false,
        error: null,
      }
    })

    render(<TestComponent />, { wrapper: createWrapper() })

    // Verify loading is shown
    await waitFor(() => {
      expect(screen.getByText('Loading...')).toBeInTheDocument()
    })
  })
})
