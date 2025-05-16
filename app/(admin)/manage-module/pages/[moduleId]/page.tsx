'use client'

import { Suspense, useEffect } from 'react'
import { useParams, useSearchParams, useRouter } from 'next/navigation'
import ModulePageEditor from '@/features/manage-module/components/ModulePageEditor'
import { Skeleton } from '@/components/ui/skeleton'
import { useModulePageQuery } from '@/features/manage-module/hooks/useModulePageQuery'

export default function ModulePageEditorPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()

  // Mendapatkan moduleId dari URL parameters
  const moduleId = params.moduleId as string

  // Mendapatkan pageId dari query parameters (jika ada)
  const pageId = searchParams.get('pageId') || undefined

  // Gunakan hook untuk mendapatkan data halaman
  const { getAllPages } = useModulePageQuery(moduleId)
  const { data: pagesData, isLoading } = getAllPages

  // Jika tidak ada pageId di URL tapi ada halaman, redirect ke halaman pertama
  useEffect(() => {
    if (!isLoading && !pageId && pagesData?.data && pagesData.data.length > 0) {
      const firstPageId = pagesData.data[0].id
      router.push(`/manage-module/pages/${moduleId}?pageId=${firstPageId}`)
    }
  }, [isLoading, moduleId, pageId, pagesData, router])

  // Handler untuk navigasi halaman yang akan digunakan oleh ModulePageFooterNav
  const handlePageChange = (newPageId: string) => {
    router.push(`/manage-module/pages/${moduleId}?pageId=${newPageId}`)
  }

  return (
    <Suspense fallback={<ModulePageEditorSkeleton />}>
      <ModulePageEditor
        moduleId={moduleId}
        initialPageId={pageId}
        onPageChange={handlePageChange}
      />
    </Suspense>
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
