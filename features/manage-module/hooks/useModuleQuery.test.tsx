import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useModuleQuery } from './useModuleQuery'
import * as moduleClientService from '../services/moduleClientService'
import { ReactNode } from 'react'
import { Module, ModuleStatus } from '../types'

// Mock moduleClientService
jest.mock('../services/moduleClientService')
const mockedModuleClientService = moduleClientService as jest.Mocked<typeof moduleClientService>

describe('useModuleQuery', () => {
  // Setup mock data
  const mockModules: Module[] = [
    {
      id: '1',
      title: 'Module 1',
      description: 'Description 1',
      status: ModuleStatus.DRAFT,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'user1',
      updatedBy: 'user1'
    },
    {
      id: '2',
      title: 'Module 2',
      description: 'Description 2',
      status: ModuleStatus.ACTIVE,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'user1',
      updatedBy: 'user1'
    },
  ]

  const mockModule: Module = {
    id: '1',
    title: 'Module 1',
    description: 'Description 1',
    status: ModuleStatus.DRAFT,
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: 'user1',
    updatedBy: 'user1'
  }

  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks()
  })

  // Create a wrapper for React Query
  const createWrapper = () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    })
    
    const Wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )
    Wrapper.displayName = 'QueryClientWrapper';
    
    return Wrapper;
  }

  describe('useModuleListQuery', () => {
    beforeEach(() => {
      mockedModuleClientService.getModules.mockResolvedValue({
        data: mockModules,
        meta: {
          currentPage: 1,
          pageSize: 10,
          totalItems: 2,
          totalPages: 1,
        },
      })
    })

    it('should fetch modules with default params', async () => {
      // Arrange
      const wrapper = createWrapper()

      // Act
      const { result } = renderHook(() => useModuleQuery(), { wrapper })

      // Assert
      expect(result.current.useModuleListQuery).toBeDefined()
      
      // Wait for the query to complete
      await waitFor(() => expect(result.current.useModuleListQuery.isSuccess).toBe(true))
      
      // Check if the service was called with default params
      expect(mockedModuleClientService.getModules).toHaveBeenCalledWith({
        page: 1,
        pageSize: 10,
        search: '',
        status: ModuleStatus.DRAFT,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      })
      
      // Check if the data is correct
      expect(result.current.useModuleListQuery.data).toEqual({
        data: mockModules,
        meta: {
          currentPage: 1,
          pageSize: 10,
          totalItems: 2,
          totalPages: 1,
        },
      })
    })

    it('should fetch modules with custom params', async () => {
      // Arrange
      const wrapper = createWrapper()
      const params = {
        page: 2,
        pageSize: 5,
        search: 'test',
        status: ModuleStatus.DRAFT,
        sortBy: 'title',
        sortOrder: 'asc' as 'asc' | 'desc',
      }

      // Act
      const { result } = renderHook(() => useModuleQuery(params), { wrapper })

      // Wait for the query to complete
      await waitFor(() => expect(result.current.useModuleListQuery.isSuccess).toBe(true))
      
      // Check if the service was called with custom params
      expect(mockedModuleClientService.getModules).toHaveBeenCalledWith(params)
    })
  })

  describe('useModuleDetailQuery', () => {
    beforeEach(() => {
      mockedModuleClientService.getModuleById.mockResolvedValue(mockModule)
    })

    it('should fetch module by id', async () => {
      // Arrange
      const wrapper = createWrapper()
      const moduleId = '1'

      // Act
      const { result } = renderHook(() => useModuleQuery({ moduleId }), { wrapper })

      // Assert
      expect(result.current.useModuleDetailQuery).toBeDefined()
      
      // Wait for the query to complete
      await waitFor(() => expect(result.current.useModuleDetailQuery.isSuccess).toBe(true))
      
      // Check if the service was called with correct id
      expect(mockedModuleClientService.getModuleById).toHaveBeenCalledWith(moduleId)
      
      // Check if the data is correct
      expect(result.current.useModuleDetailQuery.data).toEqual(mockModule)
    })

    it('should handle error when fetching module by id', async () => {
      // Arrange
      const wrapper = createWrapper()
      const moduleId = '999'
      const error = new Error('Module not found')
      mockedModuleClientService.getModuleById.mockRejectedValue(error)

      // Act
      const { result } = renderHook(() => useModuleQuery({ moduleId }), { wrapper })

      // Wait for the query to fail
      await waitFor(() => expect(result.current.useModuleDetailQuery.isError).toBe(true))
      
      // Check if error is correct
      expect(result.current.useModuleDetailQuery.error).toEqual(error)
    })
  })
})
