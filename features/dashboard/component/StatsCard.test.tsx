import { render, screen } from '@testing-library/react'
import StatsCard, { StatsLoadingCard } from './StatsCard'

// Mock the UI components
jest.mock('@/components/ui/card', () => ({
  Card: ({ children, className }: any) => (
    <div data-testid="card" className={className}>
      {children}
    </div>
  ),
  CardHeader: ({ children, className }: any) => (
    <div data-testid="card-header" className={className}>
      {children}
    </div>
  ),
  CardTitle: ({ children, className }: any) => (
    <div data-testid="card-title" className={className}>
      {children}
    </div>
  ),
  CardDescription: ({ children, className }: any) => (
    <div data-testid="card-description" className={className}>
      {children}
    </div>
  ),
}))

jest.mock('@/components/ui/skeleton', () => ({
  Skeleton: ({ className }: any) => (
    <div data-testid="skeleton" className={className} />
  ),
}))

describe('StatsCard', () => {
  const mockProps = {
    title: 'Total Users',
    value: 1520,
  }

  it('renders with correct props', () => {
    render(<StatsCard {...mockProps} />)
    
    expect(screen.getByText(mockProps.title)).toBeInTheDocument()
    expect(screen.getByText(mockProps.value.toString())).toBeInTheDocument()
  })

  it('applies correct styling classes', () => {
    render(<StatsCard {...mockProps} />)
    
    expect(screen.getByTestId('card')).toHaveClass('bg-muted')
    expect(screen.getByTestId('card-title')).toHaveClass('capitalize')
    expect(screen.getByTestId('card-description')).toHaveClass(
      'text-4xl',
      'font-extrabold',
      'text-primary'
    )
  })

  it('capitalizes the title', () => {
    const lowercaseTitle = 'test title'
    render(<StatsCard title={lowercaseTitle} value={100} />)
    
    const titleElement = screen.getByTestId('card-title')
    expect(titleElement).toHaveClass('capitalize')
  })
})

describe('StatsLoadingCard', () => {
  it('renders loading skeleton', () => {
    render(<StatsLoadingCard />)
    
    const skeletons = screen.getAllByTestId('skeleton')
    expect(skeletons).toHaveLength(3) // Should have 3 skeleton elements
    
    expect(screen.getByTestId('card')).toHaveClass('w-[300px]', 'h-[88px]')
  })

  it('has correct skeleton dimensions', () => {
    render(<StatsLoadingCard />)
    
    const skeletons = screen.getAllByTestId('skeleton')
    
    // Avatar skeleton
    expect(skeletons[0]).toHaveClass('h-12', 'w-12', 'rounded-full')
    // Title skeleton
    expect(skeletons[1]).toHaveClass('h-4', 'w-[150px]')
    // Subtitle skeleton
    expect(skeletons[2]).toHaveClass('h-4', 'w-[100px]')
  })
})