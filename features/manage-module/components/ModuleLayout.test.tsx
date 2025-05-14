import { render, screen } from '@testing-library/react'
import { ModuleLayout } from './ModuleLayout'

// Mock AdminSidebar
jest.mock('../../../components/layouts/AdminSidebar', () => ({
  AdminSidebar: () => (
    <div data-testid="mock-admin-sidebar">Mock AdminSidebar</div>
  ),
}))

describe('ModuleLayout', () => {
  it('should render the AdminSidebar', () => {
    render(
      <ModuleLayout>
        <div>Test Child Content</div>
      </ModuleLayout>
    )

    // Verifikasi AdminSidebar dirender
    expect(screen.getByTestId('mock-admin-sidebar')).toBeInTheDocument()
  })

  it('should render children content', () => {
    render(
      <ModuleLayout>
        <div data-testid="test-child">Test Child Content</div>
      </ModuleLayout>
    )

    // Verifikasi children dirender
    expect(screen.getByTestId('test-child')).toBeInTheDocument()
    expect(screen.getByText('Test Child Content')).toBeInTheDocument()
  })

  it('should have the correct layout structure and styling', () => {
    const { container } = render(
      <ModuleLayout>
        <div>Test Content</div>
      </ModuleLayout>
    )

    // Verifikasi struktur dan styling
    const layoutContainer = container.firstChild
    expect(layoutContainer).toHaveClass('flex')
    expect(layoutContainer).toHaveClass('h-full')
    expect(layoutContainer).toHaveClass('bg-[#09090b]')
    expect(layoutContainer).toHaveClass('text-white')

    // Verifikasi ada content container
    const contentContainer = screen.getByText('Test Content').closest('div')
    expect(contentContainer).toBeInTheDocument()
  })
})
