'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { useDebounce } from './useDebounce'
import {
  showErrorNotification,
  categorizeError,
  isErrorRetryable,
} from '../components/ErrorNotifier'
import { ContentBlock, ContentBlockType } from '../types/modulePageSchema'
import axios from 'axios'

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
  // Flag untuk menonaktifkan autosave sementara
  const isDisabled = true // SEMENTARA DINONAKTIFKAN - Akan diaktifkan kembali nanti

  // State untuk status penyimpanan
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('saved')
  // State untuk konten editor
  const [content, setContent] = useState(initialContent || '')
  // Ref untuk menandai jika ada penyimpanan yang sedang berlangsung
  const pendingSaveRef = useRef(false)
  // Ref untuk menandai jika konten sudah berubah sejak penyimpanan terakhir
  const contentChangedRef = useRef(false)

  // Log initial content untuk debugging
  useEffect(() => {
    console.log(
      '[useRichTextAutosave] Initial content:',
      initialContent ? 'provided' : 'empty'
    )
  }, [initialContent])

  // Konversi HTML ke format blocks
  const convertHtmlToContentBlock = useCallback(
    (htmlContent: string): ContentBlock[] => {
      // Jika konten kosong, kembalikan array kosong
      if (!htmlContent || htmlContent === '<p></p>') {
        return []
      }

      try {
        // Cek apakah konten sudah dalam format JSON blocks
        if (htmlContent.startsWith('[') && htmlContent.includes('"type"')) {
          const parsedBlocks = JSON.parse(htmlContent)
          if (Array.isArray(parsedBlocks)) {
            console.log('[useRichTextAutosave] Using existing blocks format')
            return parsedBlocks
          }
        }
      } catch (_error) {
        // Bukan JSON valid, lanjutkan dengan konversi HTML
        console.log(
          '[useRichTextAutosave] Not valid JSON blocks, treating as HTML',
          _error instanceof Error ? _error.message : 'Unknown error'
        )
      }

      // Jika bukan JSON valid, anggap sebagai HTML dan konversi ke blocks
      // Ini adalah implementasi sederhana, bisa dikembangkan lebih lanjut
      const blocks: ContentBlock[] = [
        {
          type: ContentBlockType.TEXT,
          content: htmlContent,
        },
      ]

      console.log(
        '[useRichTextAutosave] Converted HTML to blocks:',
        blocks.length
      )
      return blocks
    },
    []
  )

  // Debounce untuk mengurangi frekuensi penyimpanan
  const debouncedContent = useDebounce(content, 2000)

  // Efek untuk menyimpan konten saat berubah (setelah debounce)
  useEffect(() => {
    // Skip jika tidak ada pageId atau konten belum berubah
    if (!pageId || !contentChangedRef.current || !debouncedContent) return

    // Reset flag karena akan melakukan penyimpanan
    contentChangedRef.current = false

    // Simpan konten
    saveContent()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedContent, pageId])

  // Handler untuk perubahan konten
  const handleContentChange = useCallback((newContent: string) => {
    setContent(newContent)
    contentChangedRef.current = true

    // Ubah status jika belum 'unsaved'
    setSaveStatus((current) => (current === 'saved' ? 'unsaved' : current))
  }, [])

  // Fungsi untuk menyimpan konten
  const saveContent = useCallback(async () => {
    // NONAKTIFKAN AUTOSAVE SEMENTARA
    if (isDisabled) {
      console.log('[useRichTextAutosave] Autosave is temporarily disabled')
      return
    }

    if (!pageId) {
      console.warn('[useRichTextAutosave] No pageId provided, skipping save')
      return
    }

    try {
      pendingSaveRef.current = true
      setSaveStatus('saving')
      console.log(`[useRichTextAutosave] Saving content for pageId: ${pageId}`)

      // Konversi konten HTML ke format blocks
      const blocks = convertHtmlToContentBlock(content)

      // Siapkan data untuk update
      const updateData = {
        blocks,
      }

      console.log('[useRichTextAutosave] Saving blocks:', blocks.length)

      // Lakukan request update dengan penanganan error yang lebih baik
      try {
        const moduleId = pageId.split('-')[0]
        const response = await axios.put(
          `/api/module/${moduleId}/pages/${pageId}`,
          updateData,
          {
            headers: {
              'Content-Type': 'application/json',
            },
          }
        )

        if (response.data && response.data.success) {
          setSaveStatus('saved')
          console.log('[useRichTextAutosave] Content saved successfully')
        } else {
          throw new Error(response.data?.error || 'Unknown error')
        }
      } catch (error) {
        console.error('[useRichTextAutosave] Error saving content:', error)
        setSaveStatus('error')

        // Kategorisasi error untuk penanganan yang lebih baik
        const category = categorizeError(error)

        // Tampilkan notifikasi error
        showErrorNotification(error, {
          retryFn: isErrorRetryable(category) ? saveContent : undefined,
        })
      }
    } finally {
      pendingSaveRef.current = false
    }
  }, [pageId, content, convertHtmlToContentBlock])

  // Fungsi untuk memaksa penyimpanan (untuk digunakan dari luar hook)
  const forceSave = useCallback(() => {
    if (contentChangedRef.current) {
      saveContent()
    }
  }, [saveContent])

  // Efek untuk menyimpan konten saat komponen unmount
  useEffect(() => {
    return () => {
      // Jika ada perubahan yang belum disimpan saat komponen unmount
      if (contentChangedRef.current && !pendingSaveRef.current) {
        saveContent()
      }
    }
  }, [saveContent])

  return {
    content,
    saveStatus,
    handleContentChange,
    forceSave,
  }
}
