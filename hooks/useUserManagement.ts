import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { UpdateUserPayload } from '@/types/user'
import { updateUser, deleteUser } from '@/store/features/userSlice'
import { AppDispatch, RootState } from '@/store/store'
import { toast } from '@/hooks/use-toast'

interface ErrorResponse {
  error: { message: string; code?: string }
}

export const useUserManagement = () => {
  const dispatch = useDispatch<AppDispatch>()
  const [isUpdating, setIsUpdating] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)

  const { loading: globalLoading, error: globalError } = useSelector(
    (state: RootState) => state.users
  )

  const isErrorResponse = (response: unknown): response is ErrorResponse => {
    return (
      response !== null &&
      typeof response === 'object' &&
      'error' in response &&
      response.error !== null &&
      typeof (response as ErrorResponse).error === 'object' &&
      'message' in (response as ErrorResponse).error &&
      typeof (response as ErrorResponse).error.message === 'string'
    )
  }

  const handleUpdateUser = async (
    payload: UpdateUserPayload
  ): Promise<boolean> => {
    try {
      setIsUpdating(payload.id)
      const response = await dispatch(updateUser(payload)).unwrap()

      if (isErrorResponse(response)) {
        toast({
          title: 'Error',
          description: response.error.message,
          variant: 'destructive',
        })
        return false
      }

      toast({ title: 'Success', description: 'User updated successfully' })
      return true
    } catch (error) {
      toast({
        title: 'Error',
        description:
          error instanceof Error ? error.message : 'Failed to update user',
        variant: 'destructive',
      })
      return false
    } finally {
      setIsUpdating(null)
    }
  }

  const handleDeleteUser = async (userId: string): Promise<boolean> => {
    try {
      setIsDeleting(userId)
      const response = await dispatch(deleteUser(userId)).unwrap()

      if (isErrorResponse(response)) {
        toast({
          title: 'Error',
          description: response.error.message,
          variant: 'destructive',
        })
        return false
      }

      toast({ title: 'Success', description: 'User deleted successfully' })
      return true
    } catch (error) {
      toast({
        title: 'Error',
        description:
          error instanceof Error ? error.message : 'Failed to delete user',
        variant: 'destructive',
      })
      return false
    } finally {
      setIsDeleting(null)
    }
  }

  return {
    handleUpdateUser,
    handleDeleteUser,
    isUpdating,
    isDeleting,
    globalLoading,
    globalError,
  }
}
