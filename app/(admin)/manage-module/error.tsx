'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { AlertCircle } from 'lucide-react'

/**
 * Komponen Error untuk halaman Manajemen Modul
 * Menampilkan pesan error dan tombol untuk reset saat terjadi error
 *
 * @param {Object} props - Component props
 * @param {Error} props.error - Error object
 * @param {() => void} props.reset - Function to reset error
 */
export default function ModuleManagementError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log error ke service monitoring
    console.error('Module Management Error:', error)
  }, [error])

  return (
    <div className="container mx-auto py-10 flex flex-col items-center justify-center gap-4">
      <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center">
        <AlertCircle className="w-8 h-8 text-destructive" />
      </div>

      <h2 className="text-2xl font-bold">Terjadi Kesalahan</h2>

      <p className="text-muted-foreground text-center max-w-lg">
        Maaf, terjadi kesalahan saat menampilkan halaman manajemen modul.
        Silakan coba lagi atau hubungi administrator jika masalah berlanjut.
      </p>

      <p className="text-sm text-destructive font-mono bg-destructive/10 p-2 rounded my-2">
        {error.message || 'Unknown error occurred'}
      </p>

      <Button onClick={reset} variant="default">
        Coba Lagi
      </Button>
    </div>
  )
}
