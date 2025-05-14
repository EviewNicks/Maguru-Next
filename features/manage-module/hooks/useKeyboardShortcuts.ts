/**
 * Custom hook untuk menangani shortcut keyboard di aplikasi.
 * Mendukung registrasi shortcut, penanganan event, dan integrasi dengan berbagai komponen.
 */

import { useEffect, useRef, useCallback } from 'react'
import { ShortcutDefinition, ShortcutScope } from '../constants/shortcuts'
import {
  handleKeyboardEvent,
  shouldHandleShortcut,
} from '../utils/shortcutUtils'

type ShortcutHandler = () => void
type ShortcutHandlers = Record<string, ShortcutHandler>

interface UseKeyboardShortcutsOptions {
  scope?: ShortcutScope
  enabled?: boolean
  shouldHandle?: (event: KeyboardEvent) => boolean
  elementRef?: React.RefObject<HTMLElement>
}

/**
 * Custom hook untuk menangani shortcut keyboard
 * @param shortcuts - Daftar shortcut yang akan digunakan
 * @param handlers - Object dengan key berupa action dan value berupa callback function
 * @param options - Opsi tambahan seperti scope, enabled, dll.
 */
export const useKeyboardShortcuts = (
  shortcuts: ShortcutDefinition[],
  handlers: ShortcutHandlers,
  options: UseKeyboardShortcutsOptions = {}
) => {
  const {
    scope = 'global',
    enabled = true,
    shouldHandle = shouldHandleShortcut,
    elementRef,
  } = options

  // Filter shortcuts based on scope if specified
  const filteredShortcuts = scope
    ? shortcuts.filter((shortcut) => shortcut.scope === scope)
    : shortcuts

  // Referensi mutable untuk handlers agar tidak perlu re-attach event listener
  // saat handlers berubah
  const handlersRef = useRef<ShortcutHandlers>(handlers)

  // Update handlersRef saat handlers berubah
  useEffect(() => {
    handlersRef.current = handlers
  }, [handlers])

  // Penangan event keyboard utama
  const keyDownHandler = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return

      // Cek apakah event sebaiknya diproses
      if (!shouldHandle(event)) return

      // Tangani event dengan utility function
      handleKeyboardEvent(event, filteredShortcuts, handlersRef.current)
    },
    [enabled, filteredShortcuts, shouldHandle]
  )

  // Attach event listener ke elemen yang ditentukan atau document
  useEffect(() => {
    if (!enabled) return

    const targetElement = elementRef?.current || document

    targetElement.addEventListener('keydown', keyDownHandler as EventListener)

    return () => {
      targetElement.removeEventListener(
        'keydown',
        keyDownHandler as EventListener
      )
    }
  }, [enabled, keyDownHandler, elementRef])

  // Fungsi untuk mengaktifkan/nonaktifkan shortcut secara dinamis
  const isEnabled = useRef(enabled)

  const setEnabled = useCallback((value: boolean) => {
    isEnabled.current = value
  }, [])

  // Fungsi untuk memeriksa apakah shortcut diaktifkan
  const getEnabled = useCallback(() => {
    return isEnabled.current
  }, [])

  // Fungsi untuk mengeksekusi handler secara manual jika diperlukan
  const triggerShortcut = useCallback(
    (shortcutId: string) => {
      const shortcut = filteredShortcuts.find((s) => s.id === shortcutId)
      if (!shortcut) return

      const handler = handlersRef.current[shortcut.action]
      if (handler) {
        handler()
      }
    },
    [filteredShortcuts]
  )

  return {
    setEnabled,
    getEnabled,
    triggerShortcut,
  }
}

export default useKeyboardShortcuts
