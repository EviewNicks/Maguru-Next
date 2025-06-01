'use client'

import React from 'react'
import { format, formatDistanceToNow } from 'date-fns'
import { id } from 'date-fns/locale'
import {
  Loader2,
  CheckCircle2,
  AlertCircle,
  WifiOff,
  RefreshCw,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { type DraftSaveStatus } from '../../types'

interface DraftStatusIndicatorProps {
  status: DraftSaveStatus
  lastSavedAt?: Date | null
  onRetry?: () => void
  className?: string
}

/**
 * Komponen untuk menampilkan status penyimpanan draft
 * dengan indikator visual dan teks yang sesuai
 */
export function DraftStatusIndicator({
  status,
  lastSavedAt,
  onRetry,
  className,
}: DraftStatusIndicatorProps) {
  // Mendapatkan formatLastSaved yang informatif
  const formatLastSaved = React.useMemo(() => {
    if (!lastSavedAt) return ''

    // Format "10 menit yang lalu"
    const timeAgo = formatDistanceToNow(lastSavedAt, {
      addSuffix: true,
      locale: id,
    })

    // Format jam lengkap untuk tooltip/title
    const fullTime = format(lastSavedAt, 'dd MMM yyyy, HH:mm:ss', {
      locale: id,
    })

    return { timeAgo, fullTime }
  }, [lastSavedAt])

  // Render indikator berdasarkan status
  return (
    <div
      className={cn(
        'flex items-center gap-1.5 text-sm whitespace-nowrap',
        className
      )}
    >
      {status === 'saving' && (
        <>
          <Loader2 className="h-3.5 w-3.5 animate-spin text-amber-500" />
          <span className="text-amber-500">Menyimpan...</span>
        </>
      )}

      {status === 'saved' && (
        <>
          <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
          <span className="text-green-500">
            Tersimpan{' '}
            {lastSavedAt && (
              <time
                dateTime={lastSavedAt.toISOString()}
                title={formatLastSaved.fullTime}
              >
                {formatLastSaved.timeAgo}
              </time>
            )}
          </span>
        </>
      )}

      {status === 'error' && (
        <>
          <AlertCircle className="h-3.5 w-3.5 text-red-500" />
          <span className="text-red-500">
            Gagal menyimpan
            {onRetry && (
              <button
                onClick={onRetry}
                className="ml-1.5 underline hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1 rounded"
                aria-label="Coba simpan ulang"
              >
                Coba lagi
              </button>
            )}
          </span>
        </>
      )}

      {status === 'unsaved' && (
        <>
          <AlertCircle className="h-3.5 w-3.5 text-amber-500" />
          <span className="text-amber-500">Belum tersimpan</span>
        </>
      )}

      {status === 'offline' && (
        <>
          <WifiOff className="h-3.5 w-3.5 text-gray-500" />
          <span className="text-gray-500">
            Anda offline, perubahan tidak akan disimpan
          </span>
        </>
      )}

      {status === 'retrying' && (
        <>
          <RefreshCw className="h-3.5 w-3.5 animate-spin text-amber-500" />
          <span className="text-amber-500">Mencoba ulang penyimpanan...</span>
        </>
      )}

      {status === 'idle' && lastSavedAt && (
        <>
          <CheckCircle2 className="h-3.5 w-3.5 text-gray-400" />
          <span className="text-gray-500">
            Terakhir disimpan{' '}
            <time
              dateTime={lastSavedAt.toISOString()}
              title={formatLastSaved.fullTime}
            >
              {formatLastSaved.timeAgo}
            </time>
          </span>
        </>
      )}
    </div>
  )
}

/**
 * Komponen floating untuk menampilkan status penyimpanan draft
 * yang muncul di pojok kanan bawah editor
 */
export function FloatingDraftStatus({
  status,
  lastSavedAt,
  onRetry,
}: Omit<DraftStatusIndicatorProps, 'className'>) {
  // Status yang perlu ditampilkan di floating indicator
  // Idle tidak ditampilkan di floating indicator
  const shouldDisplay = status !== 'idle'

  return shouldDisplay ? (
    <div className="absolute bottom-3 right-3 z-10">
      <div className="rounded-full bg-white/95 shadow-md border px-3 py-1.5 dark:bg-gray-800/95 dark:border-gray-700">
        <DraftStatusIndicator
          status={status}
          lastSavedAt={lastSavedAt}
          onRetry={onRetry}
        />
      </div>
    </div>
  ) : null
}
