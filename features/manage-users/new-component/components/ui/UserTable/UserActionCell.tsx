'use client'

import { Button } from '@/components/ui/button'
import { useAppDispatch } from '@/store/hooks'
import { openModal } from '@/store/features/modalSlice'
import { deleteUser } from '@/store/features/userSlice'
import { User } from '@/types/user'
import { toast } from '@/hooks/use-toast'
import { Trash2 } from 'lucide-react'

interface UserActionCellProps {
  user: User
}

export function UserActionCellNew({ user }: UserActionCellProps) {
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
          } catch {
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
    <div className="flex justify-center">
      <Button
        variant="ghost"
        size="icon"
        onClick={handleDelete}
        className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-500/10"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  )
}
