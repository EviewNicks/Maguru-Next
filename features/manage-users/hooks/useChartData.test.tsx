import { renderHook, waitFor } from '@testing-library/react'
import { useChartData } from './useChartData'
import { processChartData } from '../service/charts'
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from '@tanstack/react-query'
import React from 'react'

// Mock untuk service charts
jest.mock('../service/charts')

// Mock untuk @tanstack/react-query
jest.mock('@tanstack/react-query', () => {
  const actual = jest.requireActual('@tanstack/react-query')
  return {
    ...actual,
    useQuery: jest.fn().mockReturnValue({
      data: { users: [] },
      isLoading: false,
      error: null,
    }),
  }
})

// Mock untuk fetch API
global.fetch = jest.fn() as jest.Mock

describe('useChartData hook', () => {
  let queryClient: QueryClient
  let wrapper: React.FC<React.PropsWithChildren<object>>

  // Simpan referensi ke mock useQuery untuk digunakan dalam test
  const mockUseQuery = useQuery as jest.Mock

  beforeEach(() => {
    jest.clearAllMocks()

    // Setup QueryClient untuk test
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    })

    // Setup wrapper dengan QueryClientProvider
    wrapper = ({ children }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )

    // Mock implementasi processChartData
    const mockChartData = [
      { month: 'Jan', users: 1 },
      { month: 'Feb', users: 2 },
      { month: 'Mar', users: 1 },
    ]

    ;(processChartData as jest.Mock).mockReturnValue(mockChartData)

    // Setup mock untuk useQuery dengan data yang dibutuhkan
    mockUseQuery.mockReturnValue({
      data: {
        users: [
          { id: '1', createdAt: '2023-01-15T00:00:00.000Z' },
          { id: '2', createdAt: '2023-02-20T00:00:00.000Z' },
          { id: '3', createdAt: '2023-02-25T00:00:00.000Z' },
          { id: '4', createdAt: '2023-03-10T00:00:00.000Z' },
        ],
      },
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    })
  })

  it('fetches and processes chart data correctly', async () => {
    const { result } = renderHook(() => useChartData(), { wrapper })

    // Tunggu sampai data tersedia
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    // Verifikasi bahwa processChartData dipanggil
    expect(processChartData).toHaveBeenCalled()

    // Memeriksa hasil hook - seharusnya menampilkan data yang dihasilkan oleh processChartData
    expect(result.current.chartData).toHaveLength(3) // 3 bulan dari data mock

    // Memeriksa struktur data hasil
    const firstPoint = result.current.chartData[0]
    expect(firstPoint).toHaveProperty('month', 'Jan')
    expect(firstPoint).toHaveProperty('users', 1)
  })

  it('handles empty data gracefully', async () => {
    // Mock processChartData mengembalikan array kosong
    ;(processChartData as jest.Mock).mockReturnValue([])

    // Setup mock untuk useQuery dengan data kosong
    mockUseQuery.mockReturnValue({
      data: { users: [] },
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    })

    const { result } = renderHook(() => useChartData(), { wrapper })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    // Seharusnya menghasilkan 12 bulan (Jan-Dec) sebagai data dummy
    expect(result.current.chartData).toHaveLength(12)

    // Memeriksa bahwa semua data memiliki struktur yang benar
    result.current.chartData.forEach((point) => {
      expect(point).toHaveProperty('month')
      expect(point).toHaveProperty('users')
      expect(typeof point.users).toBe('number')
    })
  })

  it('handles API errors', async () => {
    // Setup mock untuk useQuery dengan error
    mockUseQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error('API Error'),
      refetch: jest.fn(),
    })

    // Mock processChartData return empty array karena data undefined
    ;(processChartData as jest.Mock).mockReturnValue([])

    const { result } = renderHook(() => useChartData(), { wrapper })

    await waitFor(() => {
      expect(result.current.error).toBeTruthy()
    })

    // Masih seharusnya menghasilkan data default
    expect(result.current.chartData).toBeDefined()
    expect(result.current.chartData).toHaveLength(12) // 12 bulan default data
  })

  it('provides loading state while fetching data', async () => {
    // Setup mock untuk useQuery dengan loading state
    mockUseQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
      refetch: jest.fn(),
    })

    const { result } = renderHook(() => useChartData(), { wrapper })

    // Memeriksa loading state awal
    expect(result.current.isLoading).toBe(true)

    // Ubah mock untuk simulasi data yang sudah diambil
    mockUseQuery.mockReturnValue({
      data: { users: [] },
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    })

    // Kita tidak perlu memanggil refetch karena useChartData tidak mengekspos metode tersebut
    // Sebagai gantinya, kita bisa me-render ulang hook untuk mendapatkan nilai baru
    const { result: newResult } = renderHook(() => useChartData(), { wrapper })

    // Tunggu sampai loading selesai
    await waitFor(() => {
      expect(newResult.current.isLoading).toBe(false)
    })

    // Memeriksa bahwa data tersedia setelah loading
    expect(newResult.current.chartData).toBeDefined()
    expect(newResult.current.error).toBeNull()
  })
})
