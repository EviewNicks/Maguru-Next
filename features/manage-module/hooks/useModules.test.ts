import { renderHook, waitFor } from '@testing-library/react'
import { useModules } from './useModules'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import axios from 'axios'
import { ModuleStatus } from '../types'
import React, { ReactNode } from 'react'

// Mock axios
jest.mock('axios')
const mockedAxios = axios as jest.Mocked<typeof axios>

// Setup wrapper dengan QueryClientProvider
const createTestWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  })
  
  const TestWrapper = ({ children }: { children: ReactNode }) => {
    return React.createElement(
      QueryClientProvider,
      { client: queryClient },
      children
    );
  };
  
  TestWrapper.displayName = 'TestWrapper';
  
  return TestWrapper;
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
      wrapper: createTestWrapper()
    })
    
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })
    
    expect(mockedAxios.get).toHaveBeenCalledWith('/api/modules?limit=10')
    expect(result.current.data?.pages[0]).toEqual(mockData)
  })
  
  it('fetches modules with custom parameters', async () => {
    // Mock response data
    const mockData = {
      modules: [
        {
          id: '2',
          title: 'Modul Fisika',
          description: 'Deskripsi modul fisika',
          status: ModuleStatus.DRAFT,
          createdAt: new Date('2025-01-03'),
          updatedAt: new Date('2025-01-04'),
          createdBy: 'user2',
          updatedBy: 'user2'
        }
      ],
      pagination: {
        count: 1,
        hasMore: false
      }
    }
    
    mockedAxios.get.mockResolvedValueOnce({ data: mockData })
    
    const { result } = renderHook(() => useModules({ 
      status: ModuleStatus.DRAFT,
      limit: 5,
      search: 'fisika'
    }), {
      wrapper: createTestWrapper()
    })
    
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })
    
    expect(mockedAxios.get).toHaveBeenCalledWith('/api/modules?status=DRAFT&search=fisika&limit=5')
    expect(result.current.data?.pages[0]).toEqual(mockData)
  })
})
