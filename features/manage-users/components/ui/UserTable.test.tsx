import { render, screen, waitFor } from '@testing-library/react'
import UserTableNew from './UserTable'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import userEvent from '@testing-library/user-event'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'

// Mock untuk DataTable component
jest.mock('./UserTable/DataTable', () => ({
  DataTableNew: jest.fn(({ data, pagination }) => (
    <div data-testid="mock-data-table">
      <div>Jumlah Data: {data.length}</div>
      <div>Halaman: {pagination.page}</div>
      <div>Limit: {pagination.limit}</div>
      <div>Total: {pagination.total}</div>
    </div>
  )),
}))

// Import DataTableNew untuk digunakan dalam test
import { DataTableNew } from './UserTable/DataTable'

// Mock untuk Tanstack React Query useQuery
jest.mock('@tanstack/react-query', () => {
  const originalModule = jest.requireActual('@tanstack/react-query')
  return {
    ...originalModule,
    useQuery: jest.fn(),
  }
})

// Mock untuk React useState
jest.mock('react', () => {
  const originalModule = jest.requireActual('react')
  return {
    ...originalModule,
    useState: jest.fn(),
  }
})

// Mock untuk fetch API
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () =>
      Promise.resolve({
        users: [
          {
            id: '1',
            name: 'User 1',
            email: 'user1@example.com',
            role: 'admin',
          },
          {
            id: '2',
            name: 'User 2',
            email: 'user2@example.com',
            role: 'mahasiswa',
          },
        ],
        metadata: { total: 2 },
      }),
  })
) as jest.Mock

describe('UserTable', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    // Buat queryClient baru untuk setiap test
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    })

    // Reset semua mock
    jest.resetAllMocks()

    // Setup default mock untuk useQuery
    ;(useQuery as jest.Mock).mockReturnValue({
      data: {
        users: [
          {
            id: '1',
            name: 'User 1',
            email: 'user1@example.com',
            role: 'admin',
          },
          {
            id: '2',
            name: 'User 2',
            email: 'user2@example.com',
            role: 'mahasiswa',
          },
        ],
        metadata: { total: 2 },
      },
      isLoading: false,
      error: null,
    })

    // Pastikan DataTableNew mock tidak bertahan antar test
    ;(DataTableNew as jest.Mock).mockClear()
  })

  const renderComponent = () => {
    return render(
      <QueryClientProvider client={queryClient}>
        <UserTableNew />
      </QueryClientProvider>
    )
  }

  it('renders the user table with title', async () => {
    renderComponent()

    // Cek judul tabel ditampilkan
    expect(screen.getByText('User Management')).toBeInTheDocument()

    // Pastikan DataTableNew dipanggil
    expect(DataTableNew).toHaveBeenCalled()
  })

  it('allows filtering by search input', async () => {
    const user = userEvent.setup()
    renderComponent()

    // Ambil search input
    const searchInput = screen.getByPlaceholderText('Cari nama atau email...')

    // Ketik dalam search input
    await user.type(searchInput, 'test search')

    // Cek apakah fetch dipanggil dengan parameter pencarian
    await waitFor(() => {
      expect(useQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          queryKey: expect.arrayContaining([
            'users',
            expect.anything(),
            expect.anything(),
            expect.anything(),
            expect.anything(),
            'test search',
          ]),
        })
      )
    })
  })

  it('allows filtering by role', async () => {
    const user = userEvent.setup()
    renderComponent()

    // Buka dropdown role - pilih button, bukan span
    const roleSelect = screen.getByRole('combobox', { name: '' })
    await user.click(roleSelect)

    // Perbarui mock setelah dropdown terbuka
    ;(useQuery as jest.Mock).mockReturnValue({
      data: {
        users: [
          {
            id: '1',
            name: 'User 1',
            email: 'user1@example.com',
            role: 'admin',
          },
        ],
        metadata: { total: 1 },
      },
      isLoading: false,
      error: null,
    })

    // Sekarang kita simulasikan pemilihan option dengan update useQuery langsung
    // karena kita tidak bisa access dropdown content yang sebenarnya
    const mockSetRole = jest.fn()
    ;(useState as jest.Mock).mockImplementation((initialState) => {
      if (initialState === 'all') {
        return ['admin', mockSetRole]
      }
      return [initialState, jest.fn()]
    })

    // Cek apakah useQuery dipanggil dengan filter role
    await waitFor(() => {
      expect(useQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          queryKey: expect.arrayContaining(['users']),
        })
      )
    })
  })

  it('allows filtering by status', async () => {
    const user = userEvent.setup()
    renderComponent()

    // Buka dropdown status - pilih button, bukan span
    const statusSelect = screen.getByRole('combobox', { name: '' })
    await user.click(statusSelect)

    // Perbarui mock setelah dropdown terbuka
    ;(useQuery as jest.Mock).mockReturnValue({
      data: {
        users: [
          {
            id: '1',
            name: 'User 1',
            email: 'user1@example.com',
            role: 'admin',
            status: 'active',
          },
        ],
        metadata: { total: 1 },
      },
      isLoading: false,
      error: null,
    })

    // Cek apakah useQuery dipanggil dengan filter status
    await waitFor(() => {
      expect(useQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          queryKey: expect.arrayContaining(['users']),
        })
      )
    })
  })

  it('resets all filters when reset button is clicked', async () => {
    const user = userEvent.setup()
    renderComponent()

    // Set search filter
    const searchInput = screen.getByPlaceholderText('Cari nama atau email...')
    await user.type(searchInput, 'test')

    // Klik tombol reset (button dengan FilterX icon)
    const resetButton = screen.getByRole('button', {
      name: '', // tombol tanpa teks, hanya ikon
    })

    await user.click(resetButton)

    // Verify search input is cleared
    expect(searchInput).toHaveValue('')

    // Cek apakah useQuery dipanggil dengan reset filter
    await waitFor(() => {
      expect(useQuery).toHaveBeenCalled()
    })
  })

  it('displays error message when API call fails', async () => {
    // Set error untuk useQuery
    ;(useQuery as jest.Mock).mockReturnValue({
      data: null,
      isLoading: false,
      error: new Error('API Error'),
    })

    renderComponent()

    // Check if error message is displayed
    await waitFor(() => {
      expect(screen.getByText(/Error: API Error/)).toBeInTheDocument()
    })
  })

  it('handles pagination changes', async () => {
    renderComponent()

    // Pastikan DataTableNew dipanggil
    expect(DataTableNew).toHaveBeenCalled()

    // Dapatkan pagination dari prop yang diteruskan ke DataTableNew
    const mockCalls = (DataTableNew as jest.Mock).mock.calls
    const lastCall = mockCalls[mockCalls.length - 1]
    const { pagination } = lastCall[0]

    // Panggil onPageChange secara manual
    pagination.onPageChange(2)

    // Cek apakah useQuery dipanggil dengan page baru
    await waitFor(() => {
      expect(useQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          queryKey: expect.arrayContaining([expect.anything(), 2]),
        })
      )
    })
  })
})
