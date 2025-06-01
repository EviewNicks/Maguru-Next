'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Editor } from '@tiptap/react'
import { StandardEditorContent, DraftSaveStatus } from '../../types'
import { formatDistanceToNow } from 'date-fns'
import { id } from 'date-fns/locale'
import { modulePageAdapter } from '../../adapters/modulePageAdapter'
import { useClerk } from '@clerk/nextjs'
import { logger } from '../../services/logger'

// Konstanta untuk hook name (logging)
const HOOK = 'useRichTextAutosave'

// Konfigurasi autosave
const DEBOUNCE_DELAY = 5000 // 5 detik debounce
const THROTTLE_DELAY = 30000 // 30 detik maksimal interval penyimpanan
const MINIMUM_SAVE_INTERVAL = 2000 // 2 detik interval minimum antar penyimpanan
const RETRY_DELAY = 5000 // 5 detik delay untuk retry ketika offline

interface UseRichTextAutosaveOptions {
  editor: Editor | null
  enabled: boolean
  pageId: string
}

/**
 * Hook untuk menangani autosave pada rich text editor
 *
 * @param options - Konfigurasi untuk autosave
 * @returns Object dengan state dan fungsi untuk mengelola autosave
 */
export function useRichTextAutosave({
  editor,
  enabled,
  pageId,
}: UseRichTextAutosaveOptions) {
  // Ref untuk timeout autosave
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  // Ref untuk timestamp terakhir kali content disimpan
  const lastSaveTimeRef = useRef<number>(0)
  // Ref untuk queue yang berisi konten yang belum tersimpan
  const saveQueueRef = useRef<StandardEditorContent[]>([])
  // Ref untuk status apakah sedang menyimpan
  const isSavingRef = useRef<boolean>(false)
  // State untuk terakhir kali disimpan
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null)
  // State untuk status saving
  const [saveStatus, setSaveStatus] = useState<DraftSaveStatus>('idle')
  // Ref untuk status online/offline
  const isOnlineRef = useRef<boolean>(true)
  // Ref untuk retry timeout
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  // Ref untuk last error
  const lastErrorRef = useRef<Error | null>(null)
  // State untuk hasUnsavedChanges
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false)

  // Mendapatkan user ID dari Clerk
  const { user } = useClerk()
  const userId = user?.id || ''

  // Mendapatkan string lastSaved yang diformat
  const getFormattedLastSaved = useCallback(() => {
    if (!lastSavedAt) return ''

    try {
      return formatDistanceToNow(lastSavedAt, {
        addSuffix: true,
        locale: id,
      })
    } catch (error) {
      logger.error(HOOK, `Error formatting lastSavedAt: ${error}`)
      return ''
    }
  }, [lastSavedAt])

  // Mendapatkan konten editor dalam format yang dapat disimpan
  const getEditorContent = useCallback((): StandardEditorContent | null => {
    if (!editor) return null
    return editor.getJSON() as StandardEditorContent
  }, [editor])

  // Fungsi untuk mengatur saveStatus dan lastSavedAt
  const updateSaveStatus = useCallback(
    (status: DraftSaveStatus, timestamp?: Date | null) => {
      setSaveStatus(status)
      if (timestamp) {
        setLastSavedAt(timestamp)
      }
    },
    []
  )

  // Fungsi untuk mencoba menyimpan draft
  const saveDraft = useCallback(async () => {
    // Jika tidak ada editor atau tidak enabled, abaikan
    if (!editor || !enabled || !pageId || !userId) {
      return
    }

    // Ambil konten editor saat ini
    const content = getEditorContent()
    if (!content) return

    // Tambahkan ke queue
    saveQueueRef.current.push(content)

    // Jika sedang menyimpan, jangan lanjutkan
    if (isSavingRef.current) {
      return
    }

    // Set sedang menyimpan
    isSavingRef.current = true

    // Proses semua item dalam queue
    try {
      while (saveQueueRef.current.length > 0) {
        // Jika offline, ubah status dan hentikan proses
        if (!isOnlineRef.current) {
          updateSaveStatus('offline')
          break
        }

        // Ambil konten terbaru dari queue
        const latestContent = saveQueueRef.current.pop()
        if (!latestContent) break

        // Kosongkan queue (kita hanya butuh yang terbaru)
        saveQueueRef.current = []

        // Update status menjadi saving
        updateSaveStatus('saving')

        // Simpan draft
        const result = await modulePageAdapter.saveDraft(
          pageId,
          latestContent,
          userId
        )

        // Update status berdasarkan hasil
        if (result) {
          const now = new Date()
          lastSaveTimeRef.current = Date.now()
          updateSaveStatus('saved', now)
          setHasUnsavedChanges(false)
          lastErrorRef.current = null
        } else {
          updateSaveStatus('error')
          lastErrorRef.current = new Error('Failed to save draft')
        }
      }
    } catch (error) {
      logger.error(HOOK, `Error saving draft: ${error}`)
      updateSaveStatus('error')
      lastErrorRef.current =
        error instanceof Error ? error : new Error(String(error))
    } finally {
      isSavingRef.current = false
    }
  }, [editor, enabled, pageId, userId, getEditorContent, updateSaveStatus])

  // Fungsi untuk menangani retry saving ketika offline
  const retryOfflineSave = useCallback(() => {
    if (!isOnlineRef.current || saveQueueRef.current.length === 0) return

    // Clear any existing retry timeout
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current)
      retryTimeoutRef.current = null
    }

    // Jika online dan ada konten dalam queue, coba simpan
    if (saveStatus === 'offline' || saveStatus === 'error') {
      updateSaveStatus('retrying')
      saveDraft()
    }
  }, [saveStatus, saveDraft, updateSaveStatus])

  // Fungsi untuk debounced autosave
  const debouncedSave = useCallback(() => {
    // Reset timeout jika sudah ada
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }

    // Set new timeout
    timeoutRef.current = setTimeout(() => {
      // Check throttle (maksimal interval)
      const now = Date.now()
      const timeSinceLastSave = now - lastSaveTimeRef.current

      if (timeSinceLastSave >= MINIMUM_SAVE_INTERVAL) {
        saveDraft()
      } else {
        // Jika terlalu cepat, tunggu lagi
        const waitTime = MINIMUM_SAVE_INTERVAL - timeSinceLastSave
        timeoutRef.current = setTimeout(saveDraft, waitTime)
      }
    }, DEBOUNCE_DELAY)
  }, [saveDraft])

  // Efek untuk online/offline detection
  useEffect(() => {
    // Initial check
    isOnlineRef.current = navigator.onLine

    // Handler untuk online event
    const handleOnline = () => {
      isOnlineRef.current = true
      retryOfflineSave()
    }

    // Handler untuk offline event
    const handleOffline = () => {
      isOnlineRef.current = false
      updateSaveStatus('offline')
    }

    // Tambahkan event listener
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [updateSaveStatus, retryOfflineSave])

  // Setup retry mechanism untuk offline/error
  useEffect(() => {
    if (saveStatus === 'offline' || saveStatus === 'error') {
      // Setup retry timeout
      retryTimeoutRef.current = setTimeout(retryOfflineSave, RETRY_DELAY)
    }

    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current)
        retryTimeoutRef.current = null
      }
    }
  }, [saveStatus, retryOfflineSave])

  // Efek untuk mendeteksi perubahan dan mengatur autosave
  useEffect(() => {
    if (!editor || !enabled) return

    // Handler untuk perubahan konten
    const handleUpdate = ({}: { editor: Editor }) => {
      // Set flag unsaved changes
      setHasUnsavedChanges(true)
      // Update status menjadi unsaved
      if (saveStatus !== 'saving') {
        updateSaveStatus('unsaved')
      }
      // Trigger debounced save
      debouncedSave()
    }

    // Register update handler
    editor.on('update', handleUpdate)

    return () => {
      editor.off('update', handleUpdate)
    }
  }, [editor, enabled, debouncedSave, saveStatus, updateSaveStatus])

  // Efek untuk menyimpan draft sebelum unload
  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      // Jika ada perubahan yang belum disimpan dan sedang online,
      // coba simpan secara synchronous
      if (hasUnsavedChanges && isOnlineRef.current && !isSavingRef.current) {
        const content = getEditorContent()
        if (content && pageId && userId) {
          try {
            // Buat request synchronous (tidak ideal tapi ini untuk kasus ekstrem)
            const xhr = new XMLHttpRequest()
            const url = `/api/module/draft/sync-save`
            xhr.open('POST', url, false) // false berarti synchronous
            xhr.setRequestHeader('Content-Type', 'application/json')
            xhr.send(
              JSON.stringify({
                pageId,
                content,
                authorId: userId,
              })
            )
          } catch (error) {
            logger.error(HOOK, `Error in sync save: ${error}`)
          }
        }
      }

      // Jika masih ada perubahan yang belum disimpan, tampilkan konfirmasi
      if (hasUnsavedChanges) {
        event.preventDefault()
        event.returnValue =
          'Perubahan belum tersimpan. Yakin ingin meninggalkan halaman?'
        return event.returnValue
      }
    }

    // Register event handler
    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)

      // Save on unmount jika belum disimpan
      if (hasUnsavedChanges && isOnlineRef.current) {
        saveDraft()
      }
    }
  }, [pageId, userId, getEditorContent, hasUnsavedChanges, saveDraft])

  // Efek untuk menyimpan ketika visibility berubah (tab switching)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && hasUnsavedChanges) {
        // Simpan draft ketika tab tidak aktif
        saveDraft()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [hasUnsavedChanges, saveDraft])

  // Efek untuk regular saving berdasarkan THROTTLE_DELAY
  useEffect(() => {
    if (!enabled) return

    // Setup interval untuk regular saving
    const interval = setInterval(() => {
      if (hasUnsavedChanges && !isSavingRef.current) {
        saveDraft()
      }
    }, THROTTLE_DELAY)

    return () => {
      clearInterval(interval)
    }
  }, [enabled, hasUnsavedChanges, saveDraft])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current)
      }
    }
  }, [])

  // Fungsi untuk force save
  const forceSave = useCallback(() => {
    saveDraft()
  }, [saveDraft])

  // Return values and functions
  return {
    saveStatus,
    lastSavedAt,
    hasUnsavedChanges,
    formattedLastSaved: getFormattedLastSaved(),
    forceSave,
    error: lastErrorRef.current,
  }
}
