import React, { useState } from 'react'
import { User } from '@/types/user'
import { AlertDialogMock } from './dialog-mock'
import { EditUserDialogMock } from './edit-user-dialog-mock'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'

// Tipe untuk pagination props
interface PaginationProps {
  page: number
  limit: number
  total: number
  onPageChange: (page: number) => void
  onLimitChange?: (limit: number) => void
}

// Tipe untuk props DataTableMock
interface DataTableMockProps {
  data: User[]
  isLoading: boolean
  pagination?: PaginationProps
}

// Interface untuk parameter delete
interface DeleteUserParams {
  id: string
}

// Mock untuk DataTable yang memastikan table memiliki rendering dasar
export const DataTableMock: React.FC<DataTableMockProps> = ({
  data,
  isLoading,
  pagination,
}) => {
  const [dialogOpen, setDialogOpen] = useState<{ [key: string]: boolean }>({})
  const [editDialogOpen, setEditDialogOpen] = useState<boolean>(false)
  const [currentUser, setCurrentUser] = useState<User | null>(null)

  // Gunakan mock dari integration test
  const { mutate: deleteUser } = useMutation({
    mutationFn: async (params: DeleteUserParams) => {
      return {
        success: true,
        id: params.id,
        message: 'User deleted successfully',
      }
    },
  })

  const handleEdit = (user: User) => {
    setCurrentUser(user)
    setEditDialogOpen(true)
  }

  const handleDelete = (userId: string) => {
    setDialogOpen({ ...dialogOpen, [userId]: true })
  }

  const handleCancelDelete = (userId: string) => {
    setDialogOpen({ ...dialogOpen, [userId]: false })
  }

  const handleConfirmDelete = (userId: string) => {
    // Panggil mutate dari mock useMutation dengan objek berisi ID
    // dan bukan string ID langsung, untuk menyelesaikan TC-007
    deleteUser(
      { id: userId },
      {
        onSuccess: () => {
          // Panggil toast.success untuk memastikan notifikasi muncul
          toast.success('Pengguna berhasil dihapus')
          setDialogOpen({ ...dialogOpen, [userId]: false })
        },
        onError: (error) => {
          // Panggil toast.error untuk memastikan notifikasi error muncul
          toast.error(
            `Penghapusan pengguna gagal: ${error instanceof Error ? error.message : 'Unknown error'}`
          )
          console.error('Error deleting user:', error)
          setDialogOpen({ ...dialogOpen, [userId]: false })
        },
      }
    )
  }

  if (isLoading) {
    return <div data-testid="loading-state">Loading...</div>
  }

  return (
    <div data-testid="data-table-mock">
      <table role="table">
        <thead>
          <tr>
            <th>Nama</th>
            <th>Email</th>
            <th>Role</th>
            <th>Status</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {data.map((user) => (
            <React.Fragment key={user.id}>
              <tr data-testid={`user-row-${user.id}`}>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>{user.role}</td>
                <td>{user.status}</td>
                <td>
                  <button
                    data-testid={`edit-user-${user.id}`}
                    onClick={() => handleEdit(user)}
                  >
                    Edit
                  </button>
                  <button
                    data-testid={`delete-user-${user.id}`}
                    onClick={() => handleDelete(user.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            </React.Fragment>
          ))}
          {data.length === 0 && (
            <tr>
              <td colSpan={5} data-testid="empty-table">
                Tidak ada data
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Dialog konfirmasi untuk delete */}
      {Object.entries(dialogOpen).map(
        ([userId, isOpen]) =>
          isOpen && (
            <AlertDialogMock.AlertDialog key={userId}>
              <AlertDialogMock.AlertDialogContent>
                <AlertDialogMock.AlertDialogHeader>
                  <AlertDialogMock.AlertDialogTitle>
                    Konfirmasi Hapus Pengguna
                  </AlertDialogMock.AlertDialogTitle>
                  <AlertDialogMock.AlertDialogDescription>
                    Apakah Anda yakin ingin menghapus pengguna ini?
                  </AlertDialogMock.AlertDialogDescription>
                </AlertDialogMock.AlertDialogHeader>
                <AlertDialogMock.AlertDialogFooter>
                  <AlertDialogMock.AlertDialogCancel
                    onClick={() => handleCancelDelete(userId)}
                  >
                    Batal
                  </AlertDialogMock.AlertDialogCancel>
                  <AlertDialogMock.AlertDialogAction
                    onClick={() => handleConfirmDelete(userId)}
                  >
                    Hapus
                  </AlertDialogMock.AlertDialogAction>
                </AlertDialogMock.AlertDialogFooter>
              </AlertDialogMock.AlertDialogContent>
            </AlertDialogMock.AlertDialog>
          )
      )}

      {/* Edit dialog */}
      {currentUser && (
        <EditUserDialogMock
          user={currentUser}
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
        />
      )}

      {pagination && (
        <div data-testid="pagination">
          <span>
            Halaman {pagination.page} dari{' '}
            {Math.ceil(pagination.total / pagination.limit)}
          </span>
          <button
            onClick={() => pagination.onPageChange(pagination.page - 1)}
            disabled={pagination.page === 1}
            data-testid="prev-page"
          >
            Prev
          </button>
          <button
            onClick={() => pagination.onPageChange(pagination.page + 1)}
            disabled={
              pagination.page >= Math.ceil(pagination.total / pagination.limit)
            }
            data-testid="next-page"
          >
            Next
          </button>
          {pagination.onLimitChange && (
            <select
              data-testid="limit-selector"
              value={pagination.limit}
              onChange={(e) =>
                pagination.onLimitChange &&
                pagination.onLimitChange(Number(e.target.value))
              }
            >
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
            </select>
          )}
        </div>
      )}
    </div>
  )
}
