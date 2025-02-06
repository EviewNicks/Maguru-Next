// components/layouts/GlobalModal.tsx
'use client'
import { useAppSelector, useAppDispatch } from '@/store/hooks'
import { closeModal } from '@/store/features/modalSlice'
import { Button } from '@/components/ui/button'
import { addToast } from '@/store/features/toastSlice'
import { deleteUser } from '@/store/features/userSlice'

export default function GlobalModal() {
  const dispatch = useAppDispatch()
  const { isOpen, title, message, userId } = useAppSelector(
    (state) => state.modal
  )

  if (!isOpen) {
    console.log('Modal tidak muncul karena isOpen:', isOpen)
    return null
  }
  console.log('Modal muncul:', { isOpen, title, message, userId })

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-black p-6 rounded-lg shadow-lg max-w-sm w-full">
        <h2 className="text-lg font-semibold mb-2">{title}</h2>
        <p className="mb-4">{message}</p>
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={() => dispatch(closeModal())}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={() => {
              if (userId) {
                dispatch(deleteUser(userId))
                dispatch(
                  addToast({
                    message: `User berhasil dihapus`,
                    type: 'success',
                  })
                )
              }
              dispatch(closeModal())
            }}
          >
            Delete
          </Button>
        </div>
      </div>
    </div>
  )
}
