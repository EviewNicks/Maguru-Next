/**
 * @jest-environment jsdom
 */

import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { PaginationControls } from './PaginationControls'

// Mock komponen Button dari shadcn/ui
jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, disabled, 'aria-label': ariaLabel }: { 
    children: React.ReactNode, 
    onClick?: () => void, 
    disabled?: boolean, 
    'aria-label'?: string 
  }) => (
    <button 
      onClick={onClick} 
      disabled={disabled} 
      aria-label={ariaLabel}
      data-testid={`button-${ariaLabel?.replace(/\s+/g, '-').toLowerCase() || 'default'}`}
    >
      {children}
    </button>
  ),
}))

// Mock komponen lucide-react
jest.mock('lucide-react', () => ({
  ChevronLeft: () => <span data-testid="icon-chevron-left">←</span>,
  ChevronRight: () => <span data-testid="icon-chevron-right">→</span>,
}))

// Mock komponen Select dari shadcn/ui
jest.mock('@/components/ui/select', () => ({
  Select: ({ value, onValueChange, children }: { 
    value: string, 
    onValueChange: (value: string) => void, 
    children: React.ReactNode 
  }) => (
    <div data-testid="select-mock">
      <select 
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
        data-testid="select-element"
      >
        <option value="10">10</option>
        <option value="20">20</option>
        <option value="30">30</option>
        <option value="50">50</option>
        <option value="100">100</option>
      </select>
      {children}
    </div>
  ),
  SelectContent: ({ children }: { children: React.ReactNode }) => <div data-testid="select-content">{children}</div>,
  SelectItem: ({ value, children }: { value: string; children: React.ReactNode }) => (
    <option value={value} data-testid={`select-item-${value}`}>{children}</option>
  ),
  SelectTrigger: ({ children, className, 'aria-label': ariaLabel }: { 
    children: React.ReactNode, 
    className?: string, 
    'aria-label'?: string 
  }) => (
    <div className={className} aria-label={ariaLabel} data-testid="select-trigger">{children}</div>
  ),
  SelectValue: ({ placeholder }: { placeholder?: string }) => (
    <span data-testid="select-value">{placeholder}</span>
  ),
}))

describe('PaginationControls', () => {
  const mockOnPageChange = jest.fn()
  const mockOnPageSizeChange = jest.fn()
  
  beforeEach(() => {
    jest.clearAllMocks()
  })
  
  it('should render pagination controls with current page and total pages', () => {
    render(
      <PaginationControls 
        currentPage={2} 
        totalPages={5} 
        pageSize={10}
        totalItems={45}
        onPageChange={mockOnPageChange}
        onPageSizeChange={mockOnPageSizeChange}
      />
    )
    
    // Verifikasi tampilan halaman saat ini dan total halaman
    expect(screen.getByText(/Halaman 2 dari 5/i)).toBeInTheDocument()
    
    // Verifikasi tombol navigasi
    expect(screen.getByTestId('button-halaman-sebelumnya')).toBeInTheDocument()
    expect(screen.getByTestId('button-halaman-berikutnya')).toBeInTheDocument()
  })
  
  it('should disable previous button on first page', () => {
    render(
      <PaginationControls 
        currentPage={1} 
        totalPages={5} 
        pageSize={10}
        totalItems={45}
        onPageChange={mockOnPageChange}
        onPageSizeChange={mockOnPageSizeChange}
      />
    )
    
    const prevButton = screen.getByTestId('button-halaman-sebelumnya')
    expect(prevButton).toBeDisabled()
  })
  
  it('should disable next button on last page', () => {
    render(
      <PaginationControls 
        currentPage={5} 
        totalPages={5} 
        pageSize={10}
        totalItems={45}
        onPageChange={mockOnPageChange}
        onPageSizeChange={mockOnPageSizeChange}
      />
    )
    
    const nextButton = screen.getByTestId('button-halaman-berikutnya')
    expect(nextButton).toBeDisabled()
  })
  
  it('should call onPageChange when navigation buttons are clicked', () => {
    render(
      <PaginationControls 
        currentPage={2} 
        totalPages={5} 
        pageSize={10}
        totalItems={45}
        onPageChange={mockOnPageChange}
        onPageSizeChange={mockOnPageSizeChange}
      />
    )
    
    // Klik tombol halaman sebelumnya
    fireEvent.click(screen.getByTestId('button-halaman-sebelumnya'))
    expect(mockOnPageChange).toHaveBeenCalledWith(1)
    
    // Klik tombol halaman berikutnya
    fireEvent.click(screen.getByTestId('button-halaman-berikutnya'))
    expect(mockOnPageChange).toHaveBeenCalledWith(3)
  })
  
  it('should call onPageSizeChange when page size is changed', () => {
    render(
      <PaginationControls 
        currentPage={2} 
        totalPages={5} 
        pageSize={10}
        totalItems={45}
        onPageChange={mockOnPageChange}
        onPageSizeChange={mockOnPageSizeChange}
      />
    )
    
    // Pilih ukuran halaman yang berbeda menggunakan select yang telah di-mock
    const selectElement = screen.getByTestId('select-element')
    fireEvent.change(selectElement, { target: { value: '20' } })
    expect(mockOnPageSizeChange).toHaveBeenCalledWith(20) // Perhatikan bahwa onPageSizeChange menerima number, bukan string
  })
  
  it('should show correct item range information', () => {
    render(
      <PaginationControls 
        currentPage={2} 
        totalPages={5} 
        pageSize={10}
        totalItems={45}
        onPageChange={mockOnPageChange}
        onPageSizeChange={mockOnPageSizeChange}
      />
    )
    
    // Pada halaman 2 dengan pageSize 10, kita menampilkan item 11-20 dari 45
    expect(screen.getByText(/Menampilkan 11-20 dari 45 item/i)).toBeInTheDocument()
  })
})
