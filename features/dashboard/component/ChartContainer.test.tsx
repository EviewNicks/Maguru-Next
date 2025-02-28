import { render, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import ChartContainer from './ChartContainer'
import { processChartData } from '@/features/dashboard/service/charts'
import type { User } from '@/types/user'

// Mock the charts service
jest.mock('../service/charts', () => ({
  processChartData: jest.fn(),
}))

// Mock fetch
global.fetch = jest.fn()

describe('ChartContainer', () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        // cacheTime: 0,
        staleTime: 0,
      },
    },
  })

  // Update mock users to match User type
  const mockUsers: User[] = [
    {
      id: '1',
      name: 'User 1',
      email: 'user1@example.com',
      role: 'mahasiswa',
      status: 'active',
      createdAt: '2024-01-15T00:00:00.000Z',
    },
    {
      id: '2',
      name: 'User 2',
      email: 'user2@example.com',
      role: 'mahasiswa',
      status: 'active',
      createdAt: '2024-02-15T00:00:00.000Z',
    },
  ]

  const mockChartData = [
    { month: 'Jan', users: 1 },
    { month: 'Feb', users: 2 },
  ]

  beforeEach(() => {
    jest.clearAllMocks()
    queryClient.clear()

    // Setup fetch mock
    ;(fetch as jest.Mock).mockResolvedValue({
      json: () => Promise.resolve({ users: mockUsers }),
    })
    ;(processChartData as jest.Mock).mockReturnValue(mockChartData)
  })

  const renderComponent = () => {
    return render(
      <QueryClientProvider client={queryClient}>
        <ChartContainer />
      </QueryClientProvider>
    )
  }

  it('renders the title correctly', () => {
    renderComponent()
    expect(screen.getByText('Monthly User Growth')).toBeInTheDocument()
  })

  it('fetches users data and processes it correctly', async () => {
    renderComponent()

    // Wait for the query to complete
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/users')
    })

    // Wait for processChartData to be called with the mock data
    await waitFor(() => {
      expect(processChartData).toHaveBeenCalledWith(mockUsers)
    })
  })

  it('renders the chart with correct data', async () => {
    renderComponent()

    // Wait for data to be loaded
    await waitFor(() => {
      expect(screen.getByTestId('responsive-container')).toBeInTheDocument()
    })

    // Check for mocked chart components using correct test IDs
    expect(screen.getByTestId('mock-CartesianGrid')).toBeInTheDocument()
    expect(screen.getByTestId('mock-XAxis')).toBeInTheDocument()
    expect(screen.getByTestId('mock-YAxis')).toBeInTheDocument()
    expect(screen.getByTestId('mock-Bar')).toBeInTheDocument()
  })

  it('handles API error gracefully', async () => {
    // Mock API error
    ;(fetch as jest.Mock).mockRejectedValue(new Error('API Error'))

    renderComponent()

    await waitFor(() => {
      expect(screen.getByTestId('responsive-container')).toBeInTheDocument()
    })
  })

  it('renders empty chart when no data is available', async () => {
    // Mock empty data response
    ;(fetch as jest.Mock).mockResolvedValue({
      json: () => Promise.resolve({ users: [] }),
    })
    ;(processChartData as jest.Mock).mockReturnValue([])

    renderComponent()

    await waitFor(() => {
      expect(screen.getByTestId('responsive-container')).toBeInTheDocument()
    })
  })

  afterEach(() => {
    queryClient.clear()
  })
})
