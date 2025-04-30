import React, { useState } from 'react'
import { User } from '@/types/user'
import { DialogMock } from './dialog-mock'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'

interface EditUserDialogProps {
  user: User
  open: boolean
  onOpenChange: (open: boolean) => void
}

export const EditUserDialogMock: React.FC<EditUserDialogProps> = ({
  user,
  open,
  onOpenChange,
}) => {
  const [formValues, setFormValues] = useState({
    role: user.role,
    status: user.status,
  })

  // Gunakan mock dari integration test
  const { mutate } = useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      return { success: true, message: 'Success' }
    },
  })

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormValues((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = () => {
    // Simulasikan validasi
    if (!formValues.role || !formValues.status) {
      return // Tidak melakukan apa-apa jika tidak valid
    }

    // Panggil mutate dari mock useMutation
    mutate(
      {
        id: user.id,
        ...formValues,
      },
      {
        onSuccess: () => {
          // Panggil toast.success secara eksplisit untuk memastikan test berjalan
          toast.success('Pengguna berhasil diupdate')
          onOpenChange(false)
        },
        onError: (error) => {
          // Panggil toast.error secara eksplisit untuk test kasus error
          toast.error(
            `Update pengguna gagal: ${error instanceof Error ? error.message : 'Unknown error'}`
          )
          console.error('Error updating user:', error)
        },
      }
    )
  }

  if (!open) return null

  return (
    <DialogMock.Dialog>
      <DialogMock.DialogContent>
        <DialogMock.DialogHeader>
          <DialogMock.DialogTitle>Edit Pengguna</DialogMock.DialogTitle>
          <DialogMock.DialogDescription>
            Edit informasi pengguna {user.name}
          </DialogMock.DialogDescription>
        </DialogMock.DialogHeader>
        <div className="py-4">
          <div className="space-y-4">
            <div>
              <label htmlFor="role-select">Role</label>
              <select
                id="role-select"
                name="role"
                value={formValues.role}
                onChange={handleChange}
                aria-label="role"
                data-testid="role-select"
                className="block w-full mt-1"
              >
                <option value="">Pilih Role</option>
                <option value="admin">Admin</option>
                <option value="dosen">Dosen</option>
                <option value="mahasiswa">Mahasiswa</option>
              </select>
            </div>
            <div>
              <label htmlFor="status-select">Status</label>
              <select
                id="status-select"
                name="status"
                value={formValues.status}
                onChange={handleChange}
                aria-label="status"
                data-testid="status-select"
                className="block w-full mt-1"
              >
                <option value="">Pilih Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="pending">Pending</option>
              </select>
            </div>
          </div>
        </div>
        <DialogMock.DialogFooter>
          <button
            onClick={() => onOpenChange(false)}
            data-testid="cancel-button"
          >
            Cancel
          </button>
          <button data-testid="save-button" onClick={handleSubmit}>
            Simpan
          </button>
        </DialogMock.DialogFooter>
      </DialogMock.DialogContent>
    </DialogMock.Dialog>
  )
}
