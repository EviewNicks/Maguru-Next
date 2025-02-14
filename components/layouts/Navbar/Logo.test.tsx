// Logo.test.tsx
import { render, screen } from '@testing-library/react'
import Logo from './Logo'

// Mock the image import
jest.mock('@/public/Logo/Logo-48-Light.png', () => ({
  src: '/mock-image.png',
  height: 36,
  width: 104,
}))

describe('Logo Component', () => {
  it('renders logo with correct link', () => {
    render(<Logo />)
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', '/')
  })

  it('renders image with correct attributes', () => {
    render(<Logo />)
    const image = screen.getByRole('img')
    expect(image).toHaveAttribute('alt', 'Contoh gambar')
    expect(image).toHaveAttribute('width', '104')
    expect(image).toHaveAttribute('height', '36')
  })

  it('renders as a button with link variant', () => {
    render(<Logo />)
    const button = screen.getByRole('button')
    expect(button).toHaveClass('variant-link')
    expect(button).toHaveClass('size-lg')
  })
})
