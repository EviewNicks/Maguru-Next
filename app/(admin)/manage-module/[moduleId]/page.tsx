'use client'

import { Suspense, useEffect, useState } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { Skeleton } from '@/components/ui/skeleton'
import { ErrorBoundary } from '@/features/manage-module/components/ErrorBoundary'
import { AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ModulePageView } from '@/features/manage-module/components/ModulePageView'
import { ModulePageEdit } from '@/features/manage-module/components/ModulePageEdit'

export default function ModulePageEditorPage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()

  // Mendapatkan moduleId dari URL parameters
  const moduleId = params.moduleId as string

  // Mendapatkan pageId dan mode dari search params
  const pageId = searchParams.get('pageId')
  const mode = searchParams.get('mode') || 'view' // Default ke mode view

  // State untuk mencegah hydration mismatch
  const [mounted, setMounted] = useState(false)

  // Set mounted state setelah hydration
  useEffect(() => {
    setMounted(true)
  }, [])

  // Jika belum mounted, tampilkan skeleton
  if (!mounted) {
    return <ModulePageEditorSkeleton />
  }

  // Jika tidak ada pageId, redirect ke halaman modul
  if (!pageId) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Pilih halaman</h2>
          <p className="text-gray-500">
            Pilih halaman dari sidebar untuk melihat atau mengedit konten.
          </p>
        </div>
      </div>
    )
  }

  // Custom fallback untuk error boundary
  const editorErrorFallback = (
    <div className="flex flex-col items-center justify-center h-screen bg-[#121212] text-white p-6">
      <AlertTriangle className="h-16 w-16 text-amber-500 mb-6" />
      <h2 className="text-2xl font-bold mb-3">
        Terjadi kesalahan saat memuat editor
      </h2>
      <p className="text-gray-400 mb-8 max-w-md text-center">
        Sistem tidak dapat memuat editor halaman modul. Ini mungkin disebabkan
        oleh masalah jaringan atau data yang rusak.
      </p>
      <div className="flex gap-4">
        <Button
          variant="outline"
          onClick={() => window.location.reload()}
          data-testid="reload-editor-btn"
        >
          Muat Ulang Editor
        </Button>
        <Button
          onClick={() => router.push('/manage-module')}
          data-testid="back-modules-btn"
        >
          Kembali ke Daftar Modul
        </Button>
      </div>
    </div>
  )

  return (
    <ErrorBoundary fallback={editorErrorFallback}>
      <Suspense fallback={<ModulePageEditorSkeleton />}>
        {/* Render komponen berdasarkan mode */}
        {mode === 'edit' ? (
          <ModulePageEdit moduleId={moduleId} pageId={pageId} />
        ) : (
          <ModulePageView moduleId={moduleId} pageId={pageId} />
        )}
      </Suspense>
    </ErrorBoundary>
  )
}

// Skeleton loader untuk ModulePageEditor
function ModulePageEditorSkeleton() {
  return (
    <div className="flex flex-col h-screen bg-[#121212]">
      {/* Header Skeletons */}
      <div className="h-14 border-b border-[#3b3b3b] px-4">
        <Skeleton className="h-8 w-full mt-3 bg-[#1f1f21]" />
      </div>
      <div className="h-12 border-b border-[#3b3b3b] px-4">
        <Skeleton className="h-6 w-full mt-3 bg-[#1f1f21]" />
      </div>
      <div className="h-10 border-b border-[#3b3b3b] px-4">
        <Skeleton className="h-6 w-full mt-2 bg-[#1f1f21]" />
      </div>

      {/* Content Skeleton */}
      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 p-6">
          <Skeleton className="h-10 w-3/4 mb-6 bg-[#1f1f21]" />
          <Skeleton className="h-24 w-full mb-4 bg-[#1f1f21]" />
          <Skeleton className="h-24 w-full mb-4 bg-[#1f1f21]" />
          <Skeleton className="h-24 w-full bg-[#1f1f21]" />
        </div>
      </div>

      {/* Footer Navigation Skeleton */}
      <div className="h-14 border-t border-[#3b3b3b] px-6 py-4 flex justify-between">
        <Skeleton className="h-6 w-32 bg-[#1f1f21]" />
        <Skeleton className="h-6 w-20 bg-[#1f1f21]" />
        <Skeleton className="h-6 w-32 bg-[#1f1f21]" />
      </div>
    </div>
  )
}
