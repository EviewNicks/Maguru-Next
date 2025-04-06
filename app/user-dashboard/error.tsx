'use client'
import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { AlertCircle } from 'lucide-react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log error ke layanan monitoring/analytics
    console.error(error)
  }, [error])

  return (
    <div className="container mx-auto px-4 py-12 flex flex-col items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center text-center max-w-md">
        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-red-100 dark:bg-red-900 mb-4">
          <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-300" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Terjadi Kesalahan</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Maaf, terjadi kesalahan saat memuat dashboard Anda. Silakan coba lagi
          dalam beberapa saat.
        </p>
        <Button
          onClick={reset}
          variant="default"
          className="bg-blue-600 hover:bg-blue-700"
        >
          Coba Lagi
        </Button>
      </div>
    </div>
  )
}
