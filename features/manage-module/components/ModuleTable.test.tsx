import { render, screen, fireEvent } from '@testing-library/react'
import { ModuleTable } from './ModuleTable'
import { ModuleStatus } from '../types'

// Mock data
const mockModules = [
  {
    id: '1',
    title: 'Modul Matematika',
    description: 'Deskripsi modul matematika',
    status: ModuleStatus.ACTIVE,
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-02'),
    createdBy: 'user1',
    updatedBy: 'user1'
  },
  {
    id: '2',
    title: 'Modul Bahasa Indonesia',
    description: 'Deskripsi modul bahasa indonesia',
    status: ModuleStatus.DRAFT,
    createdAt: new Date('2025-01-03'),
    updatedAt: new Date('2025-01-04'),
    createdBy: 'user1',
    updatedBy: 'user1'
  }
]

// Mock functions
const mockOnLoadMore = jest.fn()
const mockOnEdit = jest.fn()
const mockOnDelete = jest.fn()

describe('ModuleTable', () => {
  it('renders the table with module data', () => {
    render(
      <ModuleTable
        modules={mockModules}
        isLoading={false}
        isError={false}
        pagination={{ count: 2, hasMore: false }}
        onLoadMore={mockOnLoadMore}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    )
    
    // Check if table headers are rendered
    expect(screen.getByText('Judul')).toBeInTheDocument()
    expect(screen.getByText('Deskripsi')).toBeInTheDocument()
    expect(screen.getByText('Status')).toBeInTheDocument()
    expect(screen.getByText('Tanggal Dibuat')).toBeInTheDocument()
    expect(screen.getByText('Aksi')).toBeInTheDocument()
    
    // Check if module data is rendered
    expect(screen.getByText('Modul Matematika')).toBeInTheDocument()
    expect(screen.getByText('Modul Bahasa Indonesia')).toBeInTheDocument()
    expect(screen.getByText('Aktif')).toBeInTheDocument()
    expect(screen.getByText('Draft')).toBeInTheDocument()
  })
  
  it('shows loading state when isLoading is true and no data', () => {
    render(
      <ModuleTable
        modules={[]}
        isLoading={true}
        isError={false}
        pagination={{ count: 0, hasMore: false }}
        onLoadMore={mockOnLoadMore}
      />
    )
    
    expect(screen.getByText('Memuat data...')).toBeInTheDocument()
  })
  
  it('shows error state when isError is true', () => {
    render(
      <ModuleTable
        modules={[]}
        isLoading={false}
        isError={true}
        pagination={{ count: 0, hasMore: false }}
        onLoadMore={mockOnLoadMore}
      />
    )
    
    expect(screen.getByText('Gagal memuat data')).toBeInTheDocument()
    expect(screen.getByText('Coba Lagi')).toBeInTheDocument()
  })
  
  it('shows empty state when no modules and not loading', () => {
    render(
      <ModuleTable
        modules={[]}
        isLoading={false}
        isError={false}
        pagination={{ count: 0, hasMore: false }}
        onLoadMore={mockOnLoadMore}
      />
    )
    
    expect(screen.getByText('Tidak ada modul')).toBeInTheDocument()
  })
  
  it('calls onLoadMore when load more button is clicked', () => {
    render(
      <ModuleTable
        modules={mockModules}
        isLoading={false}
        isError={false}
        pagination={{ count: 2, hasMore: true }}
        onLoadMore={mockOnLoadMore}
      />
    )
    
    const loadMoreButton = screen.getByText('Muat Lebih Banyak')
    fireEvent.click(loadMoreButton)
    
    expect(mockOnLoadMore).toHaveBeenCalledTimes(1)
  })
  
  it('calls onEdit when edit button is clicked', () => {
    render(
      <ModuleTable
        modules={mockModules}
        isLoading={false}
        isError={false}
        pagination={{ count: 2, hasMore: false }}
        onLoadMore={mockOnLoadMore}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    )
    
    const editButtons = screen.getAllByRole('button', { name: /edit/i })
    fireEvent.click(editButtons[0])
    
    expect(mockOnEdit).toHaveBeenCalledWith(mockModules[0])
  })
  
  it('calls onDelete when delete button is clicked', () => {
    render(
      <ModuleTable
        modules={mockModules}
        isLoading={false}
        isError={false}
        pagination={{ count: 2, hasMore: false }}
        onLoadMore={mockOnLoadMore}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    )
    
    const deleteButtons = screen.getAllByRole('button', { name: /hapus/i })
    fireEvent.click(deleteButtons[0])
    
    expect(mockOnDelete).toHaveBeenCalledWith(mockModules[0])
  })
})
