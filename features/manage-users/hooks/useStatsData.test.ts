import { renderHook, waitFor } from '@testing-library/react'
import { useStatsData } from './useStatsData'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import * as reactQuery from '@tanstack/react-query'
import React from 'react'
import { fetchStatsData } from '../service/stats'

// Mock service yang digunakan hook
jest.mock('../service/stats', () => ({
  fetchStatsData: jest.fn(),
}))

// Mock untuk lucide-react icons
jest.mock('lucide-react', () => ({
  Users: jest.fn().mockReturnValue(null),
  Shield: jest.fn().mockReturnValue(null),
}))

// Mock manual untuk useQuery
jest.mock('@tanstack/react-query', () => {
  const actual = jest.requireActual('@tanstack/react-query')
  return {
    ...actual,
    useQuery: jest.fn(),
  }
})

describe('useStatsData hook', () => {
  beforeEach(() => {
    jest.clearAllMocks()

    // Mock data default
    const mockStatsData = [
      { title: 'Total Users', value: 120 },
      { title: 'New Users', value: 15 },
      { title: 'Active Admins', value: 5 },
    ]

    // Setup mock return value for fetchStatsData
    ;(fetchStatsData as jest.Mock).mockResolvedValue(mockStatsData)

    // Setup default mock untuk useQuery
    ;(reactQuery.useQuery as jest.Mock).mockReturnValue({
      data: mockStatsData,
      isLoading: false,
      error: null,
    })
  })

  const createWrapper = () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    })

    // Gunakan React.createElement untuk menghindari JSX parsing error
    return function TestWrapper({ children }: { children: React.ReactNode }) {
      return React.createElement(
        QueryClientProvider,
        { client: queryClient },
        children
      )
    }
  }

  it('mengambil data statistik dari API dengan benar', async () => {
    const wrapper = createWrapper()
    const { result } = renderHook(() => useStatsData(), { wrapper })

    // Menunggu data terambil
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    // Verifikasi bahwa useQuery dipanggil dengan parameter yang benar
    expect(reactQuery.useQuery).toHaveBeenCalledWith({
      queryKey: ['stats'],
      queryFn: fetchStatsData,
    })

    // Verifikasi data tersedia
    expect(result.current.statsMetrics).toHaveLength(3)
  })

  it('memetakan data ke format MetricCard dengan benar', async () => {
    const wrapper = createWrapper()
    const { result } = renderHook(() => useStatsData(), { wrapper })

    // Menunggu data terambil
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    // Verifikasi hasil pemetaan
    expect(result.current.statsMetrics).toHaveLength(3)

    // Verifikasi struktur MetricCard untuk Total Users
    expect(result.current.statsMetrics[0]).toEqual(
      expect.objectContaining({
        title: 'Total Users',
        value: 120,
        trend: 'up',
        color: 'cyan',
        detail: '120 total pengguna',
      })
    )

    // Verifikasi bahwa icons sudah dipetakan
    expect(result.current.statsMetrics[0].icon).toBeDefined()
  })

  it('menangani error dengan benar', async () => {
    // Setup mock untuk useQuery dengan error
    ;(reactQuery.useQuery as jest.Mock).mockReturnValue({
      data: [],
      isLoading: false,
      error: new Error('API Error'),
    })

    const wrapper = createWrapper()
    const { result } = renderHook(() => useStatsData(), { wrapper })

    // Menunggu error ditangkap
    await waitFor(() => expect(result.current.error).toBeTruthy())

    // Verifikasi data kosong
    expect(result.current.statsMetrics).toHaveLength(0)
  })

  it('mengembalikan data kosong jika tidak ada data dari API', async () => {
    // Setup mock untuk useQuery dengan data null
    ;(reactQuery.useQuery as jest.Mock).mockReturnValue({
      data: null,
      isLoading: false,
      error: null,
    })

    const wrapper = createWrapper()
    const { result } = renderHook(() => useStatsData(), { wrapper })

    // Menunggu loading selesai
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    // Verifikasi data kosong
    expect(result.current.statsMetrics).toHaveLength(0)
  })
})
