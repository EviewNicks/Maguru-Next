'use client'

import { Button } from '@/components/ui/button'
import { useAppDispatch } from '@/store/hooks'
import { openModal } from '@/store/features/modalSlice'

import { User } from '@/types/user'

interface UserActionCellProps {
  user: User
}

export default function UserActionCell({ user }: UserActionCellProps) {
  const dispatch = useAppDispatch()

  const handleDelete = () => {
    dispatch(
      openModal({
        title: 'Konfirmasi Hapus',
        message: `Apakah Anda yakin ingin menghapus ${user.name}?`,
        userId: user.id, // Simpan ID user, bukan function
      })
    )
  }

  return (
    <div className="text-center space-x-2">
      <Button variant="destructive" size="sm" onClick={handleDelete}>
        Delete
      </Button>
    </div>
  )
}
