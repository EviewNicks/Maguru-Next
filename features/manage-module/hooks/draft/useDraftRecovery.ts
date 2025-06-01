'use client'

import { useEffect, useState, useCallback } from 'react'
import { StandardEditorContent, ModulePage } from '../../types'
import { modulePageAdapter } from '../../adapters/modulePageAdapter'
import { logger } from '../../services/logger'
import { formatDistanceToNow } from 'date-fns'
import { id } from 'date-fns/locale'

// Konstanta untuk hook name (logging)
const HOOK = 'useDraftRecovery'

interface UseDraftRecoveryOptions {
  pageId: string
  onRecover?: (content: StandardEditorContent) => void
  onDiscard?: () => void
  autoCheckOnMount?: boolean
}

/**
 * Hook untuk menangani recovery draft
 *
 * @param options - Konfigurasi untuk recovery draft
 * @returns Object dengan state dan fungsi untuk mengelola recovery draft
 */
export function useDraftRecovery({
  pageId,
  onRecover,
  onDiscard,
  autoCheckOnMount = true,
}: UseDraftRecoveryOptions) {
  // State untuk menandai apakah draft tersedia
  const [hasDraft, setHasDraft] = useState(false)
  // State untuk menyimpan data draft yang ditemukan
  const [draftData, setDraftData] = useState<ModulePage | null>(null)
  // State untuk dialog recovery
  const [showRecoveryDialog, setShowRecoveryDialog] = useState(false)
  // State untuk loading
  const [isLoading, setIsLoading] = useState(false)

  // Fungsi untuk mengecek keberadaan draft
  const checkDraft = useCallback(async () => {
    if (!pageId) return false

    try {
      setIsLoading(true)
      logger.debug(HOOK, `Checking draft for pageId: ${pageId}`)

      // Gunakan adapter untuk mengecek keberadaan draft
      const result = await modulePageAdapter.hasDraft(pageId)
      setHasDraft(result)

      return result
    } catch (error) {
      logger.error(HOOK, `Error checking draft: ${error}`)
      setHasDraft(false)
      return false
    } finally {
      setIsLoading(false)
    }
  }, [pageId])

  // Fungsi untuk mendapatkan draft
  const fetchDraft = useCallback(async () => {
    if (!pageId) return null

    try {
      setIsLoading(true)
      logger.debug(HOOK, `Fetching draft for pageId: ${pageId}`)

      // Gunakan adapter untuk mendapatkan draft
      const draft = await modulePageAdapter.getDraft(pageId)
      setDraftData(draft)

      if (draft && draft.draftData) {
        setHasDraft(true)
        return draft
      }

      setHasDraft(false)
      return null
    } catch (error) {
      logger.error(HOOK, `Error fetching draft: ${error}`)
      setHasDraft(false)
      setDraftData(null)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [pageId])

  // Fungsi untuk menampilkan dialog recovery
  const showRecovery = useCallback(async () => {
    if (!hasDraft && !draftData) {
      const draft = await fetchDraft()
      if (!draft) return false
    }

    setShowRecoveryDialog(true)
    return true
  }, [hasDraft, draftData, fetchDraft])

  // Fungsi untuk menangani recovery draft
  const handleRecover = useCallback(() => {
    if (!draftData || !draftData.draftData) return

    logger.debug(HOOK, `Recovering draft for pageId: ${pageId}`)

    // Panggil callback onRecover dengan data draft
    if (onRecover) {
      onRecover(draftData.draftData)
    }

    // Tutup dialog
    setShowRecoveryDialog(false)
  }, [draftData, pageId, onRecover])

  // Fungsi untuk menangani discard draft
  const handleDiscard = useCallback(async () => {
    if (!pageId) return

    try {
      setIsLoading(true)
      logger.debug(HOOK, `Discarding draft for pageId: ${pageId}`)

      // Gunakan adapter untuk membuang draft
      const result = await modulePageAdapter.discardDraft(pageId)

      if (result) {
        setHasDraft(false)
        setDraftData(null)

        // Panggil callback onDiscard
        if (onDiscard) {
          onDiscard()
        }
      }
    } catch (error) {
      logger.error(HOOK, `Error discarding draft: ${error}`)
    } finally {
      setIsLoading(false)
      setShowRecoveryDialog(false)
    }
  }, [pageId, onDiscard])

  // Fungsi untuk menutup dialog tanpa melakukan aksi
  const closeDialog = useCallback(() => {
    setShowRecoveryDialog(false)
  }, [])

  // Efek untuk mengecek draft saat mount
  useEffect(() => {
    if (autoCheckOnMount && pageId) {
      checkDraft().then((exists) => {
        if (exists) {
          fetchDraft()
        }
      })
    }
  }, [autoCheckOnMount, pageId, checkDraft, fetchDraft])

  // Format timestamp draft untuk ditampilkan
  const formattedDraftTime = draftData?.draftSavedAt
    ? formatDistanceToNow(new Date(draftData.draftSavedAt), {
        addSuffix: true,
        locale: id,
      })
    : null

  // Dapatkan nama editor yang terakhir mengedit draft
  const editorName = draftData?.lastEditBy || null

  return {
    hasDraft,
    draftData,
    isLoading,
    showRecoveryDialog,
    formattedDraftTime,
    editorName,
    checkDraft,
    fetchDraft,
    showRecovery,
    handleRecover,
    handleDiscard,
    closeDialog,
  }
}
