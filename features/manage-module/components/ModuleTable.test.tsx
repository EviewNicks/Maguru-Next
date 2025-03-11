import { render, screen, fireEvent } from '@testing-library/react'
import { ModuleTable } from './ModuleTable'
import { ModuleStatus } from '../types'

// Mock hooks dan komponen
jest.mock('../hooks/useModules', () => ({
  useModules: jest.fn(),
}))

jest.mock('./ModuleFilter', () => ({
  ModuleFilter: jest.fn(() => <div data-testid="module-filter">Filter Mock</div>),
}))

jest.mock('./ModuleFormModal', () => ({
  ModuleFormModal: jest.fn(() => <div data-testid="module-form-modal">Form Modal Mock</div>),
}))

jest.mock('./DeleteModuleDialog', () => ({
  DeleteModuleDialog: jest.fn(() => <div data-testid="delete-module-dialog">Delete Dialog Mock</div>),
}))

// Import hooks setelah mock
import { useModules } from '../hooks/useModules'

describe('ModuleTable', () => {
  const mockModules = [
    {
      id: '1',
      title: 'Modul Matematika',
      description: 'Deskripsi modul matematika',
      status: ModuleStatus.ACTIVE,
      createdAt: new Date('2023-01-01'),
      updatedAt: new Date('2023-01-02'),
      createdBy: 'user1',
      updatedBy: 'user1',
    },
    {
      id: '2',
      title: 'Modul Bahasa Indonesia',
      description: 'Deskripsi modul bahasa',
      status: ModuleStatus.DRAFT,
      createdAt: new Date('2023-01-03'),
      updatedAt: new Date('2023-01-04'),
      createdBy: 'user2',
      updatedBy: 'user2',
    },
  ]

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('menampilkan loading state saat data sedang dimuat', () => {
    // Mock loading state
    ;(useModules as jest.Mock).mockReturnValue({
      data: null,
      isLoading: true,
      isError: false,
      error: null,
    })

    render(<ModuleTable />)

    expect(screen.getByText('Memuat data modul...')).toBeInTheDocument()
  })

  it('menampilkan error state saat terjadi kesalahan', () => {
    // Mock error state
    ;(useModules as jest.Mock).mockReturnValue({
      data: null,
      isLoading: false,
      isError: true,
      error: new Error('Test error'),
    })

    render(<ModuleTable />)

    expect(screen.getByText(/error: test error/i)).toBeInTheDocument()
  })

  it('menampilkan data modul dalam tabel', () => {
    // Mock successful data fetch
    ;(useModules as jest.Mock).mockReturnValue({
      data: {
        modules: mockModules,
        pagination: {
          count: 2,
          hasMore: false,
        },
      },
      isLoading: false,
      isError: false,
      error: null,
    })

    render(<ModuleTable />)

    // Cek apakah filter komponen ditampilkan
    expect(screen.getByTestId('module-filter')).toBeInTheDocument()

    // Cek apakah judul kolom ditampilkan
    expect(screen.getByText('Judul')).toBeInTheDocument()
    expect(screen.getByText('Status')).toBeInTheDocument()
    expect(screen.getByText('Terakhir Diperbarui')).toBeInTheDocument()

    // Cek apakah data modul ditampilkan
    expect(screen.getByText('Modul Matematika')).toBeInTheDocument()
    expect(screen.getByText('Modul Bahasa Indonesia')).toBeInTheDocument()
  })

  it('menampilkan tombol "Muat Lebih Banyak" jika hasMore true', () => {
    // Mock data dengan pagination hasMore true
    ;(useModules as jest.Mock).mockReturnValue({
      data: {
        modules: mockModules,
        pagination: {
          count: 2,
          hasMore: true,
          nextCursor: 'next-cursor',
        },
      },
      isLoading: false,
      isError: false,
      error: null,
      fetchNextPage: jest.fn(),
      isFetchingNextPage: false,
    })

    render(<ModuleTable />)

    // Cek apakah tombol "Muat Lebih Banyak" ditampilkan
    expect(screen.getByText('Muat Lebih Banyak')).toBeInTheDocument()
  })

  it('membuka form modal saat tombol "Tambah Modul" diklik', () => {
    // Mock successful data fetch
    ;(useModules as jest.Mock).mockReturnValue({
      data: {
        modules: mockModules,
        pagination: {
          count: 2,
          hasMore: false,
        },
      },
      isLoading: false,
      isError: false,
      error: null,
    })

    render(<ModuleTable />)

    // Klik tombol "Tambah Modul"
    fireEvent.click(screen.getByText('Tambah Modul'))

    // Cek apakah form modal ditampilkan
    expect(screen.getByTestId('module-form-modal')).toBeInTheDocument()
  })
})
