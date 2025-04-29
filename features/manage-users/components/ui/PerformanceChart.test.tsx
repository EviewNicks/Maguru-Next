import { render, screen, waitFor } from '@testing-library/react'
import { PerformanceChart } from './PerformanceChart'
import { useChartData } from '../../hooks/useChartData'
import { ReactNode } from 'react'

// Mock hook useChartData
jest.mock('../../hooks/useChartData', () => ({
  useChartData: jest.fn(),
}))

// Mock komponen Chart dari recharts yang mungkin menyebabkan masalah
jest.mock('recharts', () => {
  const OriginalModule = jest.requireActual('recharts')
  return {
    ...OriginalModule,
    ResponsiveContainer: ({
      children,
      width,
      height,
    }: {
      children: ReactNode
      width: string | number
      height: string | number
    }) => (
      <div
        data-testid="recharts-responsive-container"
        style={{ width, height }}
      >
        {children}
      </div>
    ),
    CartesianGrid: () => <div data-testid="recharts-cartesian-grid" />,
    XAxis: () => <div data-testid="recharts-xaxis" />,
    BarChart: ({ children }: { children: ReactNode }) => (
      <div data-testid="recharts-bar-chart">{children}</div>
    ),
    Bar: () => <div data-testid="recharts-bar" />,
  }
})

/**
 * Unit Test untuk PerformanceChart Komponen yang diperbarui dengan ShadcnUI Chart
 *
 * Pengujian ini memastikan bahwa:
 * 1. Komponen dapat dirender tanpa error
 * 2. Loading state ditampilkan dengan benar
 * 3. Error state ditampilkan dengan benar
 * 4. Chart container ditampilkan dengan benar saat ada data
 */
describe('PerformanceChart', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders loading state correctly', () => {
    // Mock loading state
    ;(useChartData as jest.Mock).mockReturnValue({
      chartData: [],
      isLoading: true,
      error: null,
    })

    render(<PerformanceChart />)

    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()
    expect(screen.getByText(/loading chart data/i)).toBeInTheDocument()
  })

  it('renders error state correctly', () => {
    // Mock error state
    ;(useChartData as jest.Mock).mockReturnValue({
      chartData: [],
      isLoading: false,
      error: new Error('Test error'),
    })

    render(<PerformanceChart />)

    expect(screen.getByTestId('chart-error')).toBeInTheDocument()
    expect(screen.getByText(/test error/i)).toBeInTheDocument()
  })

  it('renders chart with data correctly', async () => {
    // Mock data berhasil dimuat
    ;(useChartData as jest.Mock).mockReturnValue({
      chartData: [
        { month: 'Jan', users: 12 },
        { month: 'Feb', users: 15 },
        { month: 'Mar', users: 19 },
        { month: 'Apr', users: 5 },
      ],
      isLoading: false,
      error: null,
    })

    render(<PerformanceChart />)

    // Tunggu chart dirender
    await waitFor(() => {
      // Chart container harus ada
      expect(screen.getByTestId('performance-chart')).toBeInTheDocument()

      // Judul chart harus sesuai
      expect(screen.getByText(/monthly user growth 2025/i)).toBeInTheDocument()

      // Badge LIVE harus ada
      expect(screen.getByText(/live/i)).toBeInTheDocument()

      // System Load harus ada
      expect(screen.getByText(/system load/i)).toBeInTheDocument()
      expect(screen.getByText(/41%/i)).toBeInTheDocument()
    })
  })

  it('handles empty data correctly', async () => {
    // Mock data kosong
    ;(useChartData as jest.Mock).mockReturnValue({
      chartData: [],
      isLoading: false,
      error: null,
    })

    render(<PerformanceChart />)

    // Meskipun data kosong, chart harus tetap ditampilkan
    await waitFor(() => {
      expect(screen.getByTestId('performance-chart')).toBeInTheDocument()
      expect(screen.getByText(/monthly user growth 2025/i)).toBeInTheDocument()
    })
  })
})
