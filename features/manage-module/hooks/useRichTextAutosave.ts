'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { useModulePageCRUDContext } from '../context/ModulePageCRUDContext'
import { useDebounce } from './useDebounce'
import {
  showErrorNotification,
  categorizeError,
  isErrorRetryable,
} from '../components/ErrorNotifier'
import { ContentBlock, ContentBlockType } from '../types/modulePageSchema'
import { toast } from 'sonner'

export type SaveStatus = 'saved' | 'saving' | 'unsaved' | 'error'

/**
 * Hook untuk menangani autosave konten RichTextEditor
 * dengan dukungan optimistic updates untuk UX yang lebih baik
 *
 * @param pageId - ID halaman yang sedang diedit
 * @param initialContent - Konten awal editor
 * @returns Object berisi state dan fungsi untuk mengelola konten dan status save
 */
export function useRichTextAutosave(pageId?: string, initialContent = '') {
  // State untuk editor
  const [content, setContent] = useState<string>(initialContent)
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('saved')
  const [isContentDirty, setIsContentDirty] = useState(false)

  // Simpan konten sebelum perubahan untuk rollback jika diperlukan
  const previousContentRef = useRef<string>(initialContent)

  // Track save operations yang sedang berjalan
  const pendingSaveRef = useRef<boolean>(false)

  // Debounce content changes untuk mengurangi jumlah save
  const debouncedContent = useDebounce<string>(content, 2000)

  // Get savePage function dari context
  const { savePage } = useModulePageCRUDContext()

  // Handler untuk perubahan konten dengan optimistic update
  const handleContentChange = useCallback(
    (newContent: string) => {
      // Simpan konten sebelumnya jika belum ada operasi save yang berjalan
      if (!pendingSaveRef.current) {
        previousContentRef.current = content
      }

      // Update state lokal segera (optimistic update)
      setContent(newContent)
      setIsContentDirty(true)
      setSaveStatus('unsaved')
    },
    [content]
  )

  // Fungsi untuk mengkonversi konten HTML dari TipTap ke format ContentBlock
  const convertHtmlToContentBlock = useCallback(
    (htmlContent: string): ContentBlock[] => {
      // Buat blok konten text sederhana dengan konten HTML
      return [
        {
          type: ContentBlockType.TEXT,
          content: htmlContent,
        },
      ]
    },
    []
  )

  // Effect untuk autosave saat debouncedContent berubah
  useEffect(() => {
    if (!isContentDirty || !pageId) return

    const saveContent = async () => {
      try {
        // Tandai bahwa operasi save sedang berjalan
        pendingSaveRef.current = true
        setSaveStatus('saving')

        // Konversi konten HTML ke format ContentBlock
        const blocks = convertHtmlToContentBlock(content)

        // Optimistic update sudah dilakukan di handleContentChange
        // Sekarang kita melakukan save ke server
        await savePage({
          pageId,
          blocks,
        })

        // Update state setelah save berhasil
        setIsContentDirty(false)
        setSaveStatus('saved')
      } catch (error) {
        console.error('Error saving content:', error)

        // Handle error dengan rollback UI state jika diperlukan
        setSaveStatus('error')

        // Kategorisasi error dan tambahkan opsi retry
        const category = categorizeError(error)
        showErrorNotification(error, {
          retryFn: isErrorRetryable(category) ? saveContent : undefined,
        })
      } finally {
        // Reset flag operasi save
        pendingSaveRef.current = false
      }
    }

    saveContent()
  }, [
    debouncedContent,
    pageId,
    content,
    isContentDirty,
    savePage,
    convertHtmlToContentBlock,
  ])

  // Manual save function with better error handling and retry support
  const saveContent = useCallback(async () => {
    if (!pageId || !isContentDirty) return

    try {
      pendingSaveRef.current = true
      setSaveStatus('saving')

      // Konversi konten HTML ke format ContentBlock
      const blocks = convertHtmlToContentBlock(content)

      await savePage({
        pageId,
        blocks,
      })

      setIsContentDirty(false)
      setSaveStatus('saved')

      // Notifikasi sukses
      toast.success('Konten berhasil disimpan', {
        duration: 2000,
      })
    } catch (error) {
      console.error('Error manually saving content:', error)
      setSaveStatus('error')

      // Kategorisasi error dan tambahkan opsi retry
      const category = categorizeError(error)
      showErrorNotification(error, {
        retryFn: isErrorRetryable(category) ? saveContent : undefined,
      })
    } finally {
      pendingSaveRef.current = false
    }
  }, [pageId, content, isContentDirty, savePage, convertHtmlToContentBlock])

  // Fungsi untuk rollback ke konten sebelumnya jika diperlukan
  const rollbackContent = useCallback(() => {
    // Kembali ke konten sebelumnya jika ada error
    if (saveStatus === 'error' && previousContentRef.current) {
      setContent(previousContentRef.current)
      setIsContentDirty(false)
      setSaveStatus('saved')
    }
  }, [saveStatus])

  return {
    content,
    saveStatus,
    isContentDirty,
    handleContentChange,
    saveContent,
    rollbackContent,
  }
}
