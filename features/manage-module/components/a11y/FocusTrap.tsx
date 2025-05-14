import React, { useEffect, useRef } from 'react'

interface FocusTrapProps {
  active: boolean
  children: React.ReactNode
  autoFocus?: boolean
}

/**
 * Komponen FocusTrap menangkap fokus dalam sebuah container,
 * mencegah fokus keyboard keluar dari elemen container (biasanya untuk modal/dialog)
 */
export function FocusTrap({
  active,
  children,
  autoFocus = true,
}: FocusTrapProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const previousFocus = useRef<HTMLElement | null>(null)

  // Menyimpan elemen yang fokus sebelumnya dan setup penanganan focus
  useEffect(() => {
    if (active) {
      // Simpan elemen yang fokus sebelumnya
      previousFocus.current = document.activeElement as HTMLElement

      // Auto focus ke container jika diperlukan
      if (autoFocus && rootRef.current) {
        const focusableElement = rootRef.current.querySelector(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        ) as HTMLElement

        if (focusableElement) {
          focusableElement.focus()
        } else {
          rootRef.current.focus()
        }
      }

      // Kembalikan fokus ketika komponen unmount atau active = false
      return () => {
        if (previousFocus.current) {
          previousFocus.current.focus()
        }
      }
    }
  }, [active, autoFocus])

  // Mencegah tab keluar dari container
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (!active || !rootRef.current || event.key !== 'Tab') return

    const focusableElements = rootRef.current.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )

    if (focusableElements.length === 0) return

    const firstElement = focusableElements[0] as HTMLElement
    const lastElement = focusableElements[
      focusableElements.length - 1
    ] as HTMLElement

    // Shift + Tab dari elemen pertama → pindah ke elemen terakhir
    if (event.shiftKey && document.activeElement === firstElement) {
      lastElement.focus()
      event.preventDefault()
    }
    // Tab dari elemen terakhir → pindah ke elemen pertama
    else if (!event.shiftKey && document.activeElement === lastElement) {
      firstElement.focus()
      event.preventDefault()
    }
  }

  // Render normal jika tidak aktif
  if (!active) {
    return <>{children}</>
  }

  return (
    <div
      ref={rootRef}
      onKeyDown={handleKeyDown}
      tabIndex={-1}
      style={{ outline: 'none' }}
      data-testid="focus-trap"
    >
      {children}
    </div>
  )
}

export default FocusTrap
