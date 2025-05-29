'use client'

import React, { useCallback, useState } from 'react'
import { Editor } from '@tiptap/react'
import { useModulePageCRUDContext } from '../context/ModulePageCRUDContext'
import { RichTextEditor, RichTextEditorProps } from './RichTextEditor'
import { SaveIcon, AlertTriangle, RefreshCw, Loader2 } from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { StandardEditorContent, TiptapNode } from '../types'

/**
 * RichTextEditorWithAutosave - Wrapper untuk RichTextEditor dengan fungsi autosave
 *
 * Komponen ini membungkus RichTextEditor dan menambahkan kemampuan autosave
 * dengan indikator status penyimpanan otomatis dan kemampuan untuk memicu
 * penyimpanan manual.
 */
export function RichTextEditorWithAutosave({
  className,
  initialContent,
  onChange,
  pageId,
}: RichTextEditorProps) {
  // Menggunakan context untuk data dan fungsi CRUD
  const { saveStatus, savePage } = useModulePageCRUDContext()

  // State untuk menyimpan instance editor
  const [editor, setEditor] = useState<Editor | null>(null)

  // Fungsi untuk memicu penyimpanan manual
  const handleManualSave = useCallback(async () => {
    if (!pageId || !editor) return

    try {
      // Ambil JSON dari editor lalu konversi ke tipe StandardEditorContent
      const editorContent = editor.getJSON()

      // Gunakan type assertion untuk mengatasi perbedaan tipe
      const content: StandardEditorContent = {
        type: 'doc',
        content: (Array.isArray(editorContent.content)
          ? editorContent.content
          : []) as unknown as TiptapNode[],
      }

      await savePage({
        pageId,
        content,
      })
    } catch (error) {
      console.error('Error saving content:', error)
    }
  }, [editor, pageId, savePage])

  // Callback untuk mendapatkan instance editor dari RichTextEditor
  const handleEditorReady = useCallback((newEditor: Editor | null) => {
    setEditor(newEditor)
  }, [])

  // Render indikator status penyimpanan
  const renderSaveStatus = () => {
    if (!saveStatus) return null

    switch (saveStatus) {
      case 'saved':
        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center text-green-500">
                  <SaveIcon className="h-4 w-4 mr-1" />
                  <span className="text-xs">Tersimpan</span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Semua perubahan telah disimpan</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )
      case 'saving':
        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center text-amber-500">
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                  <span className="text-xs">Menyimpan...</span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Menyimpan perubahan Anda</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )
      case 'unsaved':
        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 border-amber-500/50 text-amber-500"
                  onClick={handleManualSave}
                >
                  <RefreshCw className="h-3 w-3 mr-1" />
                  <span className="text-xs">Simpan</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Klik untuk menyimpan perubahan</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )
      case 'error':
        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 border-red-500/50 text-red-500"
                  onClick={handleManualSave}
                >
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  <span className="text-xs">Coba lagi</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Gagal menyimpan perubahan. Klik untuk mencoba lagi.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )
      default:
        return null
    }
  }

  return (
    <div className={cn('relative', className)}>
      {/* Status penyimpanan tampil di pojok kanan atas */}
      <div className="absolute top-2 right-2 z-10">{renderSaveStatus()}</div>

      {/* Render RichTextEditor standar dengan prop autosave=true */}
      <RichTextEditor
        initialContent={initialContent}
        onChange={onChange}
        pageId={pageId}
        onEditorReady={handleEditorReady}
        autosave={false} // Disable autosave internal karena kita mengelolanya di sini
      />
    </div>
  )
}
