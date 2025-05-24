'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Editor } from '@tiptap/react'
import axios from 'axios'
import { ContentBlockType } from '../types'
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
  // Ref untuk menandai jika proses menyimpan sedang berlangsung
  const isSavingRef = useRef(false)

  // Mendapatkan string lastSaved yang diformat
  const lastSaved = lastSavedAt
    ? formatDistanceToNow(lastSavedAt, { addSuffix: true, locale: id })
    : null

  // Fungsi untuk menyimpan konten
  const saveContent = useCallback(async () => {
    // Jika editor tidak ada atau autosave tidak diaktifkan, jangan lakukan apa-apa
    if (!editor || !enabled || !pageId) {
      return
    }

    // Periksa flag navigasi - jangan autosave jika sedang navigasi halaman
    const isNavigating =
      window.sessionStorage.getItem('isNavigating') === 'true'
    if (isNavigating) {
      console.log(
        '[useRichTextAutosave] Navigation in progress, skipping autosave'
      )
      return
    }

    // Jika sudah dalam proses menyimpan, jangan mulai proses baru
    if (isSavingRef.current) {
      console.log('[useRichTextAutosave] Already saving, skipping')
      return
    }

    try {
      // Set status saving
      setIsSaving(true)
      isSavingRef.current = true

      // Dapatkan konten dari editor
      const content = editor.getJSON()

      // Siapkan data untuk API
      const blocks = [
        {
          type: ContentBlockType.TEXT,
          content: JSON.stringify(content),
        },
      ]

      // Panggil API untuk menyimpan
      console.log(`[useRichTextAutosave] Saving content for pageId: ${pageId}`)
      const response = await axios.put(`/api/module/pages/${pageId}`, {
        blocks,
      })

      // Update status setelah berhasil
      if (response.data && response.data.success) {
        setLastSavedAt(new Date())
        console.log('[useRichTextAutosave] Content saved successfully')
      } else {
        console.error(
          '[useRichTextAutosave] API returned error:',
          response.data
        )
        throw new Error(response.data?.error || 'Failed to save content')
      }
    } catch (error) {
      console.error('[useRichTextAutosave] Error saving content:', error)
      throw error
    } finally {
      setIsSaving(false)
      isSavingRef.current = false
    }
  }, [editor, enabled, pageId])

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
