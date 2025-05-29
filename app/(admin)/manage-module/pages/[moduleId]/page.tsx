'use client'

import { Suspense, useEffect } from 'react'
import { useParams, useSearchParams, useRouter } from 'next/navigation'
import ModulePageEditor from '@/features/manage-module/components/ModulePageEditor'
import { Skeleton } from '@/components/ui/skeleton'
import { ErrorBoundary } from '@/features/manage-module/components/ErrorBoundary'
import { AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useQuery } from '@tanstack/react-query'
import { useModulePageCRUDContext } from '@/features/manage-module/context/ModulePageCRUDContext'

export default function ModulePageEditorPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()

  // Mendapatkan moduleId dari URL parameters
  const moduleId = params.moduleId as string

  // Mendapatkan pageId dari query parameters (jika ada)
  const pageId = searchParams.get('pageId') || undefined

  // Gunakan context untuk mendapatkan data dan fungsi
  const { pages, getPageById } = useModulePageCRUDContext()

  // Fetch data halaman aktif menggunakan context
  const { isLoading: activePageLoading } = useQuery({
    queryKey: ['modulePage', moduleId, pageId],
    queryFn: async () => {
      if (!pageId) return { data: null, success: true }
      return getPageById(pageId)
    },
    enabled: !!pageId, // Hanya jalankan query jika pageId ada
    staleTime: 15 * 60 * 1000, // 15 menit (ditingkatkan dari 5 menit)
    gcTime: 30 * 60 * 1000, // 30 menit cache retention
    refetchOnMount: false, // Jangan refetch saat komponen di-mount
    refetchOnWindowFocus: false, // Jangan refetch saat window mendapat fokus
    retry: (failureCount, error) => {
      // Hanya retry maksimal 2 kali
      if (failureCount >= 2) return false
      // Jangan retry untuk error 404
      if (error instanceof Error && error.message.includes('404')) return false
      return true
    },
  })

  // Jika tidak ada pageId di URL tapi ada halaman, redirect ke halaman pertama
  useEffect(() => {
    if (!pageId && pages.length > 0) {
      const firstPageId = pages[0].id
      router.push(`/manage-module/pages/${moduleId}?pageId=${firstPageId}`)
    }
  }, [moduleId, pageId, pages, router])

  // Custom fallback untuk error boundary dalam konteks editor
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

  // Gabungkan status loading
  const isLoading = pageId && activePageLoading

  return (
    <ErrorBoundary fallback={editorErrorFallback}>
      <Suspense fallback={<ModulePageEditorSkeleton />}>
        <ModulePageEditor isLoading={isLoading || false} />
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
