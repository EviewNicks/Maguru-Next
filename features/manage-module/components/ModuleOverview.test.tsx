import { render, screen, fireEvent } from '@testing-library/react'
import { ModuleOverview } from './ModuleOverview'

// Mock komponen UI yang digunakan
jest.mock('@/components/ui/card', () => ({
  Card: ({ children, className }) => (
    <div data-testid="mock-card" className={className}>
      {children}
    </div>
  ),
  CardHeader: ({ children, className }) => (
    <div data-testid="mock-card-header" className={className}>
      {children}
    </div>
  ),
  CardTitle: ({ children, className }) => (
    <div data-testid="mock-card-title" className={className}>
      {children}
    </div>
  ),
  CardContent: ({ children, className }) => (
    <div data-testid="mock-card-content" className={className}>
      {children}
    </div>
  ),
}))

jest.mock('@/components/ui/badge', () => ({
  Badge: ({ children, variant, className }) => (
    <span data-testid="mock-badge" data-variant={variant} className={className}>
      {children}
    </span>
  ),
}))

jest.mock('@/components/ui/button', () => ({
  Button: ({ children, variant, size, className, onClick }) => (
    <button
      data-testid="mock-button"
      data-variant={variant}
      data-size={size}
      className={className}
      onClick={onClick}
    >
      {children}
    </button>
  ),
}))

// Mock MetricCard
jest.mock('@/features/manage-users/components/ui/MetricCard', () => ({
  MetricCard: ({ title, value, icon: Icon, trend, color, detail }) => (
    <div data-testid="mock-metric-card">
      <h3>{title}</h3>
      <div>{value}</div>
      {Icon && <Icon data-testid="mock-icon" />}
      <div data-trend={trend} data-color={color}>
        {detail}
      </div>
    </div>
  ),
}))

// Mock Lucide icons
jest.mock('lucide-react', () => ({
  BarChart2: () => <span data-testid="mock-barchart-icon">BarChart2</span>,
  BookOpen: () => <span data-testid="mock-bookopen-icon">BookOpen</span>,
  LayoutGrid: () => <span data-testid="mock-layoutgrid-icon">LayoutGrid</span>,
  RefreshCw: () => <span data-testid="mock-refreshcw-icon">RefreshCw</span>,
  BookOpenCheck: () => (
    <span data-testid="mock-bookopencheck-icon">BookOpenCheck</span>
  ),
}))

describe('ModuleOverview', () => {
  it('should render card with correct title', () => {
    render(<ModuleOverview />)

    // Verifikasi judul card
    expect(screen.getByText('Manajemen Modul')).toBeInTheDocument()

    // Verifikasi icon pada judul
    expect(screen.getByTestId('mock-barchart-icon')).toBeInTheDocument()
  })

  it('should render badge with LIVE status', () => {
    render(<ModuleOverview />)

    // Verifikasi badge
    const badge = screen.getByTestId('mock-badge')
    expect(badge).toBeInTheDocument()
    expect(badge).toHaveTextContent('LIVE')
    expect(badge).toHaveAttribute('data-variant', 'outline')
  })

  it('should render refresh button', () => {
    render(<ModuleOverview />)

    // Verifikasi tombol refresh
    const refreshButton = screen.getByTestId('mock-button')
    expect(refreshButton).toBeInTheDocument()
    expect(screen.getByTestId('mock-refreshcw-icon')).toBeInTheDocument()
  })

  it('should render three metric cards with correct data', () => {
    render(<ModuleOverview />)

    // Verifikasi jumlah MetricCard
    const metricCards = screen.getAllByTestId('mock-metric-card')
    expect(metricCards).toHaveLength(3)

    // Verifikasi title MetricCard
    expect(screen.getByText('Total Modul')).toBeInTheDocument()
    expect(screen.getByText('Modul Baru (7 Hari)')).toBeInTheDocument()
    expect(screen.getByText('Modul Aktif')).toBeInTheDocument()

    // Verifikasi nilai MetricCard
    const values = metricCards.map(
      (card) =>
        Array.from(card.childNodes).find(
          (node) => node.textContent && !isNaN(parseInt(node.textContent))
        )?.textContent
    )

    expect(values).toContain('5') // Total Modul
    expect(values).toContain('0') // Modul Baru
    expect(values).toContain('2') // Modul Aktif
  })

  it('should render details in metric cards', () => {
    render(<ModuleOverview />)

    // Verifikasi detail di MetricCard
    expect(screen.getByText('5 total modul')).toBeInTheDocument()
    expect(
      screen.getByText('0 modul baru (7 hari terakhir)')
    ).toBeInTheDocument()
    expect(screen.getByText('2 modul aktif')).toBeInTheDocument()
  })
})
