import { useEffect, useRef } from 'react'

interface FocusOptions {
  shouldFocus?: boolean
  focusDelay?: number
  restoreFocus?: boolean
}

/**
 * Custom hook untuk mengelola fokus elemen
 * Dapat mengarahkan fokus ke elemen saat mount, dan mengembalikan fokus saat unmount
 *
 * @param shouldFocus Apakah elemen perlu difokuskan saat mount
 * @param focusDelay Delay dalam ms sebelum fokus diberikan
 * @param restoreFocus Apakah fokus perlu dikembalikan ke elemen sebelumnya saat unmount
 * @returns ref untuk dipasang pada elemen yang perlu fokus
 */
export function useFocusManagement({
  shouldFocus = true,
  focusDelay = 0,
  restoreFocus = true,
}: FocusOptions = {}) {
  const elementRef = useRef<HTMLElement | null>(null)
  const previousFocus = useRef<HTMLElement | null>(null)

  // Menyimpan elemen yang mendapat fokus sebelumnya
  useEffect(() => {
    previousFocus.current = document.activeElement as HTMLElement
  }, [])

  // Fokus ke elemen saat mount
  useEffect(() => {
    const element = elementRef.current
    if (!shouldFocus || !element) return

    const focusElement = () => {
      if (element.tabIndex < 0) {
        element.tabIndex = -1
      }
      element.focus()
    }

    // Fokus dengan atau tanpa delay
    const timeoutId =
      focusDelay > 0
        ? setTimeout(focusElement, focusDelay)
        : (focusElement(), null)

    // Cleanup: restore focus dan clear timeout
    return () => {
      if (timeoutId) clearTimeout(timeoutId)

      if (restoreFocus && previousFocus.current) {
        previousFocus.current.focus()
      }
    }
  }, [shouldFocus, focusDelay, restoreFocus])

  return elementRef
}

/**
 * Custom hook untuk fokus kembali ke elemen saat kondisi terpenuhi
 * Berguna setelah rerender yang dapat kehilangan fokus
 *
 * @param condition Kondisi yang menentukan kapan fokus perlu dipulihkan
 * @param focusDelay Delay dalam ms sebelum fokus diberikan
 * @returns ref untuk dipasang pada elemen yang perlu fokus
 */
export function useRefocusOnCondition(condition: boolean, focusDelay = 0) {
  const elementRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    const element = elementRef.current
    if (!condition || !element) return

    const timeoutId = setTimeout(() => {
      element.focus()
    }, focusDelay)

    return () => clearTimeout(timeoutId)
  }, [condition, focusDelay])

  return elementRef
}

export default useFocusManagement
