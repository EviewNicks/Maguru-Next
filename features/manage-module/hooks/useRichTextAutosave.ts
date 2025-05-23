'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import {
  showErrorNotification,
  categorizeError,
  isErrorRetryable,
} from '../components/ErrorNotifier'
import { ContentBlock, ContentBlockType } from '../types/modulePageSchema'
import axios from 'axios'
import { Editor } from '@tiptap/react'
import { formatDistanceToNow } from 'date-fns'
import { id } from 'date-fns/locale'

export type SaveStatus = 'saved' | 'saving' | 'unsaved' | 'error'

interface UseRichTextAutosaveOptions {
  editor: Editor | null
  enabled: boolean
  pageId: string
}

/**
 * Hook untuk menangani autosave konten RichTextEditor
 * dengan dukungan optimistic updates untuk UX yang lebih baik
 * dan format JSON Tiptap
 *
 * @param options - Konfigurasi untuk autosave
 * @returns Object berisi state dan fungsi untuk mengelola konten dan status save
 */
export function useRichTextAutosave({
  editor,
  enabled = true,
  pageId,
}: UseRichTextAutosaveOptions) {
  // State untuk status penyimpanan
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('saved')
  const [isSaving, setIsSaving] = useState(false)
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null)
  // Ref untuk menandai jika konten sudah berubah sejak penyimpanan terakhir
  const contentChangedRef = useRef(false)
  // Ref untuk menyimpan timeout ID untuk debounce
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Mendapatkan string lastSaved yang diformat
  const lastSaved = lastSavedAt
    ? formatDistanceToNow(lastSavedAt, { addSuffix: true, locale: id })
    : null

  // Konversi JSON string ke format blocks
  const convertJsonToContentBlocks = useCallback(
    (jsonContent: object): ContentBlock[] => {
      try {
        // Buat satu block dengan type text dan konten dari JSON
        const block: ContentBlock = {
          type: ContentBlockType.TEXT,
          content: JSON.stringify(jsonContent),
        }

        return [block]
      } catch (error) {
        console.error('[useRichTextAutosave] JSON conversion error:', error)
        return []
      }
    },
    []
  )

  // Fungsi untuk menyimpan konten
  const saveContent = useCallback(async () => {
    if (!enabled || !pageId || !editor) {
      console.warn('[useRichTextAutosave] Autosave disabled or missing data')
      return
    }

    try {
      setIsSaving(true)
      setSaveStatus('saving')
      console.log(`[useRichTextAutosave] Saving content for pageId: ${pageId}`)

      // Dapatkan konten editor dalam format JSON
      const editorContent = editor.getJSON()

      // Konversi konten JSON ke format blocks
      const blocks = convertJsonToContentBlocks(editorContent)

      // Siapkan data untuk update
      const updateData = {
        blocks,
      }

      console.log('[useRichTextAutosave] Saving blocks:', blocks.length)

      // Ekstrak moduleId dari pageId jika menggunakan format dengan separator
      let moduleId = pageId
      if (pageId.includes('-')) {
        moduleId = pageId.split('-')[0]
      }

      // Lakukan request update
      const response = await axios.put(
        `/api/module/${moduleId}/pages/${pageId}`,
        updateData,
        {
          headers: {
            'Content-Type': 'application/json',
            'X-Client-Source': 'RichTextAutosave',
          },
        }
      )

      if (response.data && response.data.success) {
        setSaveStatus('saved')
        setLastSavedAt(new Date())
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
    } finally {
      setIsSaving(false)
      contentChangedRef.current = false
    }
  }, [pageId, editor, enabled, convertJsonToContentBlocks])

  // Inisialisasi event listener untuk perubahan editor
  useEffect(() => {
    if (!editor || !enabled) return

    // Tambahkan listener untuk perubahan editor
    const updateListener = () => {
      console.log('[useRichTextAutosave] Editor content changed')
      contentChangedRef.current = true
      setSaveStatus('unsaved')

      // Bersihkan timeout yang ada
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      // Buat timeout baru untuk autosave
      timeoutRef.current = setTimeout(() => {
        if (contentChangedRef.current) {
          saveContent()
        }
      }, 2000) // 2 detik debounce
    }

    // Register update handler
    editor.on('update', updateListener)

    // Cleanup listener saat unmount atau editor berubah
    return () => {
      editor.off('update', updateListener)

      // Bersihkan timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      // Simpan perubahan yang belum tersimpan
      if (contentChangedRef.current) {
        saveContent()
      }
    }
  }, [editor, enabled, saveContent])

  // Fungsi untuk memaksa penyimpanan manual
  const triggerSave = useCallback(() => {
    saveContent()
  }, [saveContent])

  return {
    saveStatus,
    isSaving,
    lastSaved,
    triggerSave,
  }
}
