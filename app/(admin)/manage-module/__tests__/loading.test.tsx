import { render, screen } from '@testing-library/react'
import ModuleManagementLoading from '../loading'

// Mock the Skeleton component from UI
jest.mock('@/components/ui/skeleton', () => ({
  Skeleton: ({ className }: { className: string }) => (
    <div data-testid="skeleton" className={className} />
  ),
}))

describe('ModuleManagementLoading', () => {
  it('should render loading skeleton UI', () => {
    render(<ModuleManagementLoading />)

    // Verify skeleton components are rendered
    const skeletons = screen.getAllByTestId('skeleton')

    // Should have multiple skeletons (header, rows, pagination)
    expect(skeletons.length).toBeGreaterThan(10)
  })

  it('should render skeleton for table rows', () => {
    render(<ModuleManagementLoading />)

    // The component should render 5 rows by default (as per Array.from({ length: 5 }))
    const rowContainers = document.querySelectorAll('[class*="border-t p-2"]')
    // Header + 5 rows
    expect(rowContainers.length).toBeGreaterThanOrEqual(6)
  })

  it('should render skeleton for pagination', () => {
    const { container } = render(<ModuleManagementLoading />)

    // Should have a pagination section
    const paginationContainer = container.querySelector(
      '.border-t.p-4.flex.justify-between.items-center'
    )
    expect(paginationContainer).toBeInTheDocument()

    // Should have skeletons for pagination buttons
    const paginationButtons = paginationContainer?.querySelectorAll(
      '[data-testid="skeleton"]'
    )
    expect(paginationButtons?.length).toBeGreaterThanOrEqual(2)
  })
})
