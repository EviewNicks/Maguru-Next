// Container.test.tsx
import { render, screen } from '@testing-library/react'
import Container from './Container'

describe('Container Component', () => {
  // Test untuk class perlu dimodifikasi karena menggunakan Tailwind
  it('applies default classes', () => {
    const { container } = render(
      <Container>
        <div>Test</div>
      </Container>
    )
    // Gunakan container.firstChild untuk mengecek class
    expect(container.firstChild).toHaveClass('mx-auto', 'xl:max-w-full')
  })

  it('applies default classes', () => {
    render(
      <Container>
        <div>Test</div>
      </Container>
    )
    const container = screen.getByText('Test').parentElement
    expect(container).toHaveClass('mx-auto', 'xl:max-w-full')
  })

  // Modifikasi serupa untuk test class lainnya
  it('merges custom className with default classes', () => {
    const { container } = render(
      <Container className="custom-class">
        <div>Test</div>
      </Container>
    )
    expect(container.firstChild).toHaveClass(
      'mx-auto',
      'xl:max-w-full',
      'custom-class'
    )
  })
})
