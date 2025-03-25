import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useModuleQuery, QueryParams } from '../../hooks/useModuleQuery'
import { useModuleMutation } from '../../hooks/useModuleMutation'
import { ModuleStatus } from '../../types'
import * as moduleClientService from '../../services/moduleClientService'

// Mock moduleClientService
jest.mock('../../services/moduleClientService', () => ({
  getModules: jest.fn(),
  getModuleById: jest.fn(),
  createModule: jest.fn(),
  updateModule: jest.fn(),
  deleteModule: jest.fn(),
}))

// Mock data
const mockModules = {
  data: [
    {
      id: '1',
      title: 'Modul Test 1',
      description: 'Deskripsi test 1',
      status: ModuleStatus.ACTIVE,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'user1',
      updatedBy: 'user1',
    },
    {
      id: '2',
      title: 'Modul Test 2',
      description: 'Deskripsi test 2',
      status: ModuleStatus.DRAFT,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'user1',
      updatedBy: 'user1',
    },
  ],
  meta: {
    currentPage: 1,
    totalPages: 1,
    pageSize: 10,
    totalItems: 2,
  },
}

// Test component untuk useModuleQuery
function TestQueryComponent({ params = {} }: { params?: QueryParams }) {
  const { useModuleListQuery, useModuleDetailQuery } = useModuleQuery(params)
  
  const { data, isLoading, isError, error } = useModuleListQuery
  const moduleDetailQuery = useModuleDetailQuery

  if (isLoading) return <div>Loading...</div>
  if (isError) return <div>Error: {(error as Error).message}</div>
  
  return (
    <div>
      <h1>Modules</h1>
      <p data-testid="total-items">Total: {data?.meta.totalItems}</p>
      <ul>
        {data?.data.map((module) => (
          <li key={module.id} data-testid={`module-${module.id}`}>
            {module.title} - {module.status}
            {params.moduleId && moduleDetailQuery.data && (
              <span data-testid={`module-detail-${module.id}`}>
                {moduleDetailQuery.data.title}
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}

// Test component untuk useModuleMutation
function TestMutationComponent() {
  const { 
    createModuleMutation, 
    updateModuleMutation, 
    deleteModuleMutation 
  } = useModuleMutation()
  
  const handleCreate = () => {
    createModuleMutation.mutate({
      title: 'Modul Baru',
      description: 'Deskripsi baru',
      status: ModuleStatus.DRAFT,
    })
  }
  
  const handleUpdate = () => {
    updateModuleMutation.mutate({
      id: '1',
      title: 'Modul Updated',
      status: ModuleStatus.ACTIVE,
    })
  }
  
  const handleDelete = () => {
    deleteModuleMutation.mutate('2')
  }
  
  return (
    <div>
      <button onClick={handleCreate} data-testid="create-button">Create</button>
      <button onClick={handleUpdate} data-testid="update-button">Update</button>
      <button onClick={handleDelete} data-testid="delete-button">Delete</button>
      
      {createModuleMutation.isPending && <p data-testid="create-loading">Creating...</p>}
      {updateModuleMutation.isPending && <p data-testid="update-loading">Updating...</p>}
      {deleteModuleMutation.isPending && <p data-testid="delete-loading">Deleting...</p>}
      
      {createModuleMutation.isSuccess && <p data-testid="create-success">Created!</p>}
      {updateModuleMutation.isSuccess && <p data-testid="update-success">Updated!</p>}
      {deleteModuleMutation.isSuccess && <p data-testid="delete-success">Deleted!</p>}
      
      {createModuleMutation.isError && <p data-testid="create-error">Create Error!</p>}
      {updateModuleMutation.isError && <p data-testid="update-error">Update Error!</p>}
      {deleteModuleMutation.isError && <p data-testid="delete-error">Delete Error!</p>}
    </div>
  )
}

describe('Module API Integration', () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  })
  
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
  
  beforeEach(() => {
    jest.clearAllMocks()
    queryClient.clear()
  })
  
  it('should fetch and display modules', async () => {
    // Setup mock
    const mockGetModules = jest.mocked(moduleClientService.getModules)
    mockGetModules.mockResolvedValue(mockModules)
    
    // Render component
    render(<TestQueryComponent />, { wrapper })
    
    // Check loading state
    expect(screen.getByText('Loading...')).toBeInTheDocument()
    
    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('Modules')).toBeInTheDocument()
    })
    
    // Check if data is displayed correctly
    expect(screen.getByTestId('total-items')).toHaveTextContent('Total: 2')
    expect(screen.getByTestId('module-1')).toHaveTextContent('Modul Test 1 - ACTIVE')
    expect(screen.getByTestId('module-2')).toHaveTextContent('Modul Test 2 - DRAFT')
  })
  
  it('should handle error when fetching modules', async () => {
    // Setup mock to throw error
    const mockGetModules = jest.mocked(moduleClientService.getModules)
    mockGetModules.mockRejectedValue(new Error('Error fetching modules'))
    
    // Render component
    render(<TestQueryComponent />, { wrapper })
    
    // Wait for error to show
    await waitFor(() => {
      expect(screen.getByText('Error: Error fetching modules')).toBeInTheDocument()
    })
  })
  
  it('should create module with optimistic update', async () => {
    // Setup mocks
    const mockGetModules = jest.mocked(moduleClientService.getModules)
    mockGetModules.mockResolvedValue(mockModules)
    
    const mockCreateModule = jest.mocked(moduleClientService.createModule)
    mockCreateModule.mockResolvedValue({
      id: '3',
      title: 'Modul Baru',
      description: 'Deskripsi baru',
      status: ModuleStatus.DRAFT,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'user1',
      updatedBy: 'user1',
    })
    
    // Render components
    render(
      <>
        <TestQueryComponent />
        <TestMutationComponent />
      </>,
      { wrapper }
    )
    
    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('Modules')).toBeInTheDocument()
    })
    
    // Initial state: 2 modules
    expect(screen.getByTestId('total-items')).toHaveTextContent('Total: 2')
    
    // Click create button
    screen.getByTestId('create-button').click()
    
    // Wait for success message
    await waitFor(() => {
      expect(screen.getByTestId('create-success')).toBeInTheDocument()
    })
    
    // Check if createModule was called with correct data
    expect(mockCreateModule).toHaveBeenCalledWith({
      title: 'Modul Baru',
      description: 'Deskripsi baru',
      status: ModuleStatus.DRAFT,
    })
    
    // Verify that query is invalidated and refetched
    expect(mockGetModules).toHaveBeenCalledTimes(2)
  })
  
  it('should update module with optimistic update', async () => {
    // Setup mocks
    const mockGetModules = jest.mocked(moduleClientService.getModules)
    mockGetModules.mockResolvedValue(mockModules)
    
    const mockUpdateModule = jest.mocked(moduleClientService.updateModule)
    mockUpdateModule.mockResolvedValue({
      id: '1',
      title: 'Modul Updated',
      description: 'Deskripsi test 1',
      status: ModuleStatus.ACTIVE,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'user1',
      updatedBy: 'user1',
    })
    
    // Render components
    render(
      <>
        <TestQueryComponent />
        <TestMutationComponent />
      </>,
      { wrapper }
    )
    
    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('Modules')).toBeInTheDocument()
    })
    
    // Click update button
    screen.getByTestId('update-button').click()
    
    // Wait for success message
    await waitFor(() => {
      expect(screen.getByTestId('update-success')).toBeInTheDocument()
    })
    
    // Check if updateModule was called with correct data
    expect(mockUpdateModule).toHaveBeenCalledWith('1', {
      title: 'Modul Updated',
      status: ModuleStatus.ACTIVE,
    })
    
    // Verify that query is invalidated and refetched
    expect(mockGetModules).toHaveBeenCalledTimes(2)
  })
  
  it('should delete module with optimistic update', async () => {
    // Setup mocks
    const mockGetModules = jest.mocked(moduleClientService.getModules)
    mockGetModules.mockResolvedValue(mockModules)
    
    const mockDeleteModule = jest.mocked(moduleClientService.deleteModule)
    mockDeleteModule.mockResolvedValue(undefined)
    
    // Render components
    render(
      <>
        <TestQueryComponent />
        <TestMutationComponent />
      </>,
      { wrapper }
    )
    
    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('Modules')).toBeInTheDocument()
    })
    
    // Initial state: 2 modules
    expect(screen.getByTestId('total-items')).toHaveTextContent('Total: 2')
    
    // Click delete button
    screen.getByTestId('delete-button').click()
    
    // Wait for success message
    await waitFor(() => {
      expect(screen.getByTestId('delete-success')).toBeInTheDocument()
    })
    
    // Check if deleteModule was called with correct id
    expect(mockDeleteModule).toHaveBeenCalledWith('2')
    
    // Verify that query is invalidated and refetched
    expect(mockGetModules).toHaveBeenCalledTimes(2)
  })

  it('should fetch module by id', async () => {
    // Setup mock
    const mockGetModuleById = jest.mocked(moduleClientService.getModuleById)
    mockGetModuleById.mockResolvedValue(mockModules.data[0])
    
    // Render component
    render(
      <TestQueryComponent 
        params={{ 
          moduleId: mockModules.data[0].id 
        }} 
      />, 
      { wrapper }
    )
    
    // Wait for module detail to load
    await waitFor(() => {
      const moduleDetailElement = screen.getByTestId(`module-detail-${mockModules.data[0].id}`)
      expect(moduleDetailElement).toHaveTextContent(mockModules.data[0].title)
    })
    
    // Check if getModuleById was called with correct id
    expect(mockGetModuleById).toHaveBeenCalledWith(mockModules.data[0].id)
  })

  it('should handle error when fetching module by id', async () => {
    // Setup mock to throw error
    const mockGetModuleById = jest.mocked(moduleClientService.getModuleById)
    mockGetModuleById.mockRejectedValue(new Error('Error fetching module'))
    
    // Render component
    render(
      <TestQueryComponent 
        params={{ 
          moduleId: 'non-existent-id' 
        }} 
      />, 
      { wrapper }
    )
    
    // Wait for error to show
    await waitFor(() => {
      expect(mockGetModuleById).toHaveBeenCalledWith('non-existent-id')
    })
  })
})
