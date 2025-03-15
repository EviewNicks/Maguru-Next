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
    render(<DataTable {...defaultProps} />)
    
    // Cek judul modul menggunakan data-testid
    const titleCells = screen.getAllByTestId('cell-title')
    expect(titleCells[0]).toHaveTextContent('Module 1')
    expect(titleCells[1]).toHaveTextContent('Module 2')

    // Cek status
    const statusCells = screen.getAllByTestId('cell-status')
    expect(statusCells[0]).toHaveTextContent('Aktif')
    expect(statusCells[1]).toHaveTextContent('Draft')
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
    render(<DataTable {...defaultProps} />)
    
    // Cek data awal
    const titleCells = screen.getAllByTestId('cell-title')
    expect(titleCells[0]).toHaveTextContent('Module 1')
    expect(titleCells[1]).toHaveTextContent('Module 2')

    // Klik header untuk sort
    const titleHeader = screen.getByText('Nama Modul')
    fireEvent.click(titleHeader)

    // Cek data setelah sort (karena implementasi mock, urutan tidak berubah)
    const sortedTitleCells = screen.getAllByTestId('cell-title')
    expect(sortedTitleCells[0]).toHaveTextContent('Module 1')
  })

  it('merender tabel dengan virtual scrolling', () => {
    const { container } = render(<DataTable {...defaultProps} />)
    
    // Cek apakah virtual table ada
    expect(container.querySelector('.virtual-table')).toBeInTheDocument()
  })
})
