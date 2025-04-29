import { useState, useEffect, useCallback, useRef } from 'react'

interface SystemStatusData {
  systemStatus: number
  cpuUsage: number
  memoryUsage: number
  networkStatus: number
  securityLevel: number
  isLoading: boolean
}

/**
 * Hook untuk mengelola status sistem dan mensimulasikan data
 * dengan optimasi untuk mengurangi render berlebihan
 */
export function useSystemStatus(): SystemStatusData {
  // Nilai awal status
  const initialData = {
    systemStatus: 85,
    cpuUsage: 42,
    memoryUsage: 68,
    networkStatus: 92,
    securityLevel: 75,
  }

  // Gunakan useRef untuk menyimpan nilai sebelumnya tanpa menyebabkan re-render
  const dataRef = useRef(initialData)

  // State hanya untuk data yang perlu menyebabkan re-render
  const [status, setStatus] = useState<SystemStatusData>({
    ...dataRef.current,
    isLoading: true,
  })

  // Buat fungsi update yang hanya me-render ketika perubahan signifikan
  const updateDataIfSignificant = useCallback(() => {
    // Generate nilai baru
    const newData = {
      cpuUsage: Math.floor(Math.random() * 30) + 30,
      memoryUsage: Math.floor(Math.random() * 20) + 60,
      networkStatus: Math.floor(Math.random() * 15) + 80,
      systemStatus: Math.floor(Math.random() * 10) + 80,
      securityLevel: Math.floor(Math.random() * 15) + 70,
    }

    // Untuk tujuan pengujian selama mocking Math.random
    // kita selalu update data ref agar bisa diakses oleh test
    dataRef.current = newData

    // Periksa apakah ada perubahan signifikan (> 5%)
    setStatus((currentStatus) => {
      const hasSignificantChange = Object.keys(newData).some((key) => {
        const keyName = key as keyof typeof currentStatus
        const oldValue = currentStatus[keyName]
        const newValue = newData[key as keyof typeof newData]
        // Memastikan kedua nilai adalah angka sebelum operasi aritmatika
        return (
          typeof oldValue === 'number' &&
          typeof newValue === 'number' &&
          Math.abs(newValue - oldValue) > 5
        )
      })

      // Hanya update state jika perubahan signifikan
      if (hasSignificantChange) {
        return {
          ...newData,
          isLoading: currentStatus.isLoading,
        }
      }

      return currentStatus
    })
  }, []) // Hapus dependensi pada status

  // Inisialisasi data saat pertama kali komponen di-mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setStatus((prev) => ({
        ...prev,
        isLoading: false,
      }))
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

  // Interval polling yang lebih panjang (5000ms) dan optimasi
  useEffect(() => {
    // Mulai polling setelah loading selesai
    if (!status.isLoading) {
      const interval = setInterval(updateDataIfSignificant, 5000)
      return () => clearInterval(interval)
    }
    return undefined
  }, [status.isLoading, updateDataIfSignificant])

  return status
}
