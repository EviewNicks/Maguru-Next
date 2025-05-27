'use client'

import { useState, useEffect, useMemo } from 'react'
import { Loader2 } from 'lucide-react'
import { defaultContentJSON } from '@/features/manage-module/lib/content'
import { RichTextEditor, RichTextEditorProps } from './RichTextEditor'
import { useModulePageCRUDContext } from '../context/ModulePageCRUDContext'
import { useQuery } from '@tanstack/react-query'
import { modulePageService } from '../services/modulePageService'

// Komponen khusus untuk autosave
export function RichTextEditorWithAutosave({
  pageId,
  className,
  initialContent,
  onChange,
}: Omit<RichTextEditorProps, 'autosave'> & { pageId: string }) {
  // Gunakan context untuk mendapatkan data halaman
  const { activePage, pages, handleEditorChange } = useModulePageCRUDContext()

  // State untuk loading dan error
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Persiapkan konten untuk editor - gunakan JSON yang sudah diparse
  const content = useMemo(() => {
    console.log('[RichTextEditorWithAutosave] Preparing content for editor')

    // Jika ada activePage, gunakan konten dari sana
    if (activePage) {
      console.log('[RichTextEditorWithAutosave] Using active page from context')
      // Konten sudah diproses di ModulePageEditor dan ModulePageCRUDContext
      return activePage.blocks && activePage.blocks.length > 0
        ? JSON.parse(initialContent || '{}')
        : defaultContentJSON
    }

    // Jika ada initialContent, gunakan itu (sudah diparse di ModulePageEditor)
    if (initialContent) {
      console.log('[RichTextEditorWithAutosave] Using initialContent prop')
      try {
        return JSON.parse(initialContent)
      } catch (error) {
        console.error(
          '[RichTextEditorWithAutosave] Error parsing initialContent:',
          error
        )
        return defaultContentJSON
      }
    }

    // Default ke konten kosong
    console.log('[RichTextEditorWithAutosave] Using default content')
    return defaultContentJSON
  }, [activePage, initialContent])

  // Fetch page data menggunakan useQuery jika tidak tersedia di context
  const { isLoading: isQueryLoading, error: queryError } = useQuery({
    queryKey: ['modulePage', pageId],
    queryFn: () => modulePageService.getModulePage(pageId),
    enabled: !activePage && !!pageId && !pages.find((p) => p.id === pageId),
    staleTime: 5 * 60 * 1000, // 5 menit
    gcTime: 10 * 60 * 1000, // 10 menit
    refetchOnWindowFocus: false,
  })

  // Update loading state berdasarkan query
  useEffect(() => {
    if (activePage || !isQueryLoading) {
      setIsLoading(false)
    }

    // Set error jika ada
    if (queryError) {
      setError('Gagal memuat data halaman')
    }
  }, [activePage, isQueryLoading, queryError])

  // Handle onChange events dari editor
  const handleChange = (editorContent: object) => {
    // Panggil onChange prop jika disediakan
    if (onChange) {
      onChange(editorContent)
    }

    // Gunakan handleEditorChange dari context untuk autosave
    if (pageId) {
      handleEditorChange(editorContent, pageId)
    }
  }

  // Tampilkan loading state
  if (isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  // Tampilkan error jika ada
  if (error) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center p-8">
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center shadow-sm">
          <h3 className="mb-2 text-lg font-medium text-red-600">Error</h3>
          <p className="mb-4 text-sm text-red-500">{error}</p>
          <button
            className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
            onClick={() => window.location.reload()}
          >
            Coba lagi
          </button>
        </div>
      </div>
    )
  }

  // Render editor dengan konten yang sudah diparse
  return (
    <RichTextEditor
      initialContent={content}
      onChange={handleChange}
      className={className}
      autosave={true}
    />
  )
}
