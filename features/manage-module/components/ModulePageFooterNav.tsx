'use client'

import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface ModulePageFooterNavProps {
  currentPage: number
  totalPages: number
  onPrevious: () => void
  onNext: () => void
}

export default function ModulePageFooterNav({
  currentPage,
  totalPages,
  onPrevious,
  onNext,
}: ModulePageFooterNavProps) {
  return (
    <div className="flex items-center justify-between py-4 px-6 border-t border-[#3b3b3b]">
      <Button
        variant="outline"
        className="border-[#3b3b3b] bg-transparent hover:bg-[#242528]"
        onClick={onPrevious}
        disabled={currentPage <= 1}
      >
        <ChevronLeft className="h-4 w-4 mr-2" />
        Halaman Sebelumnya
      </Button>

      <div className="text-sm text-[#a9abaf]">
        Halaman {currentPage} dari {totalPages}
      </div>

      <Button
        variant="outline"
        className="border-[#3b3b3b] bg-transparent hover:bg-[#242528]"
        onClick={onNext}
        disabled={currentPage >= totalPages}
      >
        Halaman Berikutnya
        <ChevronRight className="h-4 w-4 ml-2" />
      </Button>
    </div>
  )
}
