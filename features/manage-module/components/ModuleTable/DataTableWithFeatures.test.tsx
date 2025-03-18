import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { DataTableWithFeatures } from './DataTableWithFeatures'
import { Module } from '../../types/module'
import { useQuery } from '@tanstack/react-query'

// Mock modules
jest.mock('@tanstack/react-query', () => ({
  useQuery: jest.fn(),
}))

// Tipe untuk hasil getModules
type ModuleResponse = {
  data: Module[];
  meta: {
    currentPage: number;
    totalPages: number;
    pageSize: number;
    totalItems: number;
  };
};

jest.mock('../../services/moduleClientService', () => ({
  getModules: jest.fn().mockResolvedValue({
    data: [],
    meta: {
      currentPage: 1,
      totalPages: 1,
      pageSize: 10,
      totalItems: 0
    }
  } as ModuleResponse)
}))

// Mock komponen yang digunakan
jest.mock('./DataTable', () => ({
  DataTable: ({ data, isLoading, onSortChange }: { 
    data: Module[]; 
    isLoading?: boolean; 
    onSortChange?: (sortBy: string, sortOrder: 'asc' | 'desc') => void;
    sortBy?: string;
    sortOrder?: string;
  }) => (
    <table>
      <thead>
        <tr>
          <th onClick={() => onSortChange && onSortChange('title', 'asc')}>Judul</th>
          <th>Deskripsi</th>
          <th>Status</th>
          <th>Tanggal Dibuat</th>
          <th>Aksi</th>
        </tr>
      </thead>
      <tbody>
        {isLoading ? (
          <tr>
            <td colSpan={5}>
              <div data-testid="skeleton"></div>
            </td>
          </tr>
        ) : (
          data.map(module => (
            <tr key={module.id}>
              <td>{module.title}</td>
              <td>{module.description}</td>
              <td>{module.status}</td>
              <td>{module.createdAt instanceof Date ? module.createdAt.toLocaleDateString() : module.createdAt}</td>
              <td>Aksi</td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  )
}))

jest.mock('./PaginationControls', () => ({
  PaginationControls: ({ 
    currentPage, 
    totalPages, 
    onPageChange, 
    onPageSizeChange 
  }: { 
    currentPage: number; 
    totalPages: number; 
    pageSize: number;
    totalItems: number;
    onPageChange: (page: number) => void; 
    onPageSizeChange: (pageSize: number) => void;
  }) => (
    <div>
      <button 
        onClick={() => onPageChange(currentPage - 1)} 
        disabled={currentPage === 1}
        aria-label="Halaman sebelumnya"
      >
        Prev
      </button>
      <span>Halaman {currentPage} dari {totalPages}</span>
      <button 
        onClick={() => onPageChange(currentPage + 1)} 
        disabled={currentPage === totalPages}
        aria-label="Halaman berikutnya"
      >
        Next
      </button>
      <select 
        onChange={(e) => onPageSizeChange(Number(e.target.value))}
        defaultValue="10"
        aria-label="Item per halaman"
      >
        <option value="10">10</option>
        <option value="20">20</option>
        <option value="50">50</option>
      </select>
    </div>
  )
}))

jest.mock('./SearchAndFilter', () => ({
  SearchAndFilter: ({ 
    onSearch, 
    onFilterChange,
    searchValue,
    statusFilter
  }: { 
    onSearch: (value: string) => void; 
    onFilterChange: (value: string) => void;
    searchValue?: string;
    statusFilter?: string;
  }) => (
    <div>
      <input 
        placeholder="Cari modul..." 
        onChange={(e) => onSearch(e.target.value)}
        data-testid="search-input"
        value={searchValue || ''}
      />
      <select 
        onChange={(e) => onFilterChange(e.target.value)}
        aria-label="Filter status"
        value={statusFilter || ''}
      >
        <option value="">Semua Status</option>
        <option value="published">Published</option>
        <option value="draft">Draft</option>
      </select>
    </div>
  )
}))

// Mock lodash.debounce
jest.mock('lodash.debounce', () => {
  return function mockDebounce<T extends (...args: Parameters<T>) => ReturnType<T>>(
    fn: T,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _: number
  ): T {
    return ((...args: Parameters<T>) => fn(...args)) as T;
  };
});

// Tidak perlu mock useState lagi, kita akan menggunakan mock useQuery untuk memeriksa perubahan

describe('DataTableWithFeatures', () => {
  const mockModules: Module[] = [
    {
      id: '1',
      title: 'Modul Matematika',
      description: 'Deskripsi modul matematika untuk kelas 10',
      status: 'published',
      createdAt: new Date('2025-01-01'),
      updatedAt: new Date('2025-01-10'),
    },
    {
      id: '2',
      title: 'Modul Fisika',
      description: 'Deskripsi modul fisika yang sangat panjang',
      status: 'draft',
      createdAt: new Date('2025-02-01'),
      updatedAt: new Date('2025-02-10'),
    },
  ]

  const mockPaginationData = {
    data: mockModules,
    meta: {
      currentPage: 1,
      totalPages: 5,
      pageSize: 10,
      totalItems: 45,
    }
  }

  // Spy untuk memeriksa perubahan queryKey
  let querySpy: jest.SpyInstance;

  beforeEach(() => {
    jest.resetAllMocks();
    
    // Set default mock implementation
    (useQuery as jest.Mock).mockReturnValue({
      isLoading: false,
      error: null,
      data: mockPaginationData,
    });
    
    // Spy pada useQuery untuk memeriksa queryKey
    // Menggunakan tipe yang lebih spesifik
    querySpy = jest.spyOn({ useQuery } as { useQuery: typeof useQuery }, 'useQuery');
  })

  afterEach(() => {
    querySpy.mockRestore();
  })

  it('should render DataTable with pagination controls', () => {
    render(<DataTableWithFeatures />)
    
    // Verifikasi tabel ditampilkan
    expect(screen.getByRole('table')).toBeInTheDocument()
    
    // Verifikasi pagination controls ditampilkan
    expect(screen.getByText('Halaman 1 dari 5')).toBeInTheDocument()
    expect(screen.getByLabelText('Halaman berikutnya')).toBeInTheDocument()
  })

  it('should render search and filter controls', () => {
    render(<DataTableWithFeatures />)
    
    // Verifikasi kontrol pencarian ditampilkan
    expect(screen.getByPlaceholderText('Cari modul...')).toBeInTheDocument()
    
    // Verifikasi kontrol filter ditampilkan
    expect(screen.getByLabelText('Filter status')).toBeInTheDocument()
  })

  it('should update query parameters when pagination changes', async () => {
    render(<DataTableWithFeatures />)
    
    // Klik tombol halaman berikutnya
    fireEvent.click(screen.getByLabelText('Halaman berikutnya'))
    
    // Verifikasi useQuery dipanggil dengan parameter yang diperbarui
    await waitFor(() => {
      const lastCall = querySpy.mock.calls[querySpy.mock.calls.length - 1];
      const queryKey = lastCall[0].queryKey;
      expect(queryKey[1]).toEqual(expect.objectContaining({ page: 2 }));
    })
  })

  it('should update query parameters when search input changes', async () => {
    render(<DataTableWithFeatures />)
    
    // Input nilai pencarian
    const searchInput = screen.getByPlaceholderText('Cari modul...')
    fireEvent.change(searchInput, { target: { value: 'matematika' } })
    
    // Verifikasi useQuery dipanggil dengan parameter yang diperbarui
    await waitFor(() => {
      const lastCall = querySpy.mock.calls[querySpy.mock.calls.length - 1];
      const queryKey = lastCall[0].queryKey;
      expect(queryKey[1]).toEqual(expect.objectContaining({ 
        page: 1,
        search: 'matematika' 
      }));
    })
  })

  it('should update query parameters when filter changes', async () => {
    render(<DataTableWithFeatures />)
    
    // Pilih filter status
    const filterSelect = screen.getByLabelText('Filter status')
    fireEvent.change(filterSelect, { target: { value: 'published' } })
    
    // Verifikasi useQuery dipanggil dengan parameter yang diperbarui
    await waitFor(() => {
      const lastCall = querySpy.mock.calls[querySpy.mock.calls.length - 1];
      const queryKey = lastCall[0].queryKey;
      expect(queryKey[1]).toEqual(expect.objectContaining({ 
        page: 1,
        status: 'published' 
      }));
    })
  })

  it('should update query parameters when sorting changes', async () => {
    render(<DataTableWithFeatures />)
    
    // Klik header kolom untuk mengurutkan
    fireEvent.click(screen.getByText('Judul'))
    
    // Verifikasi useQuery dipanggil dengan parameter yang diperbarui
    await waitFor(() => {
      const lastCall = querySpy.mock.calls[querySpy.mock.calls.length - 1];
      const queryKey = lastCall[0].queryKey;
      expect(queryKey[1]).toEqual(expect.objectContaining({ 
        sortBy: 'title',
        sortOrder: 'asc'
      }));
    })
  })

  it('should handle loading state correctly', () => {
    (useQuery as jest.Mock).mockReturnValue({
      isLoading: true,
      error: null,
      data: null,
    })
    
    render(<DataTableWithFeatures />)
    
    // Verifikasi loading state ditampilkan
    expect(screen.getAllByTestId('skeleton').length).toBeGreaterThan(0)
  })

  it('should handle error state correctly', () => {
    (useQuery as jest.Mock).mockReturnValue({
      isLoading: false,
      error: new Error('Gagal memuat data modul'),
      data: null,
    })
    
    render(<DataTableWithFeatures />)
    
    // Verifikasi pesan error ditampilkan
    expect(screen.getByText(/Gagal memuat data modul/i)).toBeInTheDocument()
  })

  it('should reset to page 1 when search or filter changes', async () => {
    render(<DataTableWithFeatures />)
    
    // Input nilai pencarian
    const searchInput = screen.getByPlaceholderText('Cari modul...')
    fireEvent.change(searchInput, { target: { value: 'matematika' } })
    
    // Verifikasi useQuery dipanggil dengan parameter yang diperbarui dan page = 1
    await waitFor(() => {
      const lastCall = querySpy.mock.calls[querySpy.mock.calls.length - 1];
      const queryKey = lastCall[0].queryKey;
      expect(queryKey[1]).toEqual(expect.objectContaining({ 
        page: 1,
        search: 'matematika' 
      }));
    })
  })
})
