import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ModuleTable } from './ModuleTable'
import { useModuleQuery } from '../hooks/useModuleQuery'
import { ModuleStatus, Module } from '../types'

// Mock hook useModuleQuery
jest.mock('../hooks/useModuleQuery', () => ({
  useModuleQuery: jest.fn(),
}))

// Mock ErrorNotifier
jest.mock('./ErrorNotifier', () => ({
  showErrorNotification: jest.fn(),
}))

// Mock ModuleFormModal
jest.mock('./ModuleFormModal', () => ({
  __esModule: true,
  default: ({ isOpen }: { isOpen: boolean }) =>
    isOpen ? <div>Mock Form Modal</div> : null,
}))

// Mock data
const mockModules = {
  data: [
    {
      id: '1',
      title: 'HTML Pemula',
      description: 'Kelas pertama untuk masuk ke Programming Web Developer',
      status: ModuleStatus.DRAFT,
      createdAt: new Date('2025-05-09T07:02:43.474Z'),
      updatedAt: new Date('2025-05-09T07:02:43.474Z'),
      createdBy: 'user_123',
      updatedBy: 'user_123',
    },
    {
      id: '2',
      title: 'CSS Pemula',
      description:
        'Setelah mempelajari HTML, selanjutnya materi bagaimana cara mengubah sebuah text',
      status: ModuleStatus.DRAFT,
      createdAt: new Date('2025-05-09T07:01:14.091Z'),
      updatedAt: new Date('2025-05-09T07:01:14.091Z'),
      createdBy: 'user_123',
      updatedBy: 'user_123',
    },
    {
      id: '3',
      title: 'Javascript Pemula',
      description: 'Setelah kita belajar bagian tampilan website',
      status: ModuleStatus.ACTIVE,
      createdAt: new Date('2025-05-09T07:04:24.115Z'),
      updatedAt: new Date('2025-05-09T07:04:24.115Z'),
      createdBy: 'user_123',
      updatedBy: 'user_123',
    },
    {
      id: '4',
      title: 'HTML ES6',
      description: 'Materi lanjutan HTML',
      status: ModuleStatus.ARCHIVED,
      createdAt: new Date('2025-05-09T07:05:41.542Z'),
      updatedAt: new Date('2025-05-09T07:05:41.542Z'),
      createdBy: 'user_123',
      updatedBy: 'user_123',
    },
  ],
  meta: {
    currentPage: 1,
    totalPages: 1,
    pageSize: 10,
    totalItems: 4,
  },
}

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  })

  const TestWrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )

  TestWrapper.displayName = 'TestQueryClientProvider'

  return TestWrapper
}

describe('ModuleTable', () => {
  const mockUseModuleListQuery = {
    data: mockModules,
    isLoading: false,
    error: null,
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useModuleQuery as jest.Mock).mockReturnValue({
      useModuleListQuery: mockUseModuleListQuery,
    })
  })

  it('should render table with all modules by default', () => {
    render(<ModuleTable />, { wrapper: createWrapper() })

    // Periksa apakah semua judul modul ditampilkan saat filter 'all'
    expect(screen.getByText('HTML Pemula')).toBeInTheDocument()
    expect(screen.getByText('CSS Pemula')).toBeInTheDocument()
    expect(screen.getByText('Javascript Pemula')).toBeInTheDocument()
    expect(screen.getByText('HTML ES6')).toBeInTheDocument()
  })

  it('should show only ACTIVE modules when filtering by active status', async () => {
    const mockFilteredQuery = {
      useModuleListQuery: {
        data: {
          ...mockModules,
          data: mockModules.data.filter(
            (m) => m.status === ModuleStatus.ACTIVE
          ),
        },
        isLoading: false,
        error: null,
      },
    }

    // Mock pertama untuk render awal dengan semua modul
    ;(useModuleQuery as jest.Mock).mockReturnValueOnce({
      useModuleListQuery: mockUseModuleListQuery,
    })

    // Mock kedua untuk setelah memilih filter active
    ;(useModuleQuery as jest.Mock).mockReturnValueOnce(mockFilteredQuery)

    render(<ModuleTable />, { wrapper: createWrapper() })

    // Simulasikan klik pada dropdown filter
    fireEvent.click(screen.getByRole('combobox'))

    // Pilih status 'Aktif'
    fireEvent.click(screen.getByText('Aktif'))

    // Setup panggilan mock untuk filter status
    ;(useModuleQuery as jest.Mock).mockReturnValue(mockFilteredQuery)

    // Verifikasi bahwa filter telah diubah dan hanya modul dengan status ACTIVE yang ditampilkan
    await waitFor(() => {
      expect(useModuleQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          status: ModuleStatus.ACTIVE,
        })
      )
    })
  })

  it('should show only DRAFT modules when filtering by draft status', async () => {
    const mockFilteredQuery = {
      useModuleListQuery: {
        data: {
          ...mockModules,
          data: mockModules.data.filter((m) => m.status === ModuleStatus.DRAFT),
        },
        isLoading: false,
        error: null,
      },
    }

    // Mock pertama untuk render awal dengan semua modul
    ;(useModuleQuery as jest.Mock).mockReturnValueOnce({
      useModuleListQuery: mockUseModuleListQuery,
    })

    // Mock kedua untuk setelah memilih filter draft
    ;(useModuleQuery as jest.Mock).mockReturnValueOnce(mockFilteredQuery)

    render(<ModuleTable />, { wrapper: createWrapper() })

    // Simulasikan klik pada dropdown filter
    fireEvent.click(screen.getByRole('combobox'))

    // Pilih status 'Draft'
    fireEvent.click(screen.getByText('Draft'))

    // Setup panggilan mock untuk filter status
    ;(useModuleQuery as jest.Mock).mockReturnValue(mockFilteredQuery)

    // Verifikasi bahwa filter telah diubah dan hanya modul dengan status DRAFT yang ditampilkan
    await waitFor(() => {
      expect(useModuleQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          status: ModuleStatus.DRAFT,
        })
      )
    })
  })

  it('should show only ARCHIVED modules when filtering by archived status', async () => {
    const mockFilteredQuery = {
      useModuleListQuery: {
        data: {
          ...mockModules,
          data: mockModules.data.filter(
            (m) => m.status === ModuleStatus.ARCHIVED
          ),
        },
        isLoading: false,
        error: null,
      },
    }

    // Mock pertama untuk render awal dengan semua modul
    ;(useModuleQuery as jest.Mock).mockReturnValueOnce({
      useModuleListQuery: mockUseModuleListQuery,
    })

    // Mock kedua untuk setelah memilih filter archived
    ;(useModuleQuery as jest.Mock).mockReturnValueOnce(mockFilteredQuery)

    render(<ModuleTable />, { wrapper: createWrapper() })

    // Simulasikan klik pada dropdown filter
    fireEvent.click(screen.getByRole('combobox'))

    // Pilih status 'Diarsipkan'
    fireEvent.click(screen.getByText('Diarsipkan'))

    // Setup panggilan mock untuk filter status
    ;(useModuleQuery as jest.Mock).mockReturnValue(mockFilteredQuery)

    // Verifikasi bahwa filter telah diubah dan hanya modul dengan status ARCHIVED yang ditampilkan
    await waitFor(() => {
      expect(useModuleQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          status: ModuleStatus.ARCHIVED,
        })
      )
    })
  })

  it('should show loading state correctly', () => {
    ;(useModuleQuery as jest.Mock).mockReturnValue({
      useModuleListQuery: {
        data: null,
        isLoading: true,
        error: null,
      },
    })

    render(<ModuleTable />, { wrapper: createWrapper() })

    // Verifikasi loading state
    expect(screen.getAllByTestId('skeleton')[0]).toBeInTheDocument()
  })

  it('should show error state correctly', () => {
    ;(useModuleQuery as jest.Mock).mockReturnValue({
      useModuleListQuery: {
        data: null,
        isLoading: false,
        error: new Error('Test error'),
      },
    })

    render(<ModuleTable />, { wrapper: createWrapper() })

    // Verifikasi error state
    expect(
      screen.getByText('Gagal memuat data. Silakan coba lagi.')
    ).toBeInTheDocument()
  })

  it('should filter modules by status', async () => {
    render(<ModuleTable />)

    // Cari dropdown filter status
    const statusFilterTrigger = screen.getByText('Semua Status')
    fireEvent.click(statusFilterTrigger)

    // Klik opsi "Aktif"
    const activeOption = screen.getByText('Aktif')
    fireEvent.click(activeOption)

    // Verifikasi useModuleQuery dipanggil dengan status ACTIVE
    await waitFor(() => {
      expect(useModuleQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          status: ModuleStatus.ACTIVE,
        })
      )
    })

    // Simulasi hasil filter
    ;(useModuleQuery as jest.Mock).mockReturnValue({
      useModuleListQuery: {
        data: {
          data: mockModules.data.filter(
            (m) => m.status === ModuleStatus.ACTIVE
          ),
          meta: { ...mockModules.meta, totalItems: 1 },
        },
        isLoading: false,
        error: null,
      },
    })

    // Render ulang dengan hasil filter baru
    render(<ModuleTable />)

    // Pastikan hanya modul active yang ditampilkan
    expect(screen.getByText('CSS Pemula')).toBeInTheDocument()
    expect(screen.queryByText('HTML Pemula')).not.toBeInTheDocument()
    expect(screen.queryByText('Javascript Pemula')).not.toBeInTheDocument()
    expect(screen.queryByText('HTML ES6')).not.toBeInTheDocument()
  })
})
