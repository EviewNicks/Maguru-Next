import React, { useEffect, useState } from 'react'

/**
 * Props untuk komponen A11yAnnouncer
 * @param message - Pesan yang akan diumumkan ke screen reader
 * @param politeness - Level politeness untuk ARIA live region
 * @param clearDelay - Waktu (ms) setelah pesan dibersihkan
 */
interface A11yAnnouncerProps {
  message: string
  politeness?: 'polite' | 'assertive'
  clearDelay?: number
}

/**
 * Komponen untuk mengumumkan pesan ke screen reader via ARIA live regions
 * Komponen ini tidak terlihat tapi bisa dibaca oleh screen reader
 */
export function A11yAnnouncer({
  message,
  politeness = 'polite',
  clearDelay = 5000,
}: A11yAnnouncerProps) {
  const [announcement, setAnnouncement] = useState(message)

  // Efek untuk memperbarui pengumuman dan membersihkannya setelah delay
  useEffect(() => {
    if (!message) return

    // Update pesan
    setAnnouncement(message)

    // Bersihkan pesan setelah beberapa detik
    const timeoutId = setTimeout(() => {
      setAnnouncement('')
    }, clearDelay)

    // Cleanup
    return () => clearTimeout(timeoutId)
  }, [message, clearDelay])

  // Render komponen yang berbeda berdasarkan nilai politeness
  if (politeness === 'assertive') {
    return (
      <div
        role="log"
        aria-live="assertive"
        aria-atomic="true"
        className="sr-only"
        data-testid="a11y-announcer"
      >
        {announcement}
      </div>
    )
  }

  return (
    <div
      role="log"
      aria-live="polite"
      aria-atomic="true"
      className="sr-only"
      data-testid="a11y-announcer"
    >
      {announcement}
    </div>
  )
}

export default A11yAnnouncer
