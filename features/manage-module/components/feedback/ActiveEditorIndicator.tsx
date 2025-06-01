'use client'

import React from 'react'
import { Users } from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { type ActiveEditor } from '../../lib/draft/ConcurrentEditingService'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

interface ActiveEditorIndicatorProps {
  editors: ActiveEditor[]
  currentUserId: string
  maxShown?: number
  className?: string
}

/**
 * Mendapatkan inisial dari nama untuk avatar
 * @param name - Nama lengkap
 * @returns Inisial (1-2 huruf)
 */
function getInitials(name: string): string {
  if (!name) return '?'

  const parts = name.split(/\s+/)
  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase()
  }

  return (
    parts[0].charAt(0).toUpperCase() +
    parts[parts.length - 1].charAt(0).toUpperCase()
  )
}

/**
 * Menghasilkan warna konsisten berdasarkan userId
 * @param userId - ID pengguna
 * @returns String warna HEX
 */
function getUserColor(userId: string): string {
  // Array warna untuk avatar
  const colors = [
    'bg-red-500',
    'bg-blue-500',
    'bg-green-500',
    'bg-yellow-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-indigo-500',
    'bg-orange-500',
    'bg-teal-500',
    'bg-cyan-500',
  ]

  // Gunakan hash sederhana dari userId untuk memilih warna
  let hash = 0
  for (let i = 0; i < userId.length; i++) {
    hash = (hash << 5) - hash + userId.charCodeAt(i)
    hash = hash & hash // Convert to 32bit integer
  }

  // Pastikan hash positif dan dalam rentang array colors
  hash = Math.abs(hash) % colors.length

  return colors[hash]
}

/**
 * Komponen untuk menampilkan indikator pengguna yang sedang aktif mengedit
 */
export function ActiveEditorIndicator({
  editors,
  currentUserId,
  maxShown = 3,
  className,
}: ActiveEditorIndicatorProps) {
  // Filter pengguna saat ini dari daftar
  const otherEditors = editors.filter(
    (editor) => editor.userId !== currentUserId
  )

  // Jika tidak ada pengguna lain, jangan tampilkan apa-apa
  if (otherEditors.length === 0) {
    return null
  }

  // Batasi jumlah pengguna yang ditampilkan
  const displayedEditors = otherEditors.slice(0, maxShown)
  const extraCount = otherEditors.length - maxShown

  return (
    <div
      className={`flex items-center gap-1 text-sm text-gray-600 dark:text-gray-300 ${
        className || ''
      }`}
    >
      <div className="flex -space-x-2">
        {displayedEditors.map((editor) => (
          <TooltipProvider key={editor.userId}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Avatar className="h-7 w-7 border-2 border-background">
                  <AvatarFallback className={getUserColor(editor.userId)}>
                    {getInitials(editor.userName)}
                  </AvatarFallback>
                </Avatar>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>{editor.userName} sedang mengedit</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ))}

        {extraCount > 0 && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Avatar className="h-7 w-7 border-2 border-background">
                  <AvatarFallback className="bg-gray-500">
                    +{extraCount}
                  </AvatarFallback>
                </Avatar>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>
                  {extraCount} pengguna lainnya {extraCount === 1 ? '' : ''}
                  sedang mengedit
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>

      <span className="ml-1 text-xs flex items-center">
        <Users className="h-3.5 w-3.5 mr-1" />
        {otherEditors.length} pengguna {otherEditors.length === 1 ? '' : 'lain'}{' '}
        sedang mengedit
      </span>
    </div>
  )
}

/**
 * Komponen untuk menampilkan dialog konflik saat ada konflik versi
 */
export function ConflictDialog({
  isOpen,
  onClose,
  onUseRemote,
  onUseLocal,
  editorName,
}: {
  isOpen: boolean
  onClose: () => void
  onUseRemote: () => void
  onUseLocal: () => void
  editorName?: string
}) {
  return (
    <div
      className={`fixed inset-0 z-50 bg-black/50 flex items-center justify-center ${
        isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
      } transition-opacity`}
    >
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-md w-full">
        <h3 className="text-lg font-semibold mb-2">Konflik Versi Terdeteksi</h3>
        <p className="mb-4">
          {editorName
            ? `${editorName} telah memperbarui halaman ini sementara Anda mengedit.`
            : 'Halaman ini telah diperbarui sementara Anda mengedit.'}
        </p>
        <p className="mb-4">
          Anda dapat memilih untuk menggunakan versi terbaru dari server atau
          tetap menggunakan versi yang sedang Anda edit.
        </p>
        <div className="flex justify-end gap-2 mt-4">
          <button
            onClick={onUseRemote}
            className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
          >
            Gunakan Versi Terbaru
          </button>
          <button
            onClick={onUseLocal}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
          >
            Gunakan Versi Saya
          </button>
        </div>
      </div>
    </div>
  )
}
