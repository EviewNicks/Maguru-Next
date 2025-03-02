// Container.test.tsx
import { render } from '@testing-library/react'
import Container from './Container'

// Mock lib/utils karena kita hanya perlu fungsi cn-nya
jest.mock('@/lib/utils', () => ({
  cn: (...classes: string[]) => classes.filter(Boolean).join(' '),
}))

describe('Container Component', () => {
  it('renders children correctly', () => {
    const { getByText } = render(
      <Container>
        <div>Test Content</div>
      </Container>
    )
    expect(getByText('Test Content')).toBeInTheDocument()
  })

  it('applies default classes', () => {
    const { container } = render(
      <Container>
        <div>Test</div>
      </Container>
    )
    // firstElementChild karena container dari render selalu membungkus dengan div tambahan
    const containerElement = container.firstElementChild
    expect(containerElement).toHaveClass('mx-auto', 'xl:max-w-full')
  })

  it('merges custom className with default classes', () => {
    const { container } = render(
      <Container className="custom-class">
        <div>Test</div>
      </Container>
    )
    const containerElement = container.firstElementChild
    expect(containerElement).toHaveClass(
      'mx-auto',
      'xl:max-w-full',
      'custom-class'
    )
  })

  it('handles undefined className correctly', () => {
    const { container } = render(
      <Container>
        <div>Test</div>
      </Container>
    )
    const containerElement = container.firstElementChild
    expect(containerElement).toHaveClass('mx-auto', 'xl:max-w-full')
    expect(containerElement).not.toHaveClass('undefined')
  })
})
