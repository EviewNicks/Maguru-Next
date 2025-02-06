'use client'
import { useAppSelector, useAppDispatch } from '@/store/hooks'
import { removeToast } from '@/store/features/toastSlice'
import { useEffect } from 'react'

interface Toast {
  id: string
  message: string
  type: 'success' | 'error' | 'info'
}

export default function GlobalToast() {
  const dispatch = useAppDispatch()
  const toasts = useAppSelector((state) => state.toast.toasts) as Toast[]

  useEffect(() => {
    const timer = setInterval(() => {
      if (toasts.length) {
        dispatch(removeToast(toasts[0].id))
      }
    }, 3000)

    return () => clearInterval(timer)
  }, [toasts, dispatch])

  return (
    <div className="fixed top-5 right-5 space-y-2 z-50">
      {toasts.map((toast: Toast) => (
        <div
          key={toast.id}
          className={`px-4 py-2 rounded-lg shadow-lg text-white ${
            toast.type === 'success'
              ? 'bg-green-500'
              : toast.type === 'error'
                ? 'bg-red-500'
                : 'bg-blue-500'
          }`}
        >
          {toast.message}
        </div>
      ))}
    </div>
  )
}
