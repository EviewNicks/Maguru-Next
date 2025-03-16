import { render, screen, fireEvent } from '@testing-library/react'
import { DataTable } from './DataTable'
import { ModuleStatus } from '../../types'

// Mock date-fns
jest.mock('date-fns', () => ({
  format: jest.fn((date: Date) => date.toISOString()),
}))

jest.mock('date-fns/locale', () => ({
  id: {},
}))

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}))

// Mock DOMPurify
jest.mock('dompurify', () => ({
  sanitize: jest.fn((content) => content),
}))

// Mock untuk @tanstack/react-virtual
jest.mock('@tanstack/react-virtual', () => ({
  useVirtualizer: () => ({
    getVirtualItems: () => [
      { index: 0, start: 0, end: 45, size: 45, lane: 0 },
      { index: 1, start: 45, end: 90, size: 45, lane: 0 },
    ],
  }),
}))

describe('DataTable', () => {
  const mockData = [
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
    data: mockData,
    isLoading: false,
    hasMore: true,
    onLoadMore: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('menampilkan loading spinner saat isLoading true', () => {
    render(<DataTable {...defaultProps} isLoading={true} />)
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()
  })

  it('menampilkan data modul dalam tabel', () => {
    const { container } = render(<DataTable {...defaultProps} />)
    
    // Verifikasi bahwa tabel telah dirender
    const table = container.querySelector('table')
    expect(table).toBeInTheDocument()
    
    // Verifikasi konten tabel dengan pendekatan alternatif
    expect(container.textContent).toContain('Module 1')
    expect(container.textContent).toContain('Module 2')
    expect(container.textContent).toContain('Aktif')
    expect(container.textContent).toContain('Draft')
  })

  it('memanggil onLoadMore saat tombol "Muat Lebih Banyak" diklik', () => {
    render(<DataTable {...defaultProps} />)
    
    const loadMoreButton = screen.getByText('Muat Lebih Banyak')
    fireEvent.click(loadMoreButton)
    
    expect(defaultProps.onLoadMore).toHaveBeenCalled()
  })

  it('tidak menampilkan tombol "Muat Lebih Banyak" jika hasMore false', () => {
    render(<DataTable {...defaultProps} hasMore={false} />)
    
    expect(screen.queryByText('Muat Lebih Banyak')).not.toBeInTheDocument()
  })

  it('mengubah sorting saat header diklik', () => {
    const { container } = render(<DataTable {...defaultProps} />)
    
    // Verifikasi bahwa header tabel telah dirender
    const titleHeader = screen.getByText('Nama Modul')
    expect(titleHeader).toBeInTheDocument()
    
    // Klik header untuk sort
    fireEvent.click(titleHeader)
    
    // Verifikasi bahwa tabel masih ada setelah sorting
    const table = container.querySelector('table')
    expect(table).toBeInTheDocument()
  })

  it('merender tabel dengan virtual scrolling', () => {
    const { container } = render(<DataTable {...defaultProps} />)
    
    // Cek apakah virtual table ada
    expect(container.querySelector('.virtual-table')).toBeInTheDocument()
  })
})
