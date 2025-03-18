import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { DataTable } from './DataTable'
import { Module } from '../../types/module'

// Mock komponen yang digunakan dalam DataTable
jest.mock('@tanstack/react-table', () => ({
  useReactTable: jest.fn(() => ({
    getHeaderGroups: jest.fn(() => [
      {
        id: 'header-group-1',
        headers: [
          { id: 'title', column: { columnDef: { header: 'Judul' } }, getContext: jest.fn() },
          { id: 'description', column: { columnDef: { header: 'Deskripsi' } }, getContext: jest.fn() },
        ],
      },
    ]),
    getRowModel: jest.fn(() => ({
      rows: [],
    })),
  })),
  getCoreRowModel: jest.fn(() => ({})),
  flexRender: jest.fn((content) => content),
  getSortedRowModel: jest.fn(() => ({})),
  getFilteredRowModel: jest.fn(() => ({})),
}))

// Mock virtual scrolling
jest.mock('@tanstack/react-virtual', () => ({
  useVirtualizer: jest.fn(() => ({
    getTotalSize: jest.fn(() => 500),
    getVirtualItems: jest.fn(() => []),
  })),
}))

describe('DataTable', () => {
  const mockData: Module[] = [
    {
      id: '1',
      title: 'Modul Test',
      description: 'Deskripsi test',
      status: 'published',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]

  it('should render loading skeleton when isLoading is true', () => {
    render(<DataTable data={[]} isLoading={true} />)
    
    // Verifikasi bahwa skeleton loading ditampilkan
    const skeletons = screen.getAllByTestId('skeleton')
    expect(skeletons.length).toBeGreaterThan(0)
  })

  it('should render empty state when no data is available', () => {
    render(<DataTable data={[]} isLoading={false} />)
    
    // Verifikasi pesan empty state
    expect(screen.getByText('Belum ada data modul')).toBeInTheDocument()
  })

  it('should render table headers correctly', () => {
    render(<DataTable data={mockData} isLoading={false} />)
    
    // Verifikasi header tabel
    expect(screen.getByText('Judul')).toBeInTheDocument()
    expect(screen.getByText('Deskripsi')).toBeInTheDocument()
  })
})
