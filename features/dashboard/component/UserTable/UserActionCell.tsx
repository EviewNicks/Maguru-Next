'use client'

import { Button } from '@/components/ui/button'
import { useAppDispatch } from '@/store/hooks'
import { openModal } from '@/store/features/modalSlice'
import { deleteUser } from '@/store/features/userSlice'
import { User } from '@/types/user'
import { toast } from '@/hooks/use-toast'

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
        onConfirm: async () => {
          try {
            await dispatch(deleteUser(user.id)).unwrap()
            toast({
              title: 'Success',
              description: 'User deleted successfully',
            })
          } catch (error) {
            toast({
              title: 'Error',
              description: 'Failed to delete user',
              variant: 'destructive',
            })
          }
        },
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
