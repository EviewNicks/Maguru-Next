import { useState, useEffect } from 'react'

/**
 * Hook untuk melakukan debounce pada nilai
 * Berguna untuk fitur auto-save dan mengurangi jumlah permintaan API
 *
 * @param value - Nilai yang akan di-debounce
 * @param delay - Delay dalam milliseconds sebelum nilai diperbarui
 * @returns Nilai yang sudah di-debounce
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    // Set timer untuk update debouncedValue setelah delay
    const timer = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    // Cleanup: hapus timer jika value berubah atau komponen unmount
    return () => {
      clearTimeout(timer)
    }
  }, [value, delay])

  return debouncedValue
}
