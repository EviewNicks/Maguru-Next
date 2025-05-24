'use client'

import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'
import { useModulePageCRUDContext } from '../context/ModulePageCRUDContext'

export default function ModulePageFooterNav() {
  // Gunakan context untuk mengakses state dan handlers
  const {
    pages,
    activePage,
    handleNavigateToPrevPage,
    handleNavigateToNextPage,
    isNavigating,
  } = useModulePageCRUDContext()

  // Hitung currentPage dan totalPages
  const currentPage = activePage
    ? pages.findIndex((p) => p.id === activePage.id) + 1
    : 0
  const totalPages = pages.length

  return (
    <div
      className="flex items-center justify-between py-4 px-6 border-t border-[#3b3b3b]"
      role="navigation"
      aria-label="Navigasi halaman modul"
    >
      <Button
        variant="outline"
        className="border-[#3b3b3b] bg-transparent hover:bg-[#242528]"
        onClick={handleNavigateToPrevPage}
        disabled={currentPage <= 1 || isNavigating}
        aria-label="Halaman sebelumnya"
      >
        {isNavigating ? (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        ) : (
          <ChevronLeft className="h-4 w-4 mr-2" />
        )}
        Halaman Sebelumnya
      </Button>

      <div className="text-sm text-[#a9abaf]" role="status">
        Halaman {currentPage} dari {totalPages}
      </div>

      <Button
        variant="outline"
        className="border-[#3b3b3b] bg-transparent hover:bg-[#242528]"
        onClick={handleNavigateToNextPage}
        disabled={currentPage >= totalPages || isNavigating}
        aria-label="Halaman berikutnya"
      >
        Halaman Berikutnya
        {isNavigating ? (
          <Loader2 className="h-4 w-4 ml-2 animate-spin" />
        ) : (
          <ChevronRight className="h-4 w-4 ml-2" />
        )}
      </Button>
    </div>
  )
}
