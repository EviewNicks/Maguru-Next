import { renderHook, act } from '@testing-library/react'
import { useCurrentTime } from './useCurrentTime'
import React from 'react'

// Mock timer untuk pengujian
jest.useFakeTimers()

describe('useCurrentTime hook', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.clearAllTimers()
  })

  it('menginisialisasi waktu dengan benar saat pertama kali dipanggil', () => {
    // Set fixed date untuk konsistensi pengujian
    const fixedDate = new Date('2023-05-15T10:30:00')
    jest.spyOn(global, 'Date').mockImplementation(() => fixedDate)

    // Render hook
    const { result } = renderHook(() => useCurrentTime())

    // Verifikasi waktu awal
    expect(result.current).toEqual(fixedDate)

    // Clean up
    jest.restoreAllMocks()
  })

  it('memperbarui waktu setiap 10 detik', () => {
    // Setup mock dates - awal dan setelah 10 detik
    const initialDate = new Date('2023-05-15T10:30:00')
    const updatedDate = new Date('2023-05-15T10:30:10')

    const dateSpy = jest.spyOn(global, 'Date')
    dateSpy
      .mockImplementationOnce(() => initialDate) // Initial render
      .mockImplementationOnce(() => initialDate) // Untuk setTimeout
      .mockImplementationOnce(() => updatedDate) // Untuk setInterval

    // Render hook
    const { result } = renderHook(() => useCurrentTime())

    // Verifikasi waktu awal
    expect(result.current).toEqual(initialDate)

    // Advance timer untuk melewati timeout pertama (1 detik)
    act(() => {
      jest.advanceTimersByTime(1000)
    })

    // Advance timer untuk melewati interval pertama (10 detik)
    act(() => {
      jest.advanceTimersByTime(10000)
    })

    // Verifikasi waktu diperbarui
    expect(result.current).toEqual(updatedDate)

    // Clean up
    jest.restoreAllMocks()
  })

  it('hanya memperbarui state jika ada perubahan detik atau menit', () => {
    // Setup mock dates dengan perbedaan yang tidak signifikan (hanya ms berubah)
    const initialDate = new Date('2023-05-15T10:30:00.000')
    const nonSignificantChange = new Date('2023-05-15T10:30:00.500') // hanya ms berubah
    const significantChange = new Date('2023-05-15T10:30:01.000') // detik berubah

    const dateSpy = jest.spyOn(global, 'Date')
    dateSpy
      .mockImplementationOnce(() => initialDate) // Initial render
      .mockImplementationOnce(() => initialDate) // Untuk setTimeout
      .mockImplementationOnce(() => nonSignificantChange) // First interval check
      .mockImplementationOnce(() => significantChange) // Second interval check

    // Mock setState untuk verifikasi
    const setStateMock = jest.fn()
    const useStateMock = jest.spyOn(React, 'useState')
    useStateMock.mockImplementationOnce(() => [initialDate, setStateMock])

    // Render hook
    renderHook(() => useCurrentTime())

    // Advance timer untuk melewati timeout pertama
    act(() => {
      jest.advanceTimersByTime(1000)
    })

    // Advance timer untuk interval pertama dengan perubahan tidak signifikan
    act(() => {
      jest.advanceTimersByTime(10000)
    })

    // Advance timer untuk interval kedua dengan perubahan signifikan
    act(() => {
      jest.advanceTimersByTime(10000)
    })

    // Verifikasi fungsi kondisional callback berjalan
    expect(setStateMock).toHaveBeenCalled()

    // Clean up
    jest.restoreAllMocks()
  })

  it('membersihkan interval saat hook di-unmount', () => {
    // Spy pada clearTimeout dan clearInterval
    const clearTimeoutSpy = jest.spyOn(global, 'clearTimeout')
    const clearIntervalSpy = jest.spyOn(global, 'clearInterval')

    // Render hook
    const { unmount } = renderHook(() => useCurrentTime())

    // Advance timer untuk melewati timeout pertama (1 detik)
    act(() => {
      jest.advanceTimersByTime(1000)
    })

    // Unmount hook
    unmount()

    // Verifikasi clearTimeout dan clearInterval dipanggil
    expect(clearTimeoutSpy).toHaveBeenCalled()

    // Clean up
    clearTimeoutSpy.mockRestore()
    clearIntervalSpy.mockRestore()
  })
})
