import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { DataTableWithFeatures } from './DataTableWithFeatures'
import { useModuleQuery } from '../../hooks/useModuleQuery'
import { ModuleStatus } from '../../types/index'
import { Module } from '../../types/index'
import { toast } from 'sonner'
import { handleError } from '../ErrorNotifier/ErrorNotifier'

// Mock komponen-komponen
jest.mock('./SearchAndFilter', () => ({
  SearchAndFilter: jest.fn(({ onFilterChange }) => {
    // Simulasi filter status tanpa useEffect
    setTimeout(() => onFilterChange(ModuleStatus.DRAFT), 0)
    return <div data-testid="search-filter">Search Filter</div>
  })
}))

jest.mock('./DataTable', () => ({
  DataTable: jest.fn(({ data }) => (
    <div data-testid="data-table">
      {data.map((module: Module) => (
        <div key={module.id}>{module.title}</div>
      ))}
    </div>
  ))
}))

jest.mock('./PaginationControls', () => ({
  PaginationControls: jest.fn(() => <div data-testid="pagination">Pagination</div>)
}))

// Mock useModuleQuery
jest.mock('../../hooks/useModuleQuery', () => ({
  useModuleQuery: jest.fn(),
}))

// Mock toast
jest.mock('sonner', () => ({
  toast: {
    error: jest.fn(),
  },
}))

// Mock handleError
jest.mock('../ErrorNotifier/ErrorNotifier', () => ({
  handleError: jest.fn().mockReturnValue({
    message: 'Error Message',
    code: 'ERROR_CODE',
  }),
}))

const mockModules = [
  {
    id: '1',
    title: 'Modul Matematika',
    description: 'Deskripsi modul matematika',
    status: ModuleStatus.ACTIVE,
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-02'),
    createdBy: '1',
    updatedBy: '1',
  },
  {
    id: '2',
    title: 'Modul Bahasa',
    description: 'Deskripsi modul bahasa',
    status: ModuleStatus.DRAFT,
    createdAt: new Date('2023-02-01'),
    updatedAt: new Date('2023-02-02'),
    createdBy: '1',
    updatedBy: '1',
  }
]

describe('DataTableWithFeatures', () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  })

  beforeEach(() => {
    jest.clearAllMocks();
    (useModuleQuery as jest.Mock).mockReturnValue({
      useModuleListQuery: {
        data: {
          data: mockModules,
          meta: {
            currentPage: 1,
            totalPages: 1,
            pageSize: 10,
            totalItems: 2
          }
        },
        isLoading: false,
        error: null,
      }
    })
  })

  const renderComponent = () => {
    return render(
      <QueryClientProvider client={queryClient}>
        <DataTableWithFeatures />
      </QueryClientProvider>
    )
  }

  test('renders data table with modules', () => {
    renderComponent()

    // Cek apakah komponen-komponen utama ditampilkan
    expect(screen.getByTestId('search-filter')).toBeInTheDocument()
    expect(screen.getByTestId('data-table')).toBeInTheDocument()
    expect(screen.getByTestId('pagination')).toBeInTheDocument()

    // Cek apakah judul modul ditampilkan di DataTable
    expect(screen.getByText('Modul Matematika')).toBeInTheDocument()
    expect(screen.getByText('Modul Bahasa')).toBeInTheDocument()
  })

  test('handles search functionality', () => {
    renderComponent()
    
    // Verifikasi bahwa useModuleQuery dipanggil dengan parameter yang benar
    expect(useModuleQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        page: 1,
        pageSize: 10,
        search: ''
      })
    )
  })

  test('handles status filter', async () => {
    // Setup spy untuk useModuleQuery
    const spy = jest.fn()
    ;(useModuleQuery as jest.Mock).mockImplementation((params) => {
      spy(params)
      return {
        useModuleListQuery: {
          data: {
            data: mockModules,
            meta: {
              currentPage: 1,
              totalPages: 1,
              pageSize: 10,
              totalItems: 2
            }
          },
          isLoading: false,
          error: null,
        }
      }
    })

    renderComponent()
    
    // Tunggu sampai onFilterChange dipanggil
    await waitFor(() => {
      expect(spy).toHaveBeenCalledWith(
        expect.objectContaining({
          status: ModuleStatus.DRAFT
        })
      )
    })
  })

  test('handles pagination', () => {
    renderComponent()
    
    // Verifikasi bahwa useModuleQuery dipanggil dengan parameter yang benar
    expect(useModuleQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        page: 1
      })
    )
  })

  test('displays error state when query fails', () => {
    const errorMessage = 'Gagal memuat data';
    (useModuleQuery as jest.Mock).mockReturnValueOnce({
      useModuleListQuery: {
        data: null,
        isLoading: false,
        error: new Error(errorMessage),
      }
    })

    renderComponent()

    // Cek apakah toast.error dipanggil dengan parameter yang benar
    expect(handleError).toHaveBeenCalledWith(new Error(errorMessage))
    expect(toast.error).toHaveBeenCalledWith('Error Message', {
      description: 'ERROR_CODE'
    })
  })
})
