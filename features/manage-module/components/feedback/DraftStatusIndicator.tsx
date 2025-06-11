'use client'

import { useState, useEffect } from 'react'
import { Loader2, CheckCircle, AlertCircle, Save } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { id } from 'date-fns/locale'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { DraftSaveStatus } from '../../types'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

interface DraftStatusIndicatorProps {
  status: DraftSaveStatus
  lastSavedAt: Date | null
  onRetry?: () => void
  className?: string
}

/**
 * Komponen untuk menampilkan status penyimpanan draft
 * Menampilkan status (saved, saving, error) dan waktu penyimpanan terakhir
 */
export function DraftStatusIndicator({
  status,
  lastSavedAt,
  onRetry,
  className,
}: DraftStatusIndicatorProps) {
  const [formattedTime, setFormattedTime] = useState<string>('')

  // Update formatted time setiap menit
  useEffect(() => {
    if (!lastSavedAt) return

    const updateFormattedTime = () => {
      setFormattedTime(
        formatDistanceToNow(lastSavedAt, {
          addSuffix: true,
          locale: id,
        })
      )
    }

    // Update awal
    updateFormattedTime()

    // Update setiap menit
    const interval = setInterval(updateFormattedTime, 60000)

    return () => clearInterval(interval)
  }, [lastSavedAt])

  // Render status icon dan text berdasarkan status
  const renderStatusContent = () => {
    switch (status) {
      case 'saving':
        return (
          <div className="flex items-center text-gray-500">
            <Loader2 className="h-3 w-3 animate-spin mr-2" />
            <span>Menyimpan...</span>
          </div>
        )
      case 'saved':
        return lastSavedAt ? (
          <div className="flex items-center text-green-600">
            <CheckCircle className="h-3 w-3 mr-2" />
            <span>Disimpan {formattedTime}</span>
          </div>
        ) : null
      case 'error':
        return (
          <div className="flex items-center text-red-500">
            <AlertCircle className="h-3 w-3 mr-2" />
            <span>Gagal menyimpan</span>
            {onRetry && (
              <Button
                variant="ghost"
                size="sm"
                className="ml-2 h-6 px-2"
                onClick={onRetry}
              >
                Coba lagi
              </Button>
            )}
          </div>
        )
      case 'offline':
        return (
          <div className="flex items-center text-amber-500">
            <AlertCircle className="h-3 w-3 mr-2" />
            <span>Offline - perubahan akan disimpan saat online</span>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div
      className={cn(
        'px-3 py-1.5 text-xs flex items-center justify-between',
        className
      )}
    >
      <div className="flex-1">{renderStatusContent()}</div>

      {onRetry && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={onRetry}
              >
                <Save className="h-3.5 w-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Simpan sekarang</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  )
}

/**
 * Versi floating dari DraftStatusIndicator
 * Ditampilkan di pojok kanan bawah editor
 */
export function FloatingDraftStatus(props: DraftStatusIndicatorProps) {
  return (
    <div className="absolute bottom-2 right-2 bg-white border border-gray-200 rounded-md shadow-md">
      <DraftStatusIndicator {...props} />
    </div>
  )
}
