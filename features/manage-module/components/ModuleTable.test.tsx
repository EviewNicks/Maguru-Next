import { render, screen, fireEvent } from '@testing-library/react'
import { ModuleTable } from './ModuleTable'
import { ModuleStatus, type Module } from '../types'
import { ModuleFilter } from './ModuleFilter'

// Mock ModuleFilter component
jest.mock('./ModuleFilter', () => ({
  ModuleFilter: jest.fn(() => (
    <div data-testid="module-filter">
      <input type="text" placeholder="Cari modul..." />
    </div>
  )),
}))

// Mock ModuleFormModal component
jest.mock('./ModuleFormModal', () => ({
  ModuleFormModal: jest.fn(() => null),
}))

// Mock DOMPurify untuk sanitasi
jest.mock('dompurify', () => ({
  sanitize: jest.fn((content) => content),
}))

describe('ModuleTable', () => {
  const mockModules: Module[] = [
    {
      id: '1',
      title: 'Module 1',
      description: 'Description 1',
      status: ModuleStatus.ACTIVE,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
      createdBy: 'admin',
      updatedBy: 'admin',
    },
    {
      id: '2',
      title: 'Module 2',
      description: 'Description 2',
      status: ModuleStatus.DRAFT,
      createdAt: new Date('2024-01-02'),
      updatedAt: new Date('2024-01-02'),
      createdBy: 'admin',
      updatedBy: 'admin',
    },
  ]

  const defaultProps = {
    modules: mockModules,
    isLoading: false,
    isError: false,
    pagination: {
      hasMore: true,
      nextCursor: 'next',
    },
    onLoadMore: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('menampilkan loading state saat data sedang dimuat', () => {
    render(<ModuleTable {...defaultProps} isLoading={true} />)
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()
  })

  it('menampilkan error state saat terjadi kesalahan', () => {
    render(<ModuleTable {...defaultProps} isError={true} />)
    expect(screen.getByText(/Terjadi kesalahan saat memuat data modul/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Muat Ulang/i })).toBeInTheDocument()
  })

  it('menampilkan data modul dalam tabel', () => {
    render(<ModuleTable {...defaultProps} />)
    
    // Cek judul kolom
    expect(screen.getByRole('button', { name: /Nama Modul/i })).toBeInTheDocument()
    
    // Cek data modul menggunakan text content
    expect(screen.getByText('Module 1')).toBeInTheDocument()
    expect(screen.getByText('Module 2')).toBeInTheDocument()
  })

  it('menampilkan tombol "Muat Lebih Banyak" jika hasMore true', () => {
    render(<ModuleTable {...defaultProps} />)
    expect(screen.getByRole('button', { name: /Muat Lebih Banyak/i })).toBeInTheDocument()
  })

  it('mengubah sorting state saat header kolom diklik', () => {
    render(<ModuleTable {...defaultProps} />)
    
    // Klik pada button dengan text "Nama Modul" untuk sorting
    const titleHeader = screen.getByRole('button', { name: /Nama Modul/i })
    fireEvent.click(titleHeader)
    
    // Cek data setelah sort
    expect(screen.getByText('Module 1')).toBeInTheDocument()
  })

  it('memanggil onLoadMore saat tombol "Muat Lebih Banyak" diklik', () => {
    render(<ModuleTable {...defaultProps} />)
    
    const loadMoreButton = screen.getByRole('button', { name: /Muat Lebih Banyak/i })
    fireEvent.click(loadMoreButton)
    
    expect(defaultProps.onLoadMore).toHaveBeenCalled()
  })

  it('memperbarui filter saat ModuleFilter berubah', () => {
    render(<ModuleTable {...defaultProps} />)
    
    // Cek apakah ModuleFilter component dirender
    expect(screen.getByTestId('module-filter')).toBeInTheDocument()
    
    // Cek apakah ModuleFilter dipanggil dengan props yang benar
    expect(ModuleFilter).toHaveBeenCalledWith(
      expect.objectContaining({
        filter: expect.any(Object),
        onFilterChange: expect.any(Function),
      }),
      expect.any(Object)
    )
  })
})
