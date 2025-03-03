// features/module/components/ModuleNavigation.tsx
import React from 'react'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, AlertCircle, Zap } from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Badge } from '@/components/ui/badge'
import ProgressIndicator from './ProgressIndicator'

interface ModuleNavigationProps {
  currentPage: number
  totalPages: number
  onPrevPage: () => void
  onNextPage: () => void
  isLastPage?: boolean
  isPageCompleted?: boolean
  quickViewMode?: boolean
  onToggleQuickViewMode?: () => void
  incompleteSections?: string[]
  visitedPages?: number[]
  pagesCompletionStatus?: Record<number, boolean>
}

const ModuleNavigation: React.FC<ModuleNavigationProps> = ({
  currentPage,
  totalPages,
  onPrevPage,
  onNextPage,
  isLastPage = currentPage === totalPages,
  isPageCompleted = true,
  quickViewMode = false,
  onToggleQuickViewMode,
  incompleteSections = [],
  visitedPages = [],
  pagesCompletionStatus = {},
}) => {
  // Menentukan apakah halaman saat ini selesai berdasarkan pagesCompletionStatus atau isPageCompleted
  const isCurrentPageCompleted = 
    Object.keys(pagesCompletionStatus).length > 0 
      ? pagesCompletionStatus[currentPage] ?? isPageCompleted
      : isPageCompleted

  // Menentukan apakah tombol Next harus dinonaktifkan
  const isNextDisabled = !quickViewMode && !isCurrentPageCompleted && currentPage < totalPages

  // Menampilkan pesan tooltip yang dinamis berdasarkan status halaman
  const getNextButtonTooltip = () => {
    if (isLastPage) return 'Selesaikan modul ini'
    if (isNextDisabled && incompleteSections.length > 0) {
      return `Selesaikan bagian berikut: ${incompleteSections.join(', ')}`
    }
    if (isNextDisabled) return 'Selesaikan halaman saat ini'
    return 'Lanjut ke halaman berikutnya'
  }

  return (
    <div className="flex flex-col w-full mt-8 gap-4">
            {/* Progress Indicator */}
            <div className="mb-4">
        <ProgressIndicator 
          currentPage={currentPage} 
          totalPages={totalPages} 
          hasVisitedPages={visitedPages}
        />
      </div>
      
      
      <div className="flex justify-between items-center w-full">
        <Button
          variant="outline"
          onClick={onPrevPage}
          disabled={currentPage <= 1}
          className="flex items-center gap-2"
        >
          <ChevronLeft className="h-4 w-4" />
          Sebelumnya
        </Button>

        <div className="flex items-center">
          {quickViewMode && (
            <Badge variant="outline" className="mr-4 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200">
              <Zap className="h-3 w-3 mr-1" />
              Mode Eksplorasi Cepat
            </Badge>
          )}
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={onNextPage}
                  disabled={currentPage >= totalPages || isNextDisabled}
                  className="flex items-center gap-2"
                >
                  {isLastPage ? 'Selesai' : 'Selanjutnya'}
                  {!isLastPage && <ChevronRight className="h-4 w-4" />}
                  {isNextDisabled && <AlertCircle className="h-4 w-4 ml-1 text-yellow-500" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{getNextButtonTooltip()}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {/* Quick View Mode Toggle */}
      {onToggleQuickViewMode && (
        <div className="flex justify-end">
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleQuickViewMode}
            className="text-xs flex items-center gap-1"
          >
            <Zap className="h-3 w-3" />
            {quickViewMode ? 'Nonaktifkan Mode Eksplorasi' : 'Aktifkan Mode Eksplorasi Cepat'}
          </Button>
          {quickViewMode && (
            <p className="text-xs text-muted-foreground ml-2">
              Progres tidak akan disimpan dalam mode ini
            </p>
          )}
        </div>
      )}
      
    </div>
  )
}

export default ModuleNavigation;
