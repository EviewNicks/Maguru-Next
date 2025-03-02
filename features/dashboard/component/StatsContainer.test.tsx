import { render, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import StatsContainer from './StatsContainer'
import { fetchStatsData } from '../service/stats'

// Mock the stats service
jest.mock('../service/stats', () => ({
  fetchStatsData: jest.fn(),
}))

// Mock StatsCard component
jest.mock('./StatsCard', () => ({
  __esModule: true,
  default: ({ title, value }: { title: string; value: number }) => (
    <div data-testid="stats-card" data-title={title} data-value={value}>
      {title}: {value}
    </div>
  ),
}))

describe('StatsContainer', () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        cacheTime: 0,
      },
    },
  })

  const mockStatsData = [
    { title: 'Total Users', value: 1520 },
    { title: 'New Users (Last 7 Days)', value: 35 },
    { title: 'Active Admins', value: 5 },
  ]

  beforeEach(() => {
    jest.clearAllMocks()
    queryClient.clear()

    // Setup default mock implementation
    ;(fetchStatsData as jest.Mock).mockResolvedValue(mockStatsData)
  })

  const renderComponent = () => {
    return render(
      <QueryClientProvider client={queryClient}>
        <StatsContainer />
      </QueryClientProvider>
    )
  }

  it('renders all stats cards with correct data', async () => {
    renderComponent()

    // Wait for data to be loaded
    await waitFor(() => {
      expect(fetchStatsData).toHaveBeenCalled()
    })

    // Check if all stats cards are rendered
    const statsCards = screen.getAllByTestId('stats-card')
    expect(statsCards).toHaveLength(mockStatsData.length)

    // Verify each card's content matches the mock data
    mockStatsData.forEach((stat, index) => {
      expect(statsCards[index]).toHaveAttribute('data-title', stat.title)
      expect(statsCards[index]).toHaveAttribute(
        'data-value',
        stat.value.toString()
      )
    })
  })

  it('handles empty data', async () => {
    ;(fetchStatsData as jest.Mock).mockResolvedValue([])

    renderComponent()

    await waitFor(() => {
      expect(fetchStatsData).toHaveBeenCalled()
    })

    const statsCards = screen.queryAllByTestId('stats-card')
    expect(statsCards).toHaveLength(0)
  })

  it('uses correct grid layout classes', () => {
    const { container } = renderComponent()

    // Get the first div inside the container (which should be our grid container)
    const gridContainer = container.firstChild as HTMLElement
    expect(gridContainer).toHaveClass(
      'grid',
      'md:grid-cols-2',
      'lg:grid-cols-3',
      'gap-4'
    )
  })

  it('handles fetch error gracefully', async () => {
    ;(fetchStatsData as jest.Mock).mockRejectedValue(new Error('Fetch failed'))

    renderComponent()

    await waitFor(() => {
      expect(fetchStatsData).toHaveBeenCalled()
    })

    // Should render with empty state when error occurs
    const statsCards = screen.queryAllByTestId('stats-card')
    expect(statsCards).toHaveLength(0)
  })

  afterEach(() => {
    queryClient.clear()
  })
})
