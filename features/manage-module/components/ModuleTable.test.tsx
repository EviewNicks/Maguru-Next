import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import ModuleTable from './ModuleTable'
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query'
import { Module } from '../types/module'

// Mock komponen DataTable
jest.mock('./ModuleTable/DataTable', () => {
  return {
    DataTable: ({ data, isLoading }: { data: Module[], isLoading: boolean }) => (
      <div data-testid="data-table">
        <div data-testid="loading-state">{isLoading.toString()}</div>
        <div data-testid="data-length">{data.length}</div>
      </div>
    ),
  }
})

// Mock useQuery
jest.mock('@tanstack/react-query', () => ({
  ...jest.requireActual('@tanstack/react-query'),
  useQuery: jest.fn(),
}))

describe('ModuleTable', () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  })

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks()
    // Default mock implementation
    const mockUseQuery = useQuery as jest.Mock
    mockUseQuery.mockReturnValue({
      isLoading: true,
      error: null,
      data: [],
    })
  })

  it('should render the DataTable component', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <ModuleTable />
      </QueryClientProvider>
    )

    expect(screen.getByTestId('data-table')).toBeInTheDocument()
  })

  it('should pass loading state to DataTable', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <ModuleTable />
      </QueryClientProvider>
    )

    expect(screen.getByTestId('loading-state').textContent).toBe('true')
  })

  it('should handle error state', () => {
    // Mock useQuery to return error
    const mockUseQuery = useQuery as jest.Mock
    mockUseQuery.mockReturnValue({
      isLoading: false,
      error: new Error('Test error'),
      data: null,
    })

    render(
      <QueryClientProvider client={queryClient}>
        <ModuleTable />
      </QueryClientProvider>
    )

    expect(screen.getByText(/Test error/i)).toBeInTheDocument()
  })
})
