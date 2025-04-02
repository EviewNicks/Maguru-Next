import { render, screen } from '@testing-library/react'
import ModuleManagementLayout from '../layout'

describe('ModuleManagementLayout', () => {
  it('should render children correctly', () => {
    render(
      <ModuleManagementLayout>
        <div data-testid="test-child">Test Child Content</div>
      </ModuleManagementLayout>
    )

    // Verify child content is rendered
    expect(screen.getByTestId('test-child')).toBeInTheDocument()
    expect(screen.getByText('Test Child Content')).toBeInTheDocument()
  })

  it('should have the correct wrapper class', () => {
    const { container } = render(
      <ModuleManagementLayout>
        <div>Test Content</div>
      </ModuleManagementLayout>
    )

    // Verify wrapper has correct classes
    const section = container.querySelector('section')
    expect(section).toHaveClass('h-full')
    expect(section).toHaveClass('w-full')
  })
})
