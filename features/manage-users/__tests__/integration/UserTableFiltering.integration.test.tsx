import { render, screen, fireEvent, waitFor } from '../test-utils'
import UserTableNew from '../../components/ui/UserTable'
import { server } from './mocks/server'
import { http, HttpResponse } from 'msw'

/**
 * Integration test untuk UserTable dengan fokus pada fitur filtering,
 * searching, pagination, dan error handling
 */
describe('UserTable Integration - Filtering & Pagination', () => {
  // Test render awal komponen
  test('TC-001: Menampilkan data pengguna setelah loading', async () => {
    render(<UserTableNew />)

    // Verifikasi loading state
    expect(screen.getByText(/mengambil data/i)).toBeInTheDocument()

    // Tunggu tabel muncul
    await waitFor(() => {
      expect(screen.queryByText(/mengambil data/i)).not.toBeInTheDocument()
      expect(screen.getByRole('table')).toBeInTheDocument()
    })

    // Verifikasi data dalam tabel
    const rows = screen.getAllByRole('row')
    expect(rows.length).toBeGreaterThan(1) // Header + minimal 1 data
  })

  // Test filtering berdasarkan role
  test('TC-002: Filter berdasarkan role menampilkan hanya user dengan role tersebut', async () => {
    render(<UserTableNew />)

    // Tunggu tabel muncul
    await waitFor(() => {
      expect(screen.getByRole('table')).toBeInTheDocument()
    })

    // Pilih filter role 'Admin'
    fireEvent.change(screen.getByDisplayValue('Semua Role'), {
      target: { value: 'admin' },
    })

    // Verifikasi API dipanggil dengan parameter yang benar
    await waitFor(() => {
      // Periksa badge role dalam tabel
      const roleBadges = screen.getAllByTestId('role-badge')
      roleBadges.forEach((badge) => {
        expect(badge.textContent).toContain('Admin')
      })
    })
  })

  // Test filtering berdasarkan status
  test('TC-003: Filter berdasarkan status menampilkan hanya user dengan status tersebut', async () => {
    render(<UserTableNew />)

    // Tunggu tabel muncul
    await waitFor(() => {
      expect(screen.getByRole('table')).toBeInTheDocument()
    })

    // Pilih filter status 'Active'
    fireEvent.change(screen.getByDisplayValue('Semua Status'), {
      target: { value: 'active' },
    })

    // Verifikasi API dipanggil dengan parameter yang benar
    await waitFor(() => {
      // Periksa badge status dalam tabel
      const statusBadges = screen.getAllByTestId('status-badge')
      statusBadges.forEach((badge) => {
        expect(badge.textContent).toContain('Active')
      })
    })
  })

  // Test searching nama/email
  test('TC-004: Search filter menampilkan hasil yang sesuai dengan keyword', async () => {
    // Override handler untuk mendapatkan hasil search yang konsisten
    server.use(
      http.get('/api/users', ({ request }) => {
        const url = new URL(request.url)
        const search = url.searchParams.get('search')

        if (search === 'test') {
          return HttpResponse.json(
            {
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
            },
            { status: 200 }
          )
        }

        return HttpResponse.json(
          {
            users: [],
            metadata: {
              total: 0,
              currentPage: 1,
              totalPages: 0,
              limit: 10,
            },
          },
          { status: 200 }
        )
      })
    )

    render(<UserTableNew />)

    // Tunggu tabel muncul
    await waitFor(() => {
      expect(screen.getByRole('table')).toBeInTheDocument()
    })

    // Masukkan teks pencarian
    fireEvent.change(screen.getByPlaceholderText(/cari nama atau email/i), {
      target: { value: 'test' },
    })

    // Tunggu hasil pencarian
    await waitFor(() => {
      expect(screen.getByText('Test User')).toBeInTheDocument()
      expect(screen.getByText('test@example.com')).toBeInTheDocument()
    })
  })

  // Test reset semua filter
  test('TC-005: Reset filter mengembalikan ke kondisi awal', async () => {
    render(<UserTableNew />)

    // Tunggu tabel muncul
    await waitFor(() => {
      expect(screen.getByRole('table')).toBeInTheDocument()
    })

    // Set beberapa filter
    fireEvent.change(screen.getByDisplayValue('Semua Role'), {
      target: { value: 'admin' },
    })
    fireEvent.change(screen.getByDisplayValue('Semua Status'), {
      target: { value: 'active' },
    })
    fireEvent.change(screen.getByPlaceholderText(/cari nama atau email/i), {
      target: { value: 'test' },
    })

    // Reset filter dengan tombol reset (icon FilterX)
    const resetButton = screen.getByRole('button', { name: /filter/i })
    fireEvent.click(resetButton)

    // Verifikasi filter dikembalikan ke nilai default
    await waitFor(() => {
      expect(screen.getByDisplayValue('Semua Role')).toBeInTheDocument()
      expect(screen.getByDisplayValue('Semua Status')).toBeInTheDocument()
      expect(screen.getByPlaceholderText(/cari nama atau email/i)).toHaveValue(
        ''
      )
    })
  })

  // Test error handling
  test('TC-006: Menampilkan error message jika API gagal', async () => {
    // Override handler untuk simulasi error
    server.use(
      http.get('/api/users', () => {
        return HttpResponse.json(
          { message: 'Error mengambil data pengguna' },
          { status: 500 }
        )
      })
    )

    render(<UserTableNew />)

    // Verifikasi error message muncul
    await waitFor(() => {
      expect(screen.getByText(/error/i)).toBeInTheDocument()
      expect(
        screen.getByText(/error mengambil data pengguna/i, { exact: false })
      ).toBeInTheDocument()
    })
  })

  // Test pagination
  test('TC-007: Navigasi pagination berfungsi dengan benar', async () => {
    render(<UserTableNew />)

    // Tunggu tabel muncul
    await waitFor(() => {
      expect(screen.getByRole('table')).toBeInTheDocument()
    })

    // Ambil data halaman pertama
    const firstPageRows = screen.getAllByRole('row')

    // Klik next page - ubah sesuai dengan implementasi pagination di DataTableNew
    const nextPageButton = screen.getByLabelText(/next page/i)
    fireEvent.click(nextPageButton)

    // Verifikasi data berubah - ini perlu disesuaikan dengan cara tabel menampilkan data
    await waitFor(() => {
      // Implementasi pagination mungkin berbeda, sesuaikan dengan implementasi aktual
      expect(screen.getByText(/page 2/i, { exact: false })).toBeInTheDocument()
    })
  })

  // Test reset pagination saat filter berubah
  test('TC-008: Pagination reset ke halaman 1 saat filter berubah', async () => {
    render(<UserTableNew />)

    // Tunggu tabel muncul
    await waitFor(() => {
      expect(screen.getByRole('table')).toBeInTheDocument()
    })

    // Klik next page untuk pindah ke halaman 2
    const nextPageButton = screen.getByLabelText(/next page/i)
    fireEvent.click(nextPageButton)

    // Verifikasi halaman berubah ke 2
    await waitFor(() => {
      expect(screen.getByText(/page 2/i, { exact: false })).toBeInTheDocument()
    })

    // Ubah filter role
    fireEvent.change(screen.getByDisplayValue('Semua Role'), {
      target: { value: 'dosen' },
    })

    // Verifikasi pagination direset ke halaman 1
    await waitFor(() => {
      expect(screen.getByText(/page 1/i, { exact: false })).toBeInTheDocument()
    })
  })
})
