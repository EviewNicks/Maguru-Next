'use client'

import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'

interface ModulePageFooterNavProps {
  currentPage: number
  totalPages: number
  onPrevious: () => void
  onNext: () => void
  isLoading?: boolean
}

export default function ModulePageFooterNav({
  currentPage,
  totalPages,
  onPrevious,
  onNext,
  isLoading = false,
}: ModulePageFooterNavProps) {
  return (
    <div
      className="flex items-center justify-between py-4 px-6 border-t border-[#3b3b3b]"
      role="navigation"
      aria-label="Navigasi halaman modul"
    >
      <Button
        variant="outline"
        className="border-[#3b3b3b] bg-transparent hover:bg-[#242528]"
        onClick={onPrevious}
        disabled={currentPage <= 1 || isLoading}
        aria-label="Halaman sebelumnya"
      >
        {isLoading ? (
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
        onClick={onNext}
        disabled={currentPage >= totalPages || isLoading}
        aria-label="Halaman berikutnya"
      >
        Halaman Berikutnya
        {isLoading ? (
          <Loader2 className="h-4 w-4 ml-2 animate-spin" />
        ) : (
          <ChevronRight className="h-4 w-4 ml-2" />
        )}
      </Button>
    </div>
  )
}
