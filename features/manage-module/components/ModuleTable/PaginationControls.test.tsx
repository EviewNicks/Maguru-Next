/**
 * @jest-environment jsdom
 */

// Untuk file test, kita bisa menonaktifkan beberapa aturan linting

/* eslint-disable @typescript-eslint/no-explicit-any */

import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { PaginationControls } from './PaginationControls'

// Buat mocks sederhana untuk komponen UI
jest.mock('@/components/ui/button', () => ({
  Button: (props: any) => (
    <button
      {...props}
      onClick={props.onClick}
      disabled={props.disabled}
      data-testid={
        props['aria-label']
          ? `button-${props['aria-label'].replace(/\s+/g, '-').toLowerCase()}`
          : 'button'
      }
    />
  ),
}))

jest.mock('lucide-react', () => ({
  ChevronLeft: () => <span>←</span>,
  ChevronRight: () => <span>→</span>,
}))

// Buat mock sederhana untuk komponen Select
jest.mock('@/components/ui/select', () => {
  return {
    Select: ({
      value,
      onValueChange,
    }: {
      value: string
      onValueChange: (value: string) => void
    }) => (
      <div>
        <button
          onClick={() => onValueChange('20')}
          data-testid="select-element"
        >
          {value}
        </button>
      </div>
    ),
    SelectContent: ({ children }: { children: React.ReactNode }) => (
      <div>{children}</div>
    ),
    SelectItem: ({ children }: { children: React.ReactNode }) => (
      <div>{children}</div>
    ),
    SelectTrigger: ({ children }: { children: React.ReactNode }) => (
      <div>{children}</div>
    ),
    SelectValue: ({ children }: { children: React.ReactNode }) => (
      <div>{children}</div>
    ),
  }
})

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
    expect(
      screen.getByText(/Menampilkan 11-20 dari 45 item/i)
    ).toBeInTheDocument()
  })
})
