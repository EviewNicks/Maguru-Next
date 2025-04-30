import { render, screen } from '@testing-library/react'
import { DataTableNew, PaginationProps } from './DataTable'
import userEvent from '@testing-library/user-event'
import { User } from '@/types/user'

// Mock useUserActions hook
jest.mock('@/hooks/useUserActions', () => ({
  useUserActions: () => ({
    updateUser: {
      isPending: false,
      mutateAsync: jest.fn().mockResolvedValue({}),
    },
    deleteUser: {
      isPending: false,
      mutateAsync: jest.fn().mockResolvedValue({}),
    },
  }),
}))

// Mock React Redux
jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: () => jest.fn(),
}))

// Mock store hooks
jest.mock('@/store/hooks', () => ({
  useAppDispatch: () => jest.fn(),
}))

describe('DataTable', () => {
  // Mock data user untuk test
  const mockUsers: User[] = [
    {
      id: '1',
      name: 'Test User',
      email: 'test@example.com',
      role: 'admin',
      status: 'active',
      createdAt: new Date('2023-01-15'),
    },
    {
      id: '2',
      name: 'Another User',
      email: 'another@example.com',
      role: 'mahasiswa',
      status: 'inactive',
      createdAt: new Date('2023-02-20'),
    },
  ]

  // Mock pagination props
  const mockPagination: PaginationProps = {
    page: 1,
    limit: 10,
    total: 20,
    onPageChange: jest.fn(),
    onLimitChange: jest.fn(),
  }

  it('renders loading skeleton when isLoading is true', () => {
    render(<DataTableNew data={[]} isLoading={true} />)

    // Verifikasi bahwa skeleton ditampilkan
    const skeletons = document.querySelectorAll('.animate-pulse')
    expect(skeletons.length).toBeGreaterThan(0)
  })

  it('renders empty state when no data and not loading', () => {
    render(<DataTableNew data={[]} isLoading={false} />)

    // Verifikasi bahwa pesan empty state ditampilkan
    expect(screen.getByText('Tidak ada data.')).toBeInTheDocument()
  })

  it('renders user data correctly', () => {
    render(<DataTableNew data={mockUsers} isLoading={false} />)

    // Cek data user ditampilkan
    expect(screen.getByText('test@example.com')).toBeInTheDocument()
    expect(screen.getByText('Test User')).toBeInTheDocument()
    expect(screen.getByText('another@example.com')).toBeInTheDocument()
    expect(screen.getByText('Another User')).toBeInTheDocument()
  })

  it('renders pagination when pagination props provided', () => {
    render(
      <DataTableNew
        data={mockUsers}
        isLoading={false}
        pagination={mockPagination}
      />
    )

    // Cek elemen pagination ditampilkan - verifikasi bahwa pagination text ada
    expect(screen.getByText(/Menampilkan/i)).toBeInTheDocument()

    // Cek tombol previous/next pagination ada
    expect(screen.getByLabelText(/previous/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/next/i)).toBeInTheDocument()
  })

  it('does not render pagination when pagination props not provided', () => {
    render(<DataTableNew data={mockUsers} isLoading={false} />)

    // Cek tidak ada elemen pagination yang ditampilkan
    expect(screen.queryByText(/Menampilkan/i)).not.toBeInTheDocument()
    expect(screen.queryByLabelText(/previous/i)).not.toBeInTheDocument()
    expect(screen.queryByLabelText(/next/i)).not.toBeInTheDocument()
  })

  it('calls onPageChange when pagination buttons clicked', async () => {
    const user = userEvent.setup()
    render(
      <DataTableNew
        data={mockUsers}
        isLoading={false}
        pagination={mockPagination}
      />
    )

    // Klik tombol next pagination
    const nextButton = screen.getByLabelText(/next/i)
    await user.click(nextButton)

    // Verifikasi bahwa onPageChange dipanggil dengan page + 1
    expect(mockPagination.onPageChange).toHaveBeenCalledWith(2)
  })

  it('disables previous button on first page', () => {
    render(
      <DataTableNew
        data={mockUsers}
        isLoading={false}
        pagination={mockPagination}
      />
    )

    // Cek tombol previous di-disable dengan class CSS pointer-events-none
    const prevButton = screen.getByLabelText(/previous/i)
    expect(prevButton).toHaveClass('pointer-events-none')
    expect(prevButton).toHaveClass('opacity-50')
  })

  it('disables next button on last page', () => {
    const lastPagePagination = {
      ...mockPagination,
      page: 2,
      total: 20,
      limit: 10,
    }

    render(
      <DataTableNew
        data={mockUsers}
        isLoading={false}
        pagination={lastPagePagination}
      />
    )

    // Cek tombol next di-disable dengan class CSS pointer-events-none
    const nextButton = screen.getByLabelText(/next/i)
    expect(nextButton).toHaveClass('pointer-events-none')
    expect(nextButton).toHaveClass('opacity-50')
  })

  it('renders limit selection dropdown', () => {
    render(
      <DataTableNew
        data={mockUsers}
        isLoading={false}
        pagination={mockPagination}
      />
    )

    // Verifikasi bahwa dropdown baris per halaman ditampilkan
    expect(screen.getByText('Baris per halaman')).toBeInTheDocument()

    // Verifikasi bahwa onLimitChange telah di-mock dengan benar
    expect(mockPagination.onLimitChange).toBeDefined()
  })

  it('correctly displays page information', () => {
    const customPagination = {
      ...mockPagination,
      page: 2,
      limit: 5,
      total: 12,
    }

    render(
      <DataTableNew
        data={mockUsers}
        isLoading={false}
        pagination={customPagination}
      />
    )

    // Verifikasi bahwa informasi halaman ditampilkan dengan benar
    // Halaman 2 dengan limit 5 dari total 12 seharusnya menampilkan "Menampilkan 6 - 10 dari 12 data"
    expect(
      screen.getByText(/Menampilkan 6 - 10 dari 12 data/i)
    ).toBeInTheDocument()
  })

  it('displays proper column headers', () => {
    render(<DataTableNew data={mockUsers} isLoading={false} />)

    // Verifikasi bahwa header kolom ditampilkan dengan teks bahasa Indonesia
    expect(screen.getByText('Nama')).toBeInTheDocument()
    expect(screen.getByText('Email')).toBeInTheDocument()
    expect(screen.getByText('Role')).toBeInTheDocument()
    expect(screen.getByText('Status')).toBeInTheDocument()
    expect(screen.getByText('Aksi')).toBeInTheDocument()
  })

  it('handles large data sets efficiently', () => {
    // Buat array dengan 100 user
    const largeDataSet = Array(100)
      .fill(null)
      .map((_, index) => ({
        id: `${index}`,
        name: `User ${index}`,
        email: `user${index}@example.com`,
        role: index % 2 === 0 ? 'admin' : ('mahasiswa' as const),
        status: index % 3 === 0 ? 'active' : ('inactive' as const),
        createdAt: new Date(),
      }))

    render(
      <DataTableNew
        data={largeDataSet as User[]}
        isLoading={false}
        pagination={{
          ...mockPagination,
          total: 100,
        }}
      />
    )

    // Hanya user sesuai limit pagination yang seharusnya di-render
    // Untuk mockPagination.limit = 10, hanya 10 item yang seharusnya di-render
    const userRows = document.querySelectorAll('.data-row')
    expect(userRows.length).toBeLessThanOrEqual(mockPagination.limit)
  })
})
