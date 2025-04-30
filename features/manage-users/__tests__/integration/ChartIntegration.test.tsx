import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { PerformanceChart } from '../../components/ui/PerformanceChart'
import { useChartData } from '../../hooks/useChartData'
import { ChartDataPoint } from '../../hooks/useChartData'

// Mock useChartData hook
jest.mock('../../hooks/useChartData')

// Setup QueryClient untuk test
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
})

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
)

// Mock data untuk pengujian
const mockChartData: ChartDataPoint[] = [
  { month: 'Jan', users: 12 },
  { month: 'Feb', users: 15 },
  { month: 'Mar', users: 19 },
  { month: 'Apr', users: 5 },
]

describe('PerformanceChart Integration Test', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('displays chart correctly with data from useChartData', async () => {
    // Setup mock
    ;(useChartData as jest.Mock).mockReturnValue({
      chartData: mockChartData,
      isLoading: false,
      error: null,
    })

    render(<PerformanceChart />, { wrapper })

    // Tunggu komponen dirender dengan data
    await waitFor(() => {
      const chart = screen.getByTestId('performance-chart')
      expect(chart).toBeInTheDocument()
    })

    // Periksa apakah judul chart ditampilkan
    expect(screen.getByText('Monthly User Growth 2025')).toBeInTheDocument()

    // Periksa apakah badge LIVE ditampilkan
    expect(screen.getByText('LIVE')).toBeInTheDocument()

    // Periksa apakah system load ditampilkan
    expect(screen.getByText('System Load')).toBeInTheDocument()
    expect(screen.getByText('35%')).toBeInTheDocument()
  })

  it('shows loading state while data is being fetched', async () => {
    // Setup mock untuk state loading
    ;(useChartData as jest.Mock).mockReturnValue({
      chartData: [],
      isLoading: true,
      error: null,
    })

    render(<PerformanceChart />, { wrapper })

    // Cek apakah indikator loading ditampilkan
    const loadingIndicator = screen.getByTestId('loading-spinner')
    expect(loadingIndicator).toBeInTheDocument()
  })

  it('shows error state when data fetching fails', async () => {
    // Setup mock untuk state error
    ;(useChartData as jest.Mock).mockReturnValue({
      chartData: [],
      isLoading: false,
      error: new Error('Failed to fetch data'),
    })

    render(<PerformanceChart />, { wrapper })

    // Cek apakah pesan error ditampilkan
    const errorMessage = screen.getByTestId('chart-error')
    expect(errorMessage).toBeInTheDocument()
    expect(errorMessage).toHaveTextContent(/gagal|failed/i)
  })

  it('handles empty data gracefully', async () => {
    // Setup mock untuk data kosong tetapi tidak loading atau error
    ;(useChartData as jest.Mock).mockReturnValue({
      chartData: [],
      isLoading: false,
      error: null,
    })

    render(<PerformanceChart />, { wrapper })

    // Komponen tetap harus dirender meskipun tanpa data
    expect(screen.getByTestId('performance-chart')).toBeInTheDocument()

    // Judul chart tetap ditampilkan
    expect(screen.getByText('Monthly User Growth 2025')).toBeInTheDocument()
  })
})
