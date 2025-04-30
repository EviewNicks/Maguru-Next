import { render, screen } from '@testing-library/react'
import { SystemOverview } from './SystemOverview'
import { useStatsData } from '../../hooks/useStatsData'
import userEvent from '@testing-library/user-event'
import { Activity, LucideIcon } from 'lucide-react'

// Interface untuk komponen mock
interface MetricCardProps {
  title: string
  value: number | string
  detail: string
  icon?: LucideIcon
  trend?: string
  color?: string
  showPercent?: boolean
}

interface ProcessRowProps {
  pid: string
  name: string
  user: string
  cpu: number
  memory: number
  status: string
}

interface StorageItemProps {
  name: string
  total: number
  used: number
  type: string
}

// Mock untuk useStatsData hook
jest.mock('../../hooks/useStatsData')

// Mock untuk komponen yang tidak perlu diuji secara mendalam
jest.mock('../ui/PerformanceChart', () => ({
  PerformanceChart: () => (
    <div data-testid="performance-chart">Performance Chart</div>
  ),
}))

jest.mock('../ui/UserTable', () => ({
  __esModule: true,
  default: () => <div data-testid="user-table">User Table</div>,
}))

jest.mock('../ui/MetricCard', () => ({
  MetricCard: ({
    title,
    value,
    detail,
    showPercent = false,
  }: MetricCardProps) => (
    <div data-testid="metric-card" className="metric-card">
      <div
        className="title"
        data-testid={`metric-title-${title.replace(/\s+/g, '-').toLowerCase()}`}
      >
        {title}
      </div>
      <div className="value" data-testid={`metric-value-${value}`}>
        {value}
      </div>
      <div className="detail">{detail}</div>
      {showPercent && <div className="percent">%</div>}
    </div>
  ),
}))

jest.mock('../ui/ProcessRow', () => ({
  ProcessRow: ({ pid, name, user, cpu, memory, status }: ProcessRowProps) => (
    <div data-testid="process-row" className="process-row">
      <div>{pid}</div>
      <div>{name}</div>
      <div>{user}</div>
      <div>{cpu}</div>
      <div>{memory}</div>
      <div>{status}</div>
    </div>
  ),
}))

jest.mock('../ui/StorageItem', () => ({
  StorageItem: ({ name, total, used, type }: StorageItemProps) => (
    <div data-testid="storage-item" className="storage-item">
      <div>{name}</div>
      <div>
        {used} / {total} GB
      </div>
      <div>{type}</div>
    </div>
  ),
}))

describe('SystemOverview', () => {
  beforeEach(() => {
    jest.clearAllMocks()

    // Mock default untuk useStatsData
    ;(useStatsData as jest.Mock).mockReturnValue({
      statsMetrics: null,
      isLoading: false,
      error: null,
    })
  })

  it('renders without crashing', () => {
    render(<SystemOverview />)

    // Verifikasi judul komponen ditampilkan
    expect(
      screen.getByText('System Overview & User Statistics')
    ).toBeInTheDocument()

    // Verifikasi badge "LIVE" ditampilkan
    expect(screen.getByText('LIVE')).toBeInTheDocument()
  })

  it('displays loading state correctly', () => {
    // Mock loading state
    ;(useStatsData as jest.Mock).mockReturnValue({
      statsMetrics: null,
      isLoading: true,
      error: null,
    })

    render(<SystemOverview />)

    // Verifikasi element skeleton loading ditampilkan
    // Perbarui selector untuk mencocokkan implementasi aktual
    const skeletons = document.querySelectorAll('[class*="bg-slate-700"]')
    expect(skeletons.length).toBeGreaterThan(0)
  })

  it('displays statistics when data is loaded', () => {
    // Mock data statistics
    const mockStatsMetrics = [
      {
        title: 'Total Users',
        value: 120,
        icon: Activity,
        trend: 'up',
        color: 'cyan',
        detail: '15 new this week',
      },
      {
        title: 'Active Users',
        value: 85,
        icon: Activity,
        trend: 'stable',
        color: 'purple',
        detail: '92% retention rate',
      },
      {
        title: 'User Growth',
        value: 14.5,
        icon: Activity,
        trend: 'up',
        color: 'blue',
        detail: '+3.2% from last month',
      },
    ]

    ;(useStatsData as jest.Mock).mockReturnValue({
      statsMetrics: mockStatsMetrics,
      isLoading: false,
      error: null,
    })

    render(<SystemOverview />)

    // Verifikasi metric cards ditampilkan
    const metricCards = screen.getAllByTestId('metric-card')
    expect(metricCards.length).toBe(3)

    // Verifikasi data statistik ditampilkan
    expect(screen.getByText('Total Users')).toBeInTheDocument()
    expect(screen.getByText('120')).toBeInTheDocument()
    expect(screen.getByText('15 new this week')).toBeInTheDocument()

    expect(screen.getByText('Active Users')).toBeInTheDocument()
    expect(screen.getByText('85')).toBeInTheDocument()
    expect(screen.getByText('92% retention rate')).toBeInTheDocument()

    expect(screen.getByText('User Growth')).toBeInTheDocument()
    expect(screen.getByText('14.5')).toBeInTheDocument()
    expect(screen.getByText('+3.2% from last month')).toBeInTheDocument()
  })

  it('displays error message when data fetch fails', () => {
    // Mock error state
    ;(useStatsData as jest.Mock).mockReturnValue({
      statsMetrics: null,
      isLoading: false,
      error: new Error('Failed to fetch data'),
    })

    render(<SystemOverview />)

    // Verifikasi pesan error ditampilkan
    expect(
      screen.getByText(/Gagal memuat data statistik pengguna/i)
    ).toBeInTheDocument()
  })

  it('displays fallback metrics when no stats data available', () => {
    // Mock empty stats data but not loading
    ;(useStatsData as jest.Mock).mockReturnValue({
      statsMetrics: [],
      isLoading: false,
      error: null,
    })

    render(<SystemOverview />)

    // Verifikasi fallback metrics ditampilkan dengan menggunakan data-testid
    expect(screen.getByTestId('metric-title-cpu-usage')).toBeInTheDocument()
    expect(screen.getByTestId('metric-title-memory')).toBeInTheDocument()
    expect(screen.getByTestId('metric-title-network')).toBeInTheDocument()

    // Verifikasi detail dari fallback metric
    expect(screen.getByText('3.8 GHz | 12 Cores')).toBeInTheDocument()
    expect(screen.getByText('16.4 GB / 24 GB')).toBeInTheDocument()
    expect(screen.getByText('1.2 GB/s | 42ms')).toBeInTheDocument()
  })

  it('allows switching between tabs', async () => {
    const user = userEvent.setup()
    render(<SystemOverview />)

    // Tab Performance ditampilkan secara default
    expect(screen.getByTestId('performance-chart')).toBeInTheDocument()

    // Klik tab Processes
    await user.click(screen.getByRole('tab', { name: /processes/i }))

    // Verifikasi konten tab Processes ditampilkan
    expect(screen.getByText('PID')).toBeInTheDocument()
    expect(screen.getByText('Process')).toBeInTheDocument()

    // Cek Process Rows ditampilkan
    const processRows = screen.getAllByTestId('process-row')
    expect(processRows.length).toBeGreaterThan(0)
    expect(screen.getByText('system_core.exe')).toBeInTheDocument()

    // Klik tab Users
    await user.click(screen.getByRole('tab', { name: /users/i }))

    // Verifikasi konten tab Users ditampilkan
    expect(screen.getByTestId('user-table')).toBeInTheDocument()

    // Klik tab Storage
    await user.click(screen.getByRole('tab', { name: /storage/i }))

    // Verifikasi konten tab Storage ditampilkan
    const storageItems = screen.getAllByTestId('storage-item')
    expect(storageItems.length).toBeGreaterThan(0)
    expect(screen.getByText('System Drive (C:)')).toBeInTheDocument()
    expect(screen.getByText('Data Drive (D:)')).toBeInTheDocument()
  })

  it('renders refresh button', async () => {
    const user = userEvent.setup()
    render(<SystemOverview />)

    // Dapatkan tombol refresh
    const refreshButton = screen.getByRole('button', { name: '' })

    // Klik tombol refresh
    await user.click(refreshButton)

    // Tidak dapat menguji apakah refresh dipanggil karena tidak ada callback yang di-mock
    // tapi kita bisa memverifikasi bahwa tombol dapat diklik
    expect(refreshButton).toBeInTheDocument()
  })

  it('accepts and displays custom prop values', () => {
    // Mock empty stats untuk memaksa fallback ke nilai props
    ;(useStatsData as jest.Mock).mockReturnValue({
      statsMetrics: [],
      isLoading: false,
      error: null,
    })

    // Render dengan props kustom
    render(<SystemOverview cpuUsage={75} memoryUsage={80} networkStatus={95} />)

    // Verifikasi fallback metrics ditampilkan
    const metricCards = screen.getAllByTestId('metric-card')
    expect(metricCards.length).toBe(3)

    // Verifikasi nilai props ditampilkan dalam fallback metrics dengan data-testid
    expect(screen.getByTestId('metric-title-cpu-usage')).toBeInTheDocument()
    expect(screen.getByTestId('metric-value-75')).toBeInTheDocument()

    expect(screen.getByTestId('metric-title-memory')).toBeInTheDocument()
    expect(screen.getByTestId('metric-value-80')).toBeInTheDocument()

    expect(screen.getByTestId('metric-title-network')).toBeInTheDocument()
    expect(screen.getByTestId('metric-value-95')).toBeInTheDocument()
  })

  it('displays charts legend correctly', () => {
    render(<SystemOverview />)

    // Verifikasi legend untuk chart ditampilkan dengan getAllByText dan memeriksa panjangnya
    const legendItems = screen.getAllByText(/CPU|Memory|Network/i)
    expect(legendItems.length).toBeGreaterThanOrEqual(3)

    // Verifikasi indikator warna
    const colorIndicators = document.querySelectorAll(
      '[class*="h-2 w-2 rounded-full"]'
    )
    expect(colorIndicators.length).toBeGreaterThanOrEqual(3)
  })
})
