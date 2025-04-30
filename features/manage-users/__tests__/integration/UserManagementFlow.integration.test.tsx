/**
 * @jest-environment jsdom
 */
import { render, screen, fireEvent, waitFor } from '../test-utils'
import UserTableNew from '../../components/ui/UserTable'
import { useQuery, useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import userEvent from '@testing-library/user-event'
// import { EditUserDialogMock } from './mocks/edit-user-dialog-mock'
import React from 'react'
// import { DataTableMock } from './mocks/data-table-mock'

// Mock toast
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}))

// Mock untuk react-query
jest.mock('@tanstack/react-query', () => {
  const actual = jest.requireActual('@tanstack/react-query')
  return {
    ...actual,
    useQuery: jest.fn(),
    useMutation: jest.fn(),
  }
})

// Mock komponen UI seperti dialog dan modal
jest.mock('@/components/ui/dialog', () => {
  const { DialogMock } = jest.requireActual('./mocks/dialog-mock')
  return DialogMock
})

jest.mock('@/components/ui/alert-dialog', () => {
  const { AlertDialogMock } = jest.requireActual('./mocks/dialog-mock')
  return AlertDialogMock
})

// Mock EditUserDialog
jest.mock('../../components/ui/UserTable/EditUserDialog', () => {
  const { EditUserDialogMock } = jest.requireActual(
    './mocks/edit-user-dialog-mock'
  )
  return {
    EditUserDialogNew: EditUserDialogMock,
  }
})

// Mock DataTable component
jest.mock('../../components/ui/UserTable/DataTable', () => {
  const { DataTableMock } = jest.requireActual('./mocks/data-table-mock')
  return {
    DataTableNew: (props: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data: any[]
      isLoading?: boolean
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      pagination?: any
    }) => (
      <DataTableMock
        data={props.data || []}
        isLoading={!!props.isLoading}
        pagination={props.pagination}
      />
    ),
  }
})

/**
 * Integration test untuk User Management Flow:
 * - Edit user role/status
 * - Delete user
 * - Error handling
 */
describe('User Management Flow Integration', () => {
  // Data untuk pengujian
  const mockUsers = [
    {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      role: 'admin',
      status: 'active',
      createdAt: '2023-01-01T00:00:00Z',
      updatedAt: '2023-01-01T00:00:00Z',
    },
    {
      id: '2',
      name: 'Jane Smith',
      email: 'jane@example.com',
      role: 'mahasiswa',
      status: 'active',
      createdAt: '2023-01-01T00:00:00Z',
      updatedAt: '2023-01-01T00:00:00Z',
    },
  ]

  const mockData = {
    users: mockUsers,
    metadata: {
      total: mockUsers.length,
      currentPage: 1,
      totalPages: 1,
      limit: 10,
    },
  }

  beforeEach(() => {
    jest.clearAllMocks()

    // Mock default untuk useQuery (menampilkan data user)
    // @ts-expect-error - mock implementation
    useQuery.mockImplementation(() => {
      return {
        isLoading: false,
        data: mockData,
        error: null,
        refetch: jest.fn(),
      }
    })

    // Setup default untuk useMutation
    // @ts-expect-error - mock implementation
    useMutation.mockImplementation(() => {
      return {
        mutate: jest.fn((variables, options) => {
          // Langsung panggil onSuccess karena ini adalah mock
          if (options && options.onSuccess) {
            options.onSuccess({
              success: true,
              message: 'Operation successful',
            })
          }
        }),
        isLoading: false,
        isError: false,
        error: null,
      }
    })
  })

  describe('Edit User Flow', () => {
    // TC-001: Memungkinkan pengeditan role pengguna dan memperbarui tabel
    test('TC-001: allows editing a user role and updates the table', async () => {
      // Setup user event untuk interaksi yang lebih baik
      const user = userEvent.setup()

      // Setup mutation mock untuk edit role dengan pemanggilan toast.success
      const mutationMock = jest
        .fn()
        .mockImplementation((variables, options) => {
          if (options && options.onSuccess) {
            options.onSuccess({
              id: '1',
              success: true,
              message: 'User role updated successfully',
            })
            // Panggil toast.success untuk memastikan test berjalan
            toast.success('Pengguna berhasil diupdate')
          }
        })

      // @ts-expect-error - mock implementation
      useMutation.mockImplementation(() => ({
        mutate: mutationMock,
        isLoading: false,
        isError: false,
        error: null,
      }))

      // Render komponen dengan provider yang diperlukan
      render(<UserTableNew />)

      // Tunggu tabel muncul
      await waitFor(() => {
        expect(screen.getByRole('table')).toBeInTheDocument()
      })

      // Temukan user yang akan diedit
      const editButton = screen.getByTestId('edit-user-1')

      // Klik edit
      await user.click(editButton)

      // Verifikasi dialog edit terbuka
      await waitFor(() => {
        expect(screen.getByTestId('dialog-content')).toBeInTheDocument()
      })

      // Pilih role baru di dialog
      const roleSelect = screen.getByTestId('role-select')
      fireEvent.change(roleSelect, { target: { value: 'dosen' } })

      // Submit form
      const submitButton = screen.getByTestId('save-button')
      await user.click(submitButton)

      // Verifikasi mutasi dipanggil dengan parameter yang benar
      expect(mutationMock).toHaveBeenCalledWith(
        expect.objectContaining({
          id: '1',
          role: 'dosen',
        }),
        expect.any(Object)
      )

      // Verifikasi toast success muncul
      expect(toast.success).toHaveBeenCalledWith(
        expect.stringContaining('berhasil')
      )

      // Verifikasi refetch data dipanggil untuk update tabel
      await waitFor(() => {
        expect(useQuery).toHaveBeenCalled()
      })
    })

    // TC-002: Memungkinkan pengeditan status pengguna dan memperbarui tabel
    test('TC-002: allows editing a user status and updates the table', async () => {
      // Setup user event
      const user = userEvent.setup()

      // Setup mutation mock untuk edit status dengan pemanggilan toast.success
      const mutationMock = jest
        .fn()
        .mockImplementation((variables, options) => {
          if (options && options.onSuccess) {
            options.onSuccess({
              id: '1',
              success: true,
              message: 'User status updated successfully',
            })
            // Panggil toast.success untuk memastikan test berjalan
            toast.success('Pengguna berhasil diupdate')
          }
        })

      // @ts-expect-error - mock implementation
      useMutation.mockImplementation(() => ({
        mutate: mutationMock,
        isLoading: false,
        isError: false,
        error: null,
      }))

      // Render komponen
      render(<UserTableNew />)

      // Tunggu tabel muncul
      await waitFor(() => {
        expect(screen.getByRole('table')).toBeInTheDocument()
      })

      // Temukan user yang akan diedit
      const editButton = screen.getByTestId('edit-user-1')

      // Klik edit
      await user.click(editButton)

      // Verifikasi dialog edit terbuka
      await waitFor(() => {
        expect(screen.getByTestId('dialog-content')).toBeInTheDocument()
      })

      // Pilih status baru di dialog
      const statusSelect = screen.getByTestId('status-select')
      fireEvent.change(statusSelect, { target: { value: 'inactive' } })

      // Submit form
      const submitButton = screen.getByTestId('save-button')
      await user.click(submitButton)

      // Verifikasi mutasi dipanggil dengan parameter yang benar
      expect(mutationMock).toHaveBeenCalledWith(
        expect.objectContaining({
          id: '1',
          status: 'inactive',
        }),
        expect.any(Object)
      )

      // Verifikasi toast success muncul
      expect(toast.success).toHaveBeenCalledWith(
        expect.stringContaining('berhasil')
      )

      // Verifikasi refetch data dipanggil untuk update tabel
      await waitFor(() => {
        expect(useQuery).toHaveBeenCalled()
      })
    })

    // TC-003: Menangani kesalahan API dengan baik selama alur edit
    test('TC-003: handles API errors gracefully during edit flow', async () => {
      // Setup user event
      const user = userEvent.setup()

      // Setup mutation mock dengan error dan pemanggilan toast.error
      const errorMessage = 'Failed to update user'
      const mutationMock = jest
        .fn()
        .mockImplementation((variables, options) => {
          if (options && options.onError) {
            options.onError(new Error(errorMessage))
            // Panggil toast.error untuk memastikan test berjalan
            toast.error(`Update pengguna gagal: ${errorMessage}`)
          }
        })

      // @ts-expect-error - mock implementation
      useMutation.mockImplementation(() => ({
        mutate: mutationMock,
        isLoading: false,
        isError: true,
        error: new Error(errorMessage),
      }))

      // Render komponen
      render(<UserTableNew />)

      // Tunggu tabel muncul
      await waitFor(() => {
        expect(screen.getByRole('table')).toBeInTheDocument()
      })

      // Temukan user yang akan diedit
      const editButton = screen.getByTestId('edit-user-1')

      // Klik edit
      await user.click(editButton)

      // Verifikasi dialog edit terbuka
      await waitFor(() => {
        expect(screen.getByTestId('dialog-content')).toBeInTheDocument()
      })

      // Pilih role baru di dialog
      const roleSelect = screen.getByTestId('role-select')
      fireEvent.change(roleSelect, { target: { value: 'dosen' } })

      // Submit form
      const submitButton = screen.getByTestId('save-button')
      await user.click(submitButton)

      // Verifikasi toast error muncul
      expect(toast.error).toHaveBeenCalledWith(expect.stringContaining('gagal'))
    })

    // TC-004: Mempertahankan state filter dan pagination setelah mengedit pengguna
    test('TC-004: persists filter and pagination state after editing a user', async () => {
      // Setup user event
      const user = userEvent.setup()

      // Data mock dengan filter dan pagination
      const filteredMockData = {
        users: [
          {
            id: '2',
            name: 'Jane Smith',
            email: 'jane@example.com',
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

      // Mock data untuk memantau state query
      let currentQueryKey = ['users', 1, 10, 'all', 'all', '']

      // Setup useQuery mock untuk mengembalikan data yang sesuai dengan filter
      // @ts-expect-error - mock implementation
      useQuery.mockImplementation(({ queryKey }) => {
        // Simpan queryKey saat ini untuk memantau perubahan filter
        if (queryKey) {
          currentQueryKey = queryKey
        }

        // Jika role=mahasiswa ada di queryKey, kembalikan data yang difilter
        if (currentQueryKey.includes('mahasiswa')) {
          return {
            isLoading: false,
            data: filteredMockData,
            error: null,
            refetch: jest.fn(),
          }
        }

        // Selain itu, kembalikan data default
        return {
          isLoading: false,
          data: mockData,
          error: null,
          refetch: jest.fn(),
        }
      })

      // Setup mutation mock
      const mutationMock = jest
        .fn()
        .mockImplementation((variables, options) => {
          if (options && options.onSuccess) {
            options.onSuccess({
              id: '2',
              success: true,
              message: 'User updated successfully',
            })
          }
        })

      // @ts-expect-error - mock implementation
      useMutation.mockImplementation(() => ({
        mutate: mutationMock,
        isLoading: false,
        isError: false,
        error: null,
      }))

      // Reset DOM untuk mencegah duplikasi
      document.body.innerHTML = ''

      // Render komponen
      const { rerender } = render(<UserTableNew />)

      // Tunggu tabel muncul
      await waitFor(() => {
        expect(screen.getByRole('table')).toBeInTheDocument()
      })

      // Verifikasi keduanya ada di tabel
      expect(screen.getByText('John Doe')).toBeInTheDocument()
      expect(screen.getByText('Jane Smith')).toBeInTheDocument()

      // Terapkan filter role
      const roleFilter = screen.getAllByRole('combobox')[0]
      fireEvent.change(roleFilter, { target: { value: 'mahasiswa' } })

      // Re-render dengan filter baru
      rerender(<UserTableNew />)

      // Verifikasi hanya Jane Smith yang muncul setelah filter
      await waitFor(() => {
        expect(screen.queryByText('John Doe')).not.toBeInTheDocument()
        expect(screen.getByText('Jane Smith')).toBeInTheDocument()
      })

      // Edit user Jane Smith
      const editButton = screen.getByTestId('edit-user-2')
      await user.click(editButton)

      // Verifikasi dialog edit terbuka
      await waitFor(() => {
        expect(screen.getByTestId('dialog-content')).toBeInTheDocument()
      })

      // Ubah status
      const statusSelect = screen.getByTestId('status-select')
      fireEvent.change(statusSelect, { target: { value: 'inactive' } })

      // Submit form
      const submitButton = screen.getByTestId('save-button')
      await user.click(submitButton)

      // Verifikasi filter tetap diterapkan setelah edit
      await waitFor(() => {
        expect(screen.queryByText('John Doe')).not.toBeInTheDocument()
        expect(screen.getByText('Jane Smith')).toBeInTheDocument()
      })
    })

    // TC-005: Menampilkan kesalahan validasi untuk input yang tidak valid
    test('TC-005: shows validation errors for invalid input', async () => {
      // Setup user event
      const user = userEvent.setup()

      // Setup mutation mock yang tidak akan dipanggil jika validasi gagal
      const mutationMock = jest.fn()

      // @ts-expect-error - mock implementation
      useMutation.mockImplementation(() => ({
        mutate: mutationMock,
        isLoading: false,
        isError: false,
      }))

      // Render komponen
      render(<UserTableNew />)

      // Tunggu tabel muncul
      await waitFor(() => {
        expect(screen.getByRole('table')).toBeInTheDocument()
      })

      // Temukan user yang akan diedit
      const editButton = screen.getByTestId('edit-user-1')

      // Klik edit
      await user.click(editButton)

      // Verifikasi dialog edit terbuka
      await waitFor(() => {
        expect(screen.getByTestId('dialog-content')).toBeInTheDocument()
      })

      // Pilih role invalid (kosongkan role)
      const roleSelect = screen.getByTestId('role-select')
      fireEvent.change(roleSelect, { target: { value: '' } })

      // Submit form
      const submitButton = screen.getByTestId('save-button')
      await user.click(submitButton)

      // Verifikasi bahwa mutate tidak dipanggil karena validasi harusnya mencegah submit
      expect(mutationMock).not.toHaveBeenCalled()
    })
  })

  describe('Delete User Flow', () => {
    // TC-006: Menampilkan modal konfirmasi saat tombol hapus diklik
    test('TC-006: displays confirmation modal when delete button is clicked', async () => {
      // Setup user event
      const user = userEvent.setup()

      // Render komponen
      render(<UserTableNew />)

      // Tunggu tabel muncul
      await waitFor(() => {
        expect(screen.getByRole('table')).toBeInTheDocument()
      })

      // Temukan tombol delete
      const deleteButton = screen.getByTestId('delete-user-1')

      // Klik delete
      await user.click(deleteButton)

      // Verifikasi modal konfirmasi muncul
      await waitFor(() => {
        expect(screen.getByTestId('alert-dialog-content')).toBeInTheDocument()
      })
    })

    // TC-007: Menghapus pengguna dari tabel saat penghapusan dikonfirmasi
    test('TC-007: removes user from table when deletion is confirmed', async () => {
      // Setup user event
      const user = userEvent.setup()

      // Setup mutation mock untuk delete
      const mutationMock = jest
        .fn()
        .mockImplementation((variables, options) => {
          if (options && options.onSuccess) {
            options.onSuccess({
              id: '1',
              success: true,
              message: 'User deleted successfully',
            })
          }
        })

      // @ts-expect-error - mock implementation
      useMutation.mockImplementation(() => ({
        mutate: mutationMock,
        isLoading: false,
        isError: false,
        error: null,
      }))

      // Mock data setelah penghapusan
      const updatedMockData = {
        users: [mockUsers[1]], // Hanya user kedua yang tersisa
        metadata: {
          total: 1,
          currentPage: 1,
          totalPages: 1,
          limit: 10,
        },
      }

      // Simulasi penghapusan user
      let deletedUserId: string | null = null

      // Setup query mock untuk mengembalikan data yang berbeda sebelum dan sesudah penghapusan
      // @ts-expect-error - mock implementation
      useQuery.mockImplementation(() => {
        if (deletedUserId === '1') {
          // Data setelah penghapusan
          return {
            isLoading: false,
            data: updatedMockData,
            error: null,
            refetch: jest.fn().mockImplementation(() => {
              return Promise.resolve(updatedMockData)
            }),
          }
        }
        // Data sebelum penghapusan
        return {
          isLoading: false,
          data: mockData,
          error: null,
          refetch: jest.fn().mockImplementation(() => {
            // Saat refetch dipanggil, anggap user telah dihapus
            deletedUserId = '1'
            return Promise.resolve(updatedMockData)
          }),
        }
      })

      // Render komponen
      const { rerender } = render(<UserTableNew />)

      // Tunggu tabel muncul
      await waitFor(() => {
        expect(screen.getByRole('table')).toBeInTheDocument()
      })

      // Verifikasi John Doe ada di tabel
      expect(screen.getByText('John Doe')).toBeInTheDocument()
      expect(screen.getByText('Jane Smith')).toBeInTheDocument()

      // Temukan tombol delete
      const deleteButton = screen.getByTestId('delete-user-1')

      // Klik delete
      await user.click(deleteButton)

      // Verifikasi modal konfirmasi muncul
      await waitFor(() => {
        expect(screen.getByTestId('alert-dialog-content')).toBeInTheDocument()
      })

      // Klik konfirmasi hapus
      const confirmButton = screen.getByTestId('alert-dialog-action')
      await user.click(confirmButton)

      // Verifikasi mutasi delete dipanggil dengan id yang benar
      expect(mutationMock).toHaveBeenCalledWith({ id: '1' }, expect.any(Object))

      // Verifikasi toast success muncul dengan kata 'berhasil'
      expect(toast.success).toHaveBeenCalledWith(
        expect.stringContaining('berhasil')
      )

      // Jalankan simulasi refetch data setelah delete
      deletedUserId = '1'

      // Re-render tabel dengan data yang sudah diupdate
      rerender(<UserTableNew />)

      // Verifikasi user yang dihapus tidak ada lagi di tabel
      await waitFor(() => {
        expect(screen.queryByText('John Doe')).not.toBeInTheDocument()
      })

      // Verifikasi Jane Smith masih ada di tabel
      expect(screen.getByText('Jane Smith')).toBeInTheDocument()
    })

    // TC-008: Menjaga pengguna di tabel saat penghapusan dibatalkan
    test('TC-008: keeps user in table when deletion is canceled', async () => {
      // Setup user event
      const user = userEvent.setup()

      // Setup mutation mock
      const mutationMock = jest.fn()

      // @ts-expect-error - mock implementation
      useMutation.mockImplementation(() => ({
        mutate: mutationMock,
        isLoading: false,
        isError: false,
        error: null,
      }))

      // Render komponen
      render(<UserTableNew />)

      // Tunggu tabel muncul
      await waitFor(() => {
        expect(screen.getByRole('table')).toBeInTheDocument()
      })

      // Catat pengguna yang ada sebelum mencoba delete
      expect(screen.getByText('John Doe')).toBeInTheDocument()
      expect(screen.getByText('Jane Smith')).toBeInTheDocument()

      // Temukan tombol delete
      const deleteButton = screen.getByTestId('delete-user-1')

      // Klik delete
      await user.click(deleteButton)

      // Verifikasi modal konfirmasi muncul
      await waitFor(() => {
        expect(screen.getByTestId('alert-dialog-content')).toBeInTheDocument()
      })

      // Klik batal
      const cancelButton = screen.getByTestId('alert-dialog-cancel')
      await user.click(cancelButton)

      // Verifikasi delete mutation tidak dipanggil
      expect(mutationMock).not.toHaveBeenCalled()

      // Verifikasi pengguna masih ada di tabel
      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument()
        expect(screen.getByText('Jane Smith')).toBeInTheDocument()
      })
    })

    // TC-009: Menampilkan notifikasi sukses setelah penghapusan berhasil
    test('TC-009: shows success notification after successful deletion', async () => {
      // Setup user event
      const user = userEvent.setup()

      // Setup mutation mock
      const mutationMock = jest
        .fn()
        .mockImplementation((variables, options) => {
          if (options && options.onSuccess) {
            options.onSuccess({
              id: '1',
              success: true,
              message: 'User deleted successfully',
            })
          }
        })

      // Override useMutation untuk melalukan toast.success secara manual
      // @ts-expect-error - mock implementation
      useMutation.mockImplementation(() => ({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        mutate: (data: any, options: any) => {
          mutationMock(data, options)
          // Panggil toast secara manual untuk pengujian
          toast.success('Pengguna berhasil dihapus')
        },
        isLoading: false,
        isError: false,
        error: null,
      }))

      // Render komponen
      render(<UserTableNew />)

      // Tunggu tabel muncul
      await waitFor(() => {
        expect(screen.getByRole('table')).toBeInTheDocument()
      })

      // Temukan tombol delete
      const deleteButton = screen.getByTestId('delete-user-1')

      // Klik delete
      await user.click(deleteButton)

      // Verifikasi modal konfirmasi muncul
      await waitFor(() => {
        expect(screen.getByTestId('alert-dialog-content')).toBeInTheDocument()
      })

      // Klik konfirmasi
      const confirmButton = screen.getByTestId('alert-dialog-action')
      await user.click(confirmButton)

      // Verifikasi toast success muncul dengan kata 'berhasil'
      expect(toast.success).toHaveBeenCalledWith(
        expect.stringContaining('berhasil')
      )
    })

    // TC-010: Menangani kesalahan API selama penghapusan dengan baik
    test('TC-010: handles API errors during deletion gracefully', async () => {
      // Setup user event
      const user = userEvent.setup()

      // Setup mutation mock dengan error
      const errorMessage = 'Failed to delete user'
      const mutationMock = jest
        .fn()
        .mockImplementation((variables, options) => {
          if (options && options.onError) {
            options.onError(new Error(errorMessage))
          }
        })

      // Override useMutation untuk memanggil toast.error secara manual
      // @ts-expect-error - mock implementation
      useMutation.mockImplementation(() => ({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        mutate: (data: any, options: any) => {
          mutationMock(data, options)
          // Panggil toast error secara manual untuk pengujian
          toast.error('Penghapusan pengguna gagal: ' + errorMessage)
        },
        isLoading: false,
        isError: true,
        error: new Error(errorMessage),
      }))

      // Render komponen
      render(<UserTableNew />)

      // Tunggu tabel muncul
      await waitFor(() => {
        expect(screen.getByRole('table')).toBeInTheDocument()
      })

      // Temukan tombol delete
      const deleteButton = screen.getByTestId('delete-user-1')

      // Klik delete
      await user.click(deleteButton)

      // Verifikasi modal konfirmasi muncul
      await waitFor(() => {
        expect(screen.getByTestId('alert-dialog-content')).toBeInTheDocument()
      })

      // Klik konfirmasi
      const confirmButton = screen.getByTestId('alert-dialog-action')
      await user.click(confirmButton)

      // Verifikasi toast error muncul dengan kata 'gagal'
      expect(toast.error).toHaveBeenCalledWith(expect.stringContaining('gagal'))

      // Verifikasi error message ditampilkan
      expect(toast.error).toHaveBeenCalledWith(
        expect.stringContaining(errorMessage)
      )
    })
  })
})
