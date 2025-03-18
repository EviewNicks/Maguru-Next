import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import ModuleTable from '../../components/ModuleTable'
import { Module } from '../../types/module'

// Mock DataTable untuk memudahkan testing
jest.mock('../../components/ModuleTable/DataTable', () => {
  return {
    DataTable: ({ data, isLoading }: { data: Module[], isLoading: boolean }) => (
      <div data-testid="data-table">
        {isLoading ? (
          <div data-testid="loading-state">Loading...</div>
        ) : (
          <div>
            {data.map((module) => (
              <div key={module.id} data-testid={`module-${module.id}`}>
                <h3>{module.title}</h3>
                <p>{module.description}</p>
                <div className="actions">
                  <button>Edit</button>
                  <button>Hapus</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    ),
  }
})

// Mock useQuery
jest.mock('@tanstack/react-query', () => {
  const originalModule = jest.requireActual('@tanstack/react-query')
  return {
    ...originalModule,
    useQuery: jest.fn(),
  }
})

// Mock toast
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
  },
}))

describe('Module Management Integration', () => {
  const mockModules: Module[] = [
    {
      id: '1',
      title: 'Modul Matematika',
      description: 'Deskripsi modul matematika untuk kelas 10',
      status: 'published',
      createdAt: new Date('2025-01-01'),
      updatedAt: new Date('2025-01-10'),
    },
    {
      id: '2',
      title: 'Modul Fisika',
      description: 'Deskripsi modul fisika yang sangat panjang',
      status: 'draft',
      createdAt: new Date('2025-02-01'),
      updatedAt: new Date('2025-02-10'),
    },
  ]

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  })

  beforeEach(() => {
    jest.clearAllMocks()
    // Default mock implementation
    const { useQuery } = jest.requireMock('@tanstack/react-query') as { useQuery: jest.Mock }
    useQuery.mockReturnValue({
      isLoading: false,
      error: null,
      data: mockModules,
    })
  })

  it('should render ModuleTable with data', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <ModuleTable />
      </QueryClientProvider>
    )

    // Verifikasi data-table ditampilkan
    expect(screen.getByTestId('data-table')).toBeInTheDocument()
    
    // Verifikasi modul-modul ditampilkan
    expect(screen.getByTestId('module-1')).toBeInTheDocument()
    expect(screen.getByTestId('module-2')).toBeInTheDocument()
    
    // Verifikasi judul modul ditampilkan
    expect(screen.getByText('Modul Matematika')).toBeInTheDocument()
    expect(screen.getByText('Modul Fisika')).toBeInTheDocument()
  })

  it('should handle loading state correctly', async () => {
    // Set loading state
    const { useQuery } = jest.requireMock('@tanstack/react-query') as { useQuery: jest.Mock }
    useQuery.mockReturnValue({
      isLoading: true,
      error: null,
      data: [],
    })

    render(
      <QueryClientProvider client={queryClient}>
        <ModuleTable />
      </QueryClientProvider>
    )

    // Verifikasi loading state ditampilkan
    expect(screen.getByTestId('loading-state')).toBeInTheDocument()
  })

  it('should handle error state correctly', async () => {
    // Set error state
    const mockError = new Error('Gagal memuat data modul')
    const { useQuery } = jest.requireMock('@tanstack/react-query') as { useQuery: jest.Mock }
    useQuery.mockReturnValue({
      isLoading: false,
      error: mockError,
      data: null,
    })

    render(
      <QueryClientProvider client={queryClient}>
        <ModuleTable />
      </QueryClientProvider>
    )

    // Verifikasi pesan error ditampilkan
    expect(screen.getByText(/Gagal memuat data modul/i)).toBeInTheDocument()
  })
})
