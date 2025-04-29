import { renderHook, act } from '@testing-library/react'
import { useSystemStatus } from './useSystemStatus'

// Mock timer functions
jest.useFakeTimers()

describe('useSystemStatus', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Reset timer mocks
    jest.clearAllTimers()
  })

  it('initializes with loading state', () => {
    const { result } = renderHook(() => useSystemStatus())

    // Verify initial loading state
    expect(result.current.isLoading).toBe(true)

    // Verify default values exist
    expect(result.current.systemStatus).toBeDefined()
    expect(result.current.cpuUsage).toBeDefined()
    expect(result.current.memoryUsage).toBeDefined()
    expect(result.current.networkStatus).toBeDefined()
    expect(result.current.securityLevel).toBeDefined()
  })

  it('changes to non-loading state after initial timeout', async () => {
    const { result } = renderHook(() => useSystemStatus())

    // Verify initial state
    expect(result.current.isLoading).toBe(true)

    // Advance timers to trigger the timeout
    act(() => {
      jest.advanceTimersByTime(2000)
    })

    // Verify loading has changed to false
    expect(result.current.isLoading).toBe(false)
  })

  it('updates values periodically after loading is complete', async () => {
    // Mock Math.random untuk memberikan nilai yang akan menghasilkan perubahan signifikan (>5)
    const originalMathRandom = Math.random

    // Menggunakan nilai tinggi (0.9) untuk memastikan perubahan signifikan
    Math.random = jest.fn(() => 0.9)

    const { result } = renderHook(() => useSystemStatus())

    // Advance past the initial loading period
    act(() => {
      jest.advanceTimersByTime(2000)
    })

    // Sekarang loading sudah selesai, ambil nilai awal
    const initialValues = { ...result.current }

    // Pastikan isLoading sudah false
    expect(initialValues.isLoading).toBe(false)

    // Lakukan act untuk menjalankan interval dan update nilai
    act(() => {
      // Trigger interval
      jest.advanceTimersByTime(5000)
    })

    // Nilai harus berubah karena Math.random sekarang 0.9 (perubahan signifikan)
    expect(result.current).not.toEqual(initialValues)

    // With Math.random() = 0.9:
    // - cpuUsage should be around 30 + (0.9 * 30) = 57
    // - memoryUsage should be around 60 + (0.9 * 20) = 78
    // - dll.
    expect(result.current.cpuUsage).toBeCloseTo(57, 1)
    expect(result.current.memoryUsage).toBeCloseTo(78, 1)
    expect(result.current.networkStatus).toBeCloseTo(93, 1)
    expect(result.current.systemStatus).toBeCloseTo(89, 1)
    expect(result.current.securityLevel).toBeCloseTo(83, 1)

    // Kembalikan fungsi Math.random asli
    Math.random = originalMathRandom
  })

  it('cleans up interval when unmounted', () => {
    // Spy on clearInterval
    const clearIntervalSpy = jest.spyOn(global, 'clearInterval')

    const { unmount } = renderHook(() => useSystemStatus())

    // Advance past the initial loading period to start interval
    act(() => {
      jest.advanceTimersByTime(2000)
    })

    // Unmount the hook
    unmount()

    // Verify clearInterval was called
    expect(clearIntervalSpy).toHaveBeenCalled()

    // Clean up
    clearIntervalSpy.mockRestore()
  })
})
