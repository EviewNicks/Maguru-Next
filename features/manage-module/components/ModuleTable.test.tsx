import { render, screen, fireEvent } from '@testing-library/react'
import { ModuleTable } from './ModuleTable'
import { ModuleStatus, type Module } from '../types'

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
  const mockModules: Module[] = [
    {
      id: '1',
      title: 'Module 1',
      description: 'Deskripsi modul 1',
      status: ModuleStatus.ACTIVE,
      createdBy: 'admin',
      updatedBy: 'admin',
      createdAt: new Date(),
      updatedAt: new Date()
    }
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

    render(
      <ModuleTable 
        modules={[]}
        isLoading={true}
        isError={false}
        onLoadMore={() => {}}
      />
    )

    expect(screen.getByText('Memuat data modul...')).toBeInTheDocument()
  })

  it('menampilkan error state saat terjadi kesalahan', () => {
    // Mock error state
    ;(useModules as jest.Mock).mockReturnValue({
      data: null,
      isLoading: false,
      isError: true,
      error: new Error('Terjadi kesalahan'),
    })

    render(
      <ModuleTable 
        modules={[]}
        isLoading={false}
        isError={true}
        onLoadMore={() => {}}
      />
    )

    expect(screen.getByText('Terjadi kesalahan saat memuat data modul.')).toBeInTheDocument()
  })

  it('menampilkan data modul dalam tabel', () => {
    // Mock successful data fetch
    ;(useModules as jest.Mock).mockReturnValue({
      data: {
        modules: mockModules,
        pagination: {
          count: 1,
          hasMore: false,
        },
      },
      isLoading: false,
      isError: false,
      error: null,
    })

    render(
      <ModuleTable 
        modules={mockModules}
        isLoading={false}
        isError={false}
        onLoadMore={() => {}}
      />
    )

    // Cek apakah filter komponen ditampilkan
    expect(screen.getByTestId('module-filter')).toBeInTheDocument()

    // Cek apakah judul kolom ditampilkan
    expect(screen.getByText('Judul')).toBeInTheDocument()
    expect(screen.getByText('Status')).toBeInTheDocument()
    expect(screen.getByText('Terakhir Diperbarui')).toBeInTheDocument()

    // Cek apakah data modul ditampilkan
    expect(screen.getByText('Module 1')).toBeInTheDocument()
  })

  it('menampilkan tombol "Muat Lebih Banyak" jika hasMore true', () => {
    // Mock data dengan pagination hasMore true
    ;(useModules as jest.Mock).mockReturnValue({
      data: {
        modules: mockModules,
        pagination: {
          count: 1,
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

    render(
      <ModuleTable 
        modules={mockModules}
        isLoading={false}
        isError={false}
        onLoadMore={() => {}}
      />
    )

    // Cek apakah tombol "Muat Lebih Banyak" ditampilkan
    expect(screen.getByText('Muat Lebih Banyak')).toBeInTheDocument()
  })

  it('membuka form modal saat tombol "Tambah Modul" diklik', () => {
    // Mock successful data fetch
    ;(useModules as jest.Mock).mockReturnValue({
      data: {
        modules: mockModules,
        pagination: {
          count: 1,
          hasMore: false,
        },
      },
      isLoading: false,
      isError: false,
      error: null,
    })

    render(
      <ModuleTable 
        modules={mockModules}
        isLoading={false}
        isError={false}
        onLoadMore={() => {}}
      />
    )

    // Klik tombol "Tambah Modul"
    fireEvent.click(screen.getByText('Tambah Modul'))

    // Cek apakah form modal ditampilkan
    expect(screen.getByTestId('module-form-modal')).toBeInTheDocument()
  })

  it('renders correctly', () => {
    render(
      <ModuleTable 
        modules={mockModules}
        isLoading={false}
        isError={false}
        onLoadMore={() => {}}
      />
    );
    
    expect(screen.getByRole('columnheader', { name: /nama modul/i })).toBeInTheDocument();
  });
})
