// features/manage-module/hooks/useModulePages.test.tsx
import { renderHook, waitFor } from '@testing-library/react'
import { useModulePages } from './useModulePages'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'
import { ModulePageType } from '../schemas/modulePageSchema'

// Mock fetch
global.fetch = jest.fn()

describe('useModulePages', () => {
  let queryClient: QueryClient
  
  beforeEach(() => {
    jest.clearAllMocks()
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    })
  })
  
  // Wrapper untuk React Query
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
  
  it('fetches module pages successfully', async () => {
    // Mock data
    const mockPages = [
      {
        id: '1',
        moduleId: 'module-1',
        order: 1,
        type: ModulePageType.TEORI,
        content: '<p>Konten teori</p>',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: '2',
        moduleId: 'module-1',
        order: 2,
        type: ModulePageType.KODE,
        content: 'console.log("Hello")',
        language: 'javascript',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]
    
    // Mock successful response
    const mockResponse = {
      ok: true,
      json: jest.fn().mockResolvedValue({ pages: mockPages }),
    }
    ;(fetch as jest.Mock).mockResolvedValue(mockResponse)
    
    const { result } = renderHook(() => useModulePages('module-1'), {
      wrapper,
    })
    
    // Initially loading
    expect(result.current.isLoading).toBe(true)
    
    // Wait for the query to complete
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    
    // Verify the data
    expect(result.current.data).toEqual(mockPages)
    
    // Verify fetch was called with the correct URL
    expect(fetch).toHaveBeenCalledWith('/api/modules/module-1/pages')
  })
  
  it('handles fetch error', async () => {
    // Mock error
    const errorMessage = 'Gagal mengambil data halaman modul'
    const mockResponse = {
      ok: false,
      json: jest.fn().mockResolvedValue({ error: errorMessage }),
    }
    ;(fetch as jest.Mock).mockResolvedValue(mockResponse)
    
    const { result } = renderHook(() => useModulePages('module-1'), {
      wrapper,
    })
    
    // Wait for the query to fail
    await waitFor(() => expect(result.current.isError).toBe(true))
    
    // Verify the error
    expect(result.current.error).toBeDefined()
    expect((result.current.error as Error).message).toBe(errorMessage)
  })
  
  it('handles generic error when no error message is provided', async () => {
    // Mock error without specific message
    const mockResponse = {
      ok: false,
      json: jest.fn().mockResolvedValue({}),
    }
    ;(fetch as jest.Mock).mockResolvedValue(mockResponse)
    
    const { result } = renderHook(() => useModulePages('module-1'), {
      wrapper,
    })
    
    // Wait for the query to fail
    await waitFor(() => expect(result.current.isError).toBe(true))
    
    // Verify the error
    expect(result.current.error).toBeDefined()
    expect((result.current.error as Error).message).toBe('Gagal mengambil data halaman modul')
  })
  
  it('handles network error', async () => {
    // Mock network error
    const networkError = new Error('Network error')
    ;(fetch as jest.Mock).mockRejectedValue(networkError)
    
    const { result } = renderHook(() => useModulePages('module-1'), {
      wrapper,
    })
    
    // Wait for the query to fail
    await waitFor(() => expect(result.current.isError).toBe(true))
    
    // Verify the error
    expect(result.current.error).toBeDefined()
    expect(result.current.error).toBe(networkError)
  })
})
