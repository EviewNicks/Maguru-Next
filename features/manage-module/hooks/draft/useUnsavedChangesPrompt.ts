'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { logger } from '../../services/logger'

// Konstanta untuk hook name (logging)
const HOOK = 'useUnsavedChangesPrompt'

interface UseUnsavedChangesPromptOptions {
  hasUnsavedChanges: boolean
  onConfirmNavigation?: () => Promise<void> | void
  confirmationMessage?: string
  preventNavigation?: boolean
}

/**
 * Hook untuk menampilkan prompt konfirmasi saat navigasi dengan perubahan yang belum disimpan
 *
 * @param options - Konfigurasi untuk prompt konfirmasi
 * @returns Object dengan state dan fungsi untuk mengelola prompt konfirmasi
 */
export function useUnsavedChangesPrompt({
  hasUnsavedChanges,
  onConfirmNavigation,
  confirmationMessage = 'Perubahan belum tersimpan. Anda yakin ingin meninggalkan halaman?',
  preventNavigation = true,
}: UseUnsavedChangesPromptOptions) {
  const router = useRouter()
  const [showDialog, setShowDialog] = useState(false)
  const [pendingUrl, setPendingUrl] = useState<string | null>(null)

  // Handle dialog confirm action
  const handleConfirm = useCallback(async () => {
    logger.debug(HOOK, 'Confirming navigation with unsaved changes')

    if (onConfirmNavigation) {
      await onConfirmNavigation()
    }

    setShowDialog(false)

    // Resume navigation jika ada pendingUrl
    if (pendingUrl) {
      logger.debug(HOOK, `Resuming navigation to: ${pendingUrl}`)
      window.sessionStorage.setItem('isNavigating', 'true')
      router.push(pendingUrl)
      setPendingUrl(null)
    }
  }, [onConfirmNavigation, pendingUrl, router])

  // Handle dialog cancel action
  const handleCancel = useCallback(() => {
    logger.debug(HOOK, 'Canceling navigation, staying on current page')
    setShowDialog(false)
    setPendingUrl(null)
  }, [])

  // Setup beforeunload event handler
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!hasUnsavedChanges || !preventNavigation) return

      logger.debug(HOOK, 'Detected beforeunload event with unsaved changes')

      // Standard way to show confirmation dialog
      e.preventDefault()
      e.returnValue = confirmationMessage

      return confirmationMessage
    }

    if (hasUnsavedChanges && preventNavigation) {
      window.addEventListener('beforeunload', handleBeforeUnload)
    }

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [hasUnsavedChanges, preventNavigation, confirmationMessage])

  // Fungsi untuk handle klik link tanpa menggunakan Next.js Router
  const handleLinkClick = useCallback(
    (url: string, e?: React.MouseEvent) => {
      if (!hasUnsavedChanges || !preventNavigation) {
        return true // Allow navigation
      }

      if (e) {
        e.preventDefault()
      }

      setPendingUrl(url)
      setShowDialog(true)
      return false // Prevent navigation
    },
    [hasUnsavedChanges, preventNavigation]
  )

  // Setup utility function to capture all link clicks
  useEffect(() => {
    if (!hasUnsavedChanges || !preventNavigation) return

    const handleClick = (e: MouseEvent) => {
      // Check if click is on a link
      const link = (e.target as HTMLElement).closest('a')
      if (!link) return

      // Check if link has href and is not external
      const href = link.getAttribute('href')
      if (!href || href.startsWith('http') || href.startsWith('#')) return

      // Check if link has target="_blank"
      if (link.getAttribute('target') === '_blank') return

      // Prevent default and show confirmation
      e.preventDefault()
      setPendingUrl(href)
      setShowDialog(true)
    }

    // Add event listener for all clicks in document
    document.addEventListener('click', handleClick, { capture: true })

    return () => {
      document.removeEventListener('click', handleClick, { capture: true })
    }
  }, [hasUnsavedChanges, preventNavigation])

  // Custom router for Next.js navigation that confirms before navigation
  const routerWithConfirm = {
    push: useCallback(
      (url: string) => {
        if (!hasUnsavedChanges || !preventNavigation) {
          router.push(url)
          return
        }

        setPendingUrl(url)
        setShowDialog(true)
      },
      [hasUnsavedChanges, preventNavigation, router]
    ),
    back: useCallback(() => {
      if (!hasUnsavedChanges || !preventNavigation) {
        router.back()
        return
      }

      setPendingUrl(null) // We don't know the URL for back
      setShowDialog(true)
    }, [hasUnsavedChanges, preventNavigation, router]),
  }

  return {
    showDialog,
    handleConfirm,
    handleCancel,
    handleLinkClick,
    routerWithConfirm,
  }
}
