import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useModuleMutation, CreateModuleInput, UpdateModuleInput } from './useModuleMutation'
import * as moduleClientService from '../services/moduleClientService'
import { ReactNode } from 'react'
import { Module, ModuleStatus } from '../types'

// Mock moduleClientService
jest.mock('../services/moduleClientService')
const mockedModuleClientService = moduleClientService as jest.Mocked<typeof moduleClientService>

describe('useModuleMutation', () => {
  // Setup mock data
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

  describe('createModuleMutation', () => {
    beforeEach(() => {
      mockedModuleClientService.createModule.mockResolvedValue(mockModule)
    })

    it('should call createModule with correct data', async () => {
      // Arrange
      const wrapper = createWrapper()
      const newModule: CreateModuleInput = {
        title: 'New Module',
        description: 'New Description',
        status: ModuleStatus.DRAFT,
      }

      // Act
      const { result } = renderHook(() => useModuleMutation(), { wrapper })
      
      // Assert
      expect(result.current.createModuleMutation).toBeDefined()
      
      // Call the mutation
      result.current.createModuleMutation.mutate(newModule)
      
      // Wait for the mutation to complete
      await waitFor(() => expect(result.current.createModuleMutation.isSuccess).toBe(true))
      
      // Check if the service was called with correct data
      expect(mockedModuleClientService.createModule).toHaveBeenCalledWith(newModule)
    })

    it('should handle errors when creating module', async () => {
      // Arrange
      const wrapper = createWrapper()
      const error = new Error('Failed to create module')
      mockedModuleClientService.createModule.mockRejectedValue(error)
      
      // Act
      const { result } = renderHook(() => useModuleMutation(), { wrapper })
      
      // Call the mutation
      result.current.createModuleMutation.mutate({
        title: 'Test Module',
        description: 'Test Description',
        status: ModuleStatus.DRAFT,
      })
      
      // Wait for the mutation to fail
      await waitFor(() => expect(result.current.createModuleMutation.isError).toBe(true))
      
      // Check if error is correct
      expect(result.current.createModuleMutation.error).toEqual(error)
    })
  })

  describe('updateModuleMutation', () => {
    beforeEach(() => {
      mockedModuleClientService.updateModule.mockResolvedValue(mockModule)
    })

    it('should call updateModule with correct data', async () => {
      // Arrange
      const wrapper = createWrapper()
      const updateData: UpdateModuleInput = {
        id: '1',
        title: 'Updated Module',
        description: 'Updated Description',
        status: ModuleStatus.ACTIVE,
      }

      // Act
      const { result } = renderHook(() => useModuleMutation(), { wrapper })
      
      // Call the mutation
      result.current.updateModuleMutation.mutate(updateData)
      
      // Wait for the mutation to complete
      await waitFor(() => expect(result.current.updateModuleMutation.isSuccess).toBe(true))
      
      // Check if the service was called with correct data
      expect(mockedModuleClientService.updateModule).toHaveBeenCalledWith('1', {
        title: 'Updated Module',
        description: 'Updated Description',
        status: ModuleStatus.ACTIVE,
      })
    })
  })

  describe('deleteModuleMutation', () => {
    beforeEach(() => {
      mockedModuleClientService.deleteModule.mockResolvedValue(undefined)
    })

    it('should call deleteModule with correct id', async () => {
      // Arrange
      const wrapper = createWrapper()
      const moduleId = '1'

      // Act
      const { result } = renderHook(() => useModuleMutation(), { wrapper })
      
      // Call the mutation
      result.current.deleteModuleMutation.mutate(moduleId)
      
      // Wait for the mutation to complete
      await waitFor(() => expect(result.current.deleteModuleMutation.isSuccess).toBe(true))
      
      // Check if the service was called with correct id
      expect(mockedModuleClientService.deleteModule).toHaveBeenCalledWith(moduleId)
    })
  })
})
