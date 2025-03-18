import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { SearchAndFilter } from './SearchAndFilter'

// Mock komponen Select dari shadcn/ui
jest.mock('@/components/ui/select', () => ({
  Select: ({ children, value, onValueChange }: { children: React.ReactNode, value: string, onValueChange: (value: string) => void }) => (
    <div data-testid="select-mock">
      <div data-testid="select-value">{value}</div>
      <button data-testid="select-published" onClick={() => onValueChange('published')}>Aktif</button>
      <button data-testid="select-draft" onClick={() => onValueChange('draft')}>Draft</button>
      <button data-testid="select-archived" onClick={() => onValueChange('archived')}>Diarsipkan</button>
      <button data-testid="select-all" onClick={() => onValueChange('')}>Semua Status</button>
      {children}
    </div>
  ),
  SelectContent: ({ children }: { children: React.ReactNode }) => <div data-testid="select-content">{children}</div>,
  SelectItem: ({ children, value }: { children: React.ReactNode, value: string }) => (
    <div data-testid={`select-item-${value || 'empty'}`}>{children}</div>
  ),
  SelectTrigger: ({ children, className }: { children: React.ReactNode, className: string }) => (
    <div data-testid="select-trigger" className={className}>{children}</div>
  ),
  SelectValue: ({ children, placeholder }: { children: React.ReactNode, placeholder: string }) => (
    <div data-testid="select-value-display">{children || placeholder}</div>
  ),
}))

// Mock debounce function
jest.mock('lodash.debounce', () => (fn: (value: string) => void) => {
  return (value: string) => {
    fn(value)
  }
})

describe('SearchAndFilter', () => {
  const mockOnSearch = jest.fn()
  const mockOnFilterChange = jest.fn()
  
  beforeEach(() => {
    jest.clearAllMocks()
  })
  
  it('should render search input and filter dropdown', () => {
    render(
      <SearchAndFilter 
        onSearch={mockOnSearch}
        onFilterChange={mockOnFilterChange}
        searchValue=""
        statusFilter=""
      />
    )
    
    // Verifikasi input pencarian ada
    expect(screen.getByPlaceholderText('Cari modul...')).toBeInTheDocument()
    
    // Verifikasi dropdown filter status ada
    expect(screen.getByTestId('select-mock')).toBeInTheDocument()
  })
  
  it('should call onSearch when search input changes with debounce', async () => {
    render(
      <SearchAndFilter 
        onSearch={mockOnSearch}
        onFilterChange={mockOnFilterChange}
        searchValue=""
        statusFilter=""
      />
    )
    
    // Input nilai pencarian
    const searchInput = screen.getByPlaceholderText('Cari modul...')
    fireEvent.change(searchInput, { target: { value: 'matematika' } })
    
    // Verifikasi onSearch dipanggil dengan nilai yang benar
    await waitFor(() => {
      expect(mockOnSearch).toHaveBeenCalledWith('matematika')
    })
  })
  
  it('should call onFilterChange when status filter changes', () => {
    render(
      <SearchAndFilter 
        onSearch={mockOnSearch}
        onFilterChange={mockOnFilterChange}
        searchValue=""
        statusFilter=""
      />
    )
    
    // Pilih filter status
    fireEvent.click(screen.getByTestId('select-published'))
    
    // Verifikasi onFilterChange dipanggil dengan nilai yang benar
    expect(mockOnFilterChange).toHaveBeenCalledWith('published')
  })
  
  it('should display the current search value', () => {
    render(
      <SearchAndFilter 
        onSearch={mockOnSearch}
        onFilterChange={mockOnFilterChange}
        searchValue="matematika"
        statusFilter=""
      />
    )
    
    // Verifikasi nilai pencarian ditampilkan dengan benar
    const searchInput = screen.getByPlaceholderText('Cari modul...')
    expect(searchInput).toHaveValue('matematika')
  })
  
  it('should display the current filter value', () => {
    render(
      <SearchAndFilter 
        onSearch={mockOnSearch}
        onFilterChange={mockOnFilterChange}
        searchValue=""
        statusFilter="draft"
      />
    )
    
    // Verifikasi nilai filter ditampilkan dengan benar
    expect(screen.getByTestId('select-value')).toHaveTextContent('draft')
  })
  
  it('should have a clear button for search input when there is a search value', () => {
    render(
      <SearchAndFilter 
        onSearch={mockOnSearch}
        onFilterChange={mockOnFilterChange}
        searchValue="matematika"
        statusFilter=""
      />
    )
    
    // Verifikasi tombol clear ada
    const clearButton = screen.getByLabelText('Hapus pencarian')
    expect(clearButton).toBeInTheDocument()
    
    // Klik tombol clear
    fireEvent.click(clearButton)
    
    // Verifikasi onSearch dipanggil dengan string kosong
    expect(mockOnSearch).toHaveBeenCalledWith('')
  })
  
  it('should not display clear button when search input is empty', () => {
    render(
      <SearchAndFilter 
        onSearch={mockOnSearch}
        onFilterChange={mockOnFilterChange}
        searchValue=""
        statusFilter=""
      />
    )
    
    // Verifikasi tombol clear tidak ada
    expect(screen.queryByLabelText('Hapus pencarian')).not.toBeInTheDocument()
  })
})
