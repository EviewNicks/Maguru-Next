'use client'

import { Suspense, useEffect, useCallback } from 'react'
import { useParams, useSearchParams, useRouter } from 'next/navigation'
import ModulePageEditor from '@/features/manage-module/components/ModulePageEditor'
import { Skeleton } from '@/components/ui/skeleton'
import { useModulePageQuery } from '@/features/manage-module/hooks/useModulePageQuery'
import { ErrorBoundary } from '@/features/manage-module/components/ErrorBoundary'
import { AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useQuery } from '@tanstack/react-query'
import { modulePageService } from '@/features/manage-module/services/modulePageService'
import {
  ModulePage,
  CreateModulePageInput,
  ContentBlockType,
} from '@/features/manage-module/types/modulePageSchema'
import { toast } from 'sonner'
import { useModulePageCRUDContext } from '@/features/manage-module/context/ModulePageCRUDContext'

export default function ModulePageEditorPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()
  const {
    createPage,
    setActivePage,
    pages: allPages,
  } = useModulePageCRUDContext()

  // Mendapatkan moduleId dari URL parameters
  const moduleId = params.moduleId as string

  // Mendapatkan pageId dari query parameters (jika ada)
  const pageId = searchParams.get('pageId') || undefined

  // Gunakan hook untuk mendapatkan daftar semua halaman
  const { getAllPages } = useModulePageQuery(moduleId)
  const { data: pagesData, isLoading: pagesLoading } = getAllPages

  // Fetch data halaman aktif
  const { data: activePageData, isLoading: activePageLoading } = useQuery({
    queryKey: ['modulePage', moduleId, pageId],
    queryFn: async () => {
      if (!pageId) return { data: null, success: true }
      return modulePageService.getModulePage(pageId)
    },
    enabled: !!pageId, // Hanya jalankan query jika pageId ada
    staleTime: 5 * 60 * 1000, // 5 menit
    refetchOnWindowFocus: false, // Jangan refetch saat window mendapat fokus
  })

  // Jika tidak ada pageId di URL tapi ada halaman, redirect ke halaman pertama
  useEffect(() => {
    if (
      !pagesLoading &&
      !pageId &&
      pagesData?.data &&
      pagesData.data.length > 0
    ) {
      const firstPageId = pagesData.data[0].id
      router.push(`/manage-module/pages/${moduleId}?pageId=${firstPageId}`)
    }
  }, [pagesLoading, moduleId, pageId, pagesData, router])

  // Handler untuk navigasi halaman yang akan digunakan oleh ModulePageFooterNav
  const handlePageChange = useCallback(
    (newPageId: string) => {
      // Tandai bahwa ini adalah navigasi halaman
      window.sessionStorage.setItem('isNavigating', 'true')

      // Navigasi ke halaman baru
      router.push(`/manage-module/pages/${moduleId}?pageId=${newPageId}`)

      // Hapus flag navigasi setelah navigasi selesai
      setTimeout(() => {
        window.sessionStorage.removeItem('isNavigating')
      }, 500)
    },
    [moduleId, router]
  )

  // Handler untuk memilih halaman dari sidebar
  const handleSelectPage = useCallback(
    (page: ModulePage) => {
      // Log page selection untuk debugging
      console.log(`[Page] Selected page: ${page.id} - ${page.title}`)

      // Tandai bahwa ini adalah navigasi halaman, bukan perubahan konten
      window.sessionStorage.setItem('isNavigating', 'true')

      // Navigasi ke halaman yang dipilih
      handlePageChange(page.id)
    },
    [handlePageChange]
  )

  // Handler untuk membuat halaman baru
  const handleCreatePage = useCallback(async () => {
    if (!moduleId) {
      toast.error('ID Modul tidak ditemukan')
      return
    }

    try {
      // Generate default page number
      const pageNumber = allPages.length + 1

      // Generate default title
      const defaultTitle = `Halaman Baru ${pageNumber}`

      // Determine order for the new page (at the end)
      const pages = pagesData?.data || []
      const newOrder =
        pages.length > 0
          ? Math.max(...pages.map((page) => page.order || 0)) + 1
          : 1

      // Prepare new page data
      const newPageData: CreateModulePageInput = {
        title: defaultTitle,
        moduleId,
        type: 'content',
        order: newOrder,
        blocks: [
          {
            type: ContentBlockType.TEXT,
            content:
              '<p>Halaman baru Anda telah dibuat. Mulai edit konten disini.</p>',
          },
        ],
      }

      // Create new page with API
      const result = await createPage(newPageData)

      if (result?.data) {
        // Set the new page as active
        setActivePage(result.data)

        // Tandai bahwa ini adalah navigasi halaman
        window.sessionStorage.setItem('isNavigating', 'true')

        // Navigate to the new page after a small delay for better UX
        setTimeout(() => {
          router.push(
            `/manage-module/pages/${moduleId}?pageId=${result.data.id}`
          )
        }, 300)

        toast.success('Halaman baru berhasil dibuat')
      }
    } catch (error) {
      console.error('Error creating page:', error)

      // Detail error handling
      let errorMessage = 'Gagal membuat halaman. Silakan coba lagi.'

      if (error instanceof Error) {
        if (error.message.includes('ModuleId tidak ditemukan')) {
          errorMessage =
            'ID Modul tidak ditemukan. Silakan refresh halaman dan coba lagi.'
        } else if (error.message.includes('TypeError')) {
          errorMessage =
            'Terjadi kesalahan teknis. Halaman mungkin perlu di-refresh.'
        } else if (error.message.includes('constraint failed')) {
          errorMessage =
            'Terjadi konflik data. Sistem akan mencoba lagi secara otomatis.'

          // Jika error adalah constraint, coba lagi dengan order yang berbeda
          setTimeout(() => {
            handleCreatePage()
          }, 500)
          return
        } else {
          // Gunakan pesan error asli jika tersedia
          errorMessage = error.message || errorMessage
        }
      }

      toast.error(errorMessage, {
        action: {
          label: 'Coba Lagi',
          onClick: () => handleCreatePage(),
        },
        position: 'top-center',
        duration: 5000,
      })
    }
  }, [moduleId, allPages, pagesData, createPage, setActivePage, router])

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
  const isLoading = pagesLoading || (pageId && activePageLoading)

  return (
    <ErrorBoundary fallback={editorErrorFallback}>
      <Suspense fallback={<ModulePageEditorSkeleton />}>
        <ModulePageEditor
          moduleId={moduleId}
          initialPageId={pageId}
          pageData={activePageData?.data || null}
          pages={pagesData?.data || []}
          isLoading={isLoading || false}
          onPageChange={handlePageChange}
          onSelectPage={handleSelectPage}
          onCreatePage={handleCreatePage}
        />
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
