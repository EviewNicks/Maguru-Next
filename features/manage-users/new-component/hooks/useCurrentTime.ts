import { useState, useEffect } from 'react'

/**
 * Hook untuk mengelola waktu terkini yang diperbarui setiap detik
 */
export function useCurrentTime(): Date {
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  return currentTime
}
