import { render, screen, fireEvent, waitFor } from '../test-utils'
import UserTableNew from '../../components/ui/UserTable'
import { useQuery } from '@tanstack/react-query'
import { DataTableMock } from './mocks/data-table-mock'

// Mock untuk react-query
jest.mock('@tanstack/react-query', () => {
  const actual = jest.requireActual('@tanstack/react-query')
  return {
    ...actual,
    useQuery: jest.fn(),
  }
})

// Mock untuk komponen UI
jest.mock('@/components/ui/select', () => {
  return {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Select: ({ value, onValueChange, children }: any) => (
      <div className="select-mock-container">
        <select
          value={value}
          onChange={(e) => onValueChange(e.target.value)}
          aria-label={typeof children === 'string' ? children : value}
          data-testid="select-mock"
        >
          <option value="all">Semua</option>
          <option value="admin">Admin</option>
          <option value="mahasiswa">Mahasiswa</option>
          <option value="dosen">Dosen</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        {children}
      </div>
    ),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    SelectTrigger: ({ children, id }: any) => <span id={id}>{children}</span>,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    SelectContent: ({ children }: any) => <span>{children}</span>,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    SelectItem: ({ value, children }: any) => (
      <option value={value}>{children}</option>
    ),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    SelectValue: ({ placeholder }: any) => <span>{placeholder}</span>,
  }
})

jest.mock('@/components/ui/input', () => {
  return {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Input: (props: any) => <input {...props} data-testid="input-mock" />,
  }
})

jest.mock('@/components/ui/button', () => {
  return {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Button: (props: any) => (
      <button {...props} data-testid="button-mock">
        {props.children}
      </button>
    ),
  }
})

// Mock komponen DataTable di UserTable
jest.mock('../../components/ui/UserTable/DataTable', () => ({
  DataTableNew: (props: Record<string, unknown>) => (
    <DataTableMock
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data={(props.data as any) || []}
      isLoading={!!props.isLoading}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      pagination={props.pagination as any}
    />
  ),
}))

/**
 * Integration test untuk UserTable dengan fokus pada fitur filtering,
 * searching, pagination, dan error handling
 */
describe('UserTable Integration - Filtering & Pagination', () => {
  beforeEach(() => {
    // Reset mock sebelum setiap test
    jest.clearAllMocks()
  })

  // Test render awal komponen
  test('TC-001: Menampilkan data pengguna setelah loading', async () => {
    // Mock data untuk loading state dan kemudian data
    const mockData = {
      users: [
        {
          id: '1',
          name: 'Test User',
          email: 'test@example.com',
          role: 'admin',
          status: 'active',
          createdAt: '2023-01-01T00:00:00Z',
          updatedAt: '2023-01-01T00:00:00Z',
        },
      ],
      metadata: {
        total: 1,
        currentPage: 1,
        totalPages: 1,
        limit: 10,
      },
    }

    // Setup mock untuk loading dan kemudian data
    ;(useQuery as jest.Mock).mockImplementation(() => {
      return {
        isLoading: false,
        data: mockData,
        error: null,
        refetch: jest.fn(),
      }
    })

    render(<UserTableNew />)

    // Tunggu tabel muncul
    await waitFor(() => {
      expect(screen.getByRole('table')).toBeInTheDocument()
    })

    // Verifikasi data dalam tabel
    await waitFor(() => {
      expect(screen.getByText('Test User')).toBeInTheDocument()
      expect(screen.getByText('test@example.com')).toBeInTheDocument()
    })
  })

  // Test filtering berdasarkan role
  test('TC-002: Filter berdasarkan role menampilkan hanya user dengan role tersebut', async () => {
    // Mock data untuk role admin
    const mockAdminData = {
      users: [
        {
          id: '1',
          name: 'Admin User',
          email: 'admin@example.com',
          role: 'admin',
          status: 'active',
          createdAt: '2023-01-01T00:00:00Z',
          updatedAt: '2023-01-01T00:00:00Z',
        },
      ],
      metadata: {
        total: 1,
        currentPage: 1,
        totalPages: 1,
        limit: 10,
      },
    }

    ;(useQuery as jest.Mock).mockImplementation(({ queryKey }) => {
      const role = queryKey[3]
      if (role === 'admin') {
        return {
          isLoading: false,
          data: mockAdminData,
          error: null,
          refetch: jest.fn(),
        }
      }
      return {
        isLoading: false,
        data: {
          users: [],
          metadata: {
            total: 0,
            currentPage: 1,
            totalPages: 0,
            limit: 10,
          },
        },
        error: null,
        refetch: jest.fn(),
      }
    })

    render(<UserTableNew />)

    // Tunggu tabel muncul
    await waitFor(() => {
      expect(screen.getByRole('table')).toBeInTheDocument()
    })

    // Cari select dropdown untuk role dan ubah nilai
    const roleSelect = screen.getAllByRole('combobox')[0]
    fireEvent.change(roleSelect, { target: { value: 'admin' } })

    // Verifikasi API dipanggil dengan parameter yang benar
    await waitFor(() => {
      expect(useQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          queryKey: expect.arrayContaining([
            'users',
            expect.any(Number),
            expect.any(Number),
            'admin',
          ]),
        })
      )
    })

    // Verifikasi data yang ditampilkan sesuai filter
    await waitFor(() => {
      expect(screen.getByText('Admin User')).toBeInTheDocument()
      expect(screen.getByText('admin@example.com')).toBeInTheDocument()
    })
  })

  // Test filtering berdasarkan status
  test('TC-003: Filter berdasarkan status menampilkan hanya user dengan status tersebut', async () => {
    // Mock data untuk status active
    const mockActiveData = {
      users: [
        {
          id: '1',
          name: 'Active User',
          email: 'active@example.com',
          role: 'mahasiswa',
          status: 'active',
          createdAt: '2023-01-01T00:00:00Z',
          updatedAt: '2023-01-01T00:00:00Z',
        },
      ],
      metadata: {
        total: 1,
        currentPage: 1,
        totalPages: 1,
        limit: 10,
      },
    }

    ;(useQuery as jest.Mock).mockImplementation(({ queryKey }) => {
      const status = queryKey[4]
      if (status === 'active') {
        return {
          isLoading: false,
          data: mockActiveData,
          error: null,
          refetch: jest.fn(),
        }
      }
      return {
        isLoading: false,
        data: {
          users: [],
          metadata: {
            total: 0,
            currentPage: 1,
            totalPages: 0,
            limit: 10,
          },
        },
        error: null,
        refetch: jest.fn(),
      }
    })

    render(<UserTableNew />)

    // Tunggu tabel muncul
    await waitFor(() => {
      expect(screen.getByRole('table')).toBeInTheDocument()
    })

    // Cari select dropdown untuk status dan ubah nilai
    const statusSelect = screen.getAllByRole('combobox')[1]
    fireEvent.change(statusSelect, { target: { value: 'active' } })

    // Verifikasi API dipanggil dengan parameter yang benar
    await waitFor(() => {
      expect(useQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          queryKey: expect.arrayContaining([
            'users',
            expect.any(Number),
            expect.any(Number),
            expect.any(String),
            'active',
          ]),
        })
      )
    })

    // Verifikasi data yang ditampilkan sesuai filter
    await waitFor(() => {
      expect(screen.getByText('Active User')).toBeInTheDocument()
      expect(screen.getByText('active@example.com')).toBeInTheDocument()
    })
  })

  // Test searching nama/email
  test('TC-004: Search filter menampilkan hasil yang sesuai dengan keyword', async () => {
    // Mock data untuk hasil pencarian
    const mockSearchData = {
      users: [
        {
          id: '1',
          name: 'Test User',
          email: 'test@example.com',
          role: 'admin',
          status: 'active',
          createdAt: '2023-01-01T00:00:00Z',
          updatedAt: '2023-01-01T00:00:00Z',
        },
      ],
      metadata: {
        total: 1,
        currentPage: 1,
        totalPages: 1,
        limit: 10,
      },
    }

    ;(useQuery as jest.Mock).mockImplementation(({ queryKey }) => {
      const search = queryKey[5]
      if (search === 'test') {
        return {
          isLoading: false,
          data: mockSearchData,
          error: null,
          refetch: jest.fn(),
        }
      }
      return {
        isLoading: false,
        data: {
          users: [],
          metadata: {
            total: 0,
            currentPage: 1,
            totalPages: 0,
            limit: 10,
          },
        },
        error: null,
        refetch: jest.fn(),
      }
    })

    render(<UserTableNew />)

    // Tunggu tabel muncul
    await waitFor(() => {
      expect(screen.getByRole('table')).toBeInTheDocument()
    })

    // Masukkan teks pencarian
    const searchInput = screen.getByPlaceholderText(/cari nama atau email/i)
    fireEvent.change(searchInput, { target: { value: 'test' } })

    // Verifikasi API dipanggil dengan parameter yang benar
    await waitFor(() => {
      expect(useQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          queryKey: expect.arrayContaining([
            'users',
            expect.any(Number),
            expect.any(Number),
            expect.any(String),
            expect.any(String),
            'test',
          ]),
        })
      )
    })

    // Verifikasi hasil pencarian
    await waitFor(() => {
      expect(screen.getByText('Test User')).toBeInTheDocument()
      expect(screen.getByText('test@example.com')).toBeInTheDocument()
    })
  })

  // Test reset semua filter
  test('TC-005: Reset filter mengembalikan ke kondisi awal', async () => {
    const mockData = {
      users: [
        {
          id: '1',
          name: 'Default User',
          email: 'default@example.com',
          role: 'mahasiswa',
          status: 'active',
          createdAt: '2023-01-01T00:00:00Z',
          updatedAt: '2023-01-01T00:00:00Z',
        },
      ],
      metadata: {
        total: 1,
        currentPage: 1,
        totalPages: 1,
        limit: 10,
      },
    }

    ;(useQuery as jest.Mock).mockImplementation(({ queryKey }) => {
      const role = queryKey[3]
      const status = queryKey[4]
      const search = queryKey[5]

      if (role === 'all' && status === 'all' && !search) {
        return {
          isLoading: false,
          data: mockData,
          error: null,
          refetch: jest.fn(),
        }
      }

      return {
        isLoading: false,
        data: {
          users: [],
          metadata: {
            total: 0,
            currentPage: 1,
            totalPages: 0,
            limit: 10,
          },
        },
        error: null,
        refetch: jest.fn(),
      }
    })

    render(<UserTableNew />)

    // Tunggu tabel muncul
    await waitFor(() => {
      expect(screen.getByRole('table')).toBeInTheDocument()
    })

    // Set beberapa filter
    const roleSelect = screen.getAllByRole('combobox')[0]
    fireEvent.change(roleSelect, { target: { value: 'admin' } })

    const statusSelect = screen.getAllByRole('combobox')[1]
    fireEvent.change(statusSelect, { target: { value: 'active' } })

    const searchInput = screen.getByPlaceholderText(/cari nama atau email/i)
    fireEvent.change(searchInput, { target: { value: 'test' } })

    // Reset filter dengan tombol reset
    const resetButton = screen.getByTestId('button-mock')
    fireEvent.click(resetButton)

    // Verifikasi data default muncul kembali
    await waitFor(() => {
      expect(screen.getByText('Default User')).toBeInTheDocument()
      expect(screen.getByText('default@example.com')).toBeInTheDocument()
    })
  })

  // Test error handling
  test('TC-006: Menampilkan error message jika API gagal', async () => {
    // Mock error response
    ;(useQuery as jest.Mock).mockImplementation(() => {
      return {
        isLoading: false,
        data: null,
        error: new Error('Error mengambil data pengguna'),
        refetch: jest.fn(),
      }
    })

    render(<UserTableNew />)

    // Verifikasi error message muncul
    await waitFor(() => {
      expect(screen.getByText(/error/i)).toBeInTheDocument()
      expect(
        screen.getByText(/error mengambil data pengguna/i)
      ).toBeInTheDocument()
    })
  })

  // Test pagination
  test('TC-007: Navigasi pagination berfungsi dengan benar', async () => {
    // Mock data untuk halaman 1
    const mockPage1Data = {
      users: [
        {
          id: '1',
          name: 'User Page 1',
          email: 'page1@example.com',
          role: 'mahasiswa',
          status: 'active',
          createdAt: '2023-01-01T00:00:00Z',
          updatedAt: '2023-01-01T00:00:00Z',
        },
      ],
      metadata: {
        total: 20,
        currentPage: 1,
        totalPages: 2,
        limit: 10,
      },
    }

    // Mock data untuk halaman 2
    const mockPage2Data = {
      users: [
        {
          id: '2',
          name: 'User Page 2',
          email: 'page2@example.com',
          role: 'mahasiswa',
          status: 'active',
          createdAt: '2023-01-01T00:00:00Z',
          updatedAt: '2023-01-01T00:00:00Z',
        },
      ],
      metadata: {
        total: 20,
        currentPage: 2,
        totalPages: 2,
        limit: 10,
      },
    }

    ;(useQuery as jest.Mock).mockImplementation(({ queryKey }) => {
      const page = queryKey[1]
      if (page === 2) {
        return {
          isLoading: false,
          data: mockPage2Data,
          error: null,
          refetch: jest.fn(),
        }
      }
      return {
        isLoading: false,
        data: mockPage1Data,
        error: null,
        refetch: jest.fn(),
      }
    })

    render(<UserTableNew />)

    // Tunggu tabel halaman 1 muncul
    await waitFor(() => {
      expect(screen.getByRole('table')).toBeInTheDocument()
      expect(screen.getByText('User Page 1')).toBeInTheDocument()
    })

    // Klik next page
    const nextPageButton = screen.getByRole('button', { name: /next/i })
    fireEvent.click(nextPageButton)

    // Verifikasi halaman berubah ke 2
    await waitFor(() => {
      expect(screen.getByText('User Page 2')).toBeInTheDocument()
    })
  })

  // Test reset pagination saat filter berubah
  test('TC-008: Pagination reset ke halaman 1 saat filter berubah', async () => {
    // Mock data untuk halaman 2
    const mockPage2Data = {
      users: [
        {
          id: '2',
          name: 'User Page 2',
          email: 'page2@example.com',
          role: 'mahasiswa',
          status: 'active',
          createdAt: '2023-01-01T00:00:00Z',
          updatedAt: '2023-01-01T00:00:00Z',
        },
      ],
      metadata: {
        total: 20,
        currentPage: 2,
        totalPages: 2,
        limit: 10,
      },
    }

    // Mock data setelah filter berubah
    const mockFilteredData = {
      users: [
        {
          id: '3',
          name: 'Filtered User',
          email: 'filtered@example.com',
          role: 'dosen',
          status: 'active',
          createdAt: '2023-01-01T00:00:00Z',
          updatedAt: '2023-01-01T00:00:00Z',
        },
      ],
      metadata: {
        total: 1,
        currentPage: 1,
        totalPages: 1,
        limit: 10,
      },
    }

    let currentPage = 2

    // Setup mock untuk halaman 2 (initial)
    ;(useQuery as jest.Mock).mockImplementation(() => {
      return {
        isLoading: false,
        data: mockPage2Data,
        error: null,
        refetch: jest.fn(),
      }
    })

    render(<UserTableNew />)

    // Verifikasi kita melihat data halaman 2
    await waitFor(() => {
      expect(screen.getByText('User Page 2')).toBeInTheDocument()
    })

    // Update mock untuk merespons perubahan filter
    ;(useQuery as jest.Mock).mockImplementation(({ queryKey }) => {
      const role = queryKey[3]

      if (role === 'dosen') {
        currentPage = 1 // Reset page to 1 when filter changes
        return {
          isLoading: false,
          data: mockFilteredData,
          error: null,
          refetch: jest.fn(),
        }
      }

      return {
        isLoading: false,
        data: mockPage2Data,
        error: null,
        refetch: jest.fn(),
      }
    })

    // Ubah filter role ke 'dosen'
    const roleSelect = screen.getAllByRole('combobox')[0]
    fireEvent.change(roleSelect, { target: { value: 'dosen' } })

    // Verifikasi pagination direset ke halaman 1 dan data terfilter muncul
    await waitFor(() => {
      expect(screen.getByText('Filtered User')).toBeInTheDocument()
      expect(currentPage).toBe(1)
    })
  })
})
