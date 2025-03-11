
import { renderHook, waitFor } from '@testing-library/react'
import { useModules } from './useModules'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import axios from 'axios'
import { ModuleStatus } from '../types'

// Mock axios
jest.mock('axios')
const mockedAxios = axios as jest.Mocked<typeof axios>

// Setup wrapper dengan QueryClientProvider
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
      {children}
    </QueryClientProvider>
  )
}

describe('useModules', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })
  
  it('fetches modules with default parameters', async () => {
    // Mock response data
    const mockData = {
      modules: [
        {
          id: '1',
          title: 'Modul Matematika',
          description: 'Deskripsi modul matematika',
          status: ModuleStatus.ACTIVE,
          createdAt: new Date('2025-01-01'),
          updatedAt: new Date('2025-01-02'),
          createdBy: 'user1',
          updatedBy: 'user1'
        }
      ],
      pagination: {
        count: 1,
        hasMore: false
      }
    }
    
    mockedAxios.get.mockResolvedValueOnce({ data: mockData })
    
    const { result } = renderHook(() => useModules(), {
      wrapper: createWrapper()
    })
    
    // Initially in loading state
    expect(result.current.isLoading).toBe(true)
    
    // Wait for the query to resolve
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    
    // Check if axios was called with correct URL
    expect(mockedAxios.get).toHaveBeenCalledWith('/api/modules?limit=10')
    
    // Check if data is returned correctly
    expect(result.current.data).toEqual(mockData)
  })
  
  it('fetches modules with custom parameters', async () => {
    // Mock response data
    const mockData = {
      modules: [
        {
          id: '1',
          title: 'Modul Matematika',
          description: 'Deskripsi modul matematika',
          status: ModuleStatus.ACTIVE,
          createdAt: new Date('2025-01-01'),
          updatedAt: new Date('2025-01-02'),
          createdBy: 'user1',
          updatedBy: 'user1'
        }
      ],
      pagination: {
        count: 1,
        hasMore: false
      }
    }
    
    mockedAxios.get.mockResolvedValueOnce({ data: mockData })
    
    const { result } = renderHook(() => useModules({
      status: ModuleStatus.ACTIVE,
      search: 'matematika',
      limit: 20,
      cursor: 'abc123'
    }), {
      wrapper: createWrapper()
    })
    
    // Wait for the query to resolve
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    
    // Check if axios was called with correct URL and parameters
    expect(mockedAxios.get).toHaveBeenCalledWith(
      '/api/modules?status=ACTIVE&search=matematika&limit=20&cursor=abc123'
    )
    
    // Check if data is returned correctly
    expect(result.current.data).toEqual(mockData)
  })
  
  it('handles error when API request fails', async () => {
    // Mock error response
    mockedAxios.get.mockRejectedValueOnce(new Error('Network error'))
    
    const { result } = renderHook(() => useModules(), {
      wrapper: createWrapper()
    })
    
    // Wait for the query to fail
    await waitFor(() => expect(result.current.isError).toBe(true))
    
    // Check if error is returned
    expect(result.current.error).toBeDefined()
  })
})
