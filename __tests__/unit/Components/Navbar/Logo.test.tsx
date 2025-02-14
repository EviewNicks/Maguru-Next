// __tests__/unit/components/Logo.test.tsx
import { render, screen } from '@testing-library/react'
import Logo from '@/components/layouts/Navbar/Logo'
import '@testing-library/jest-dom'

describe('Logo', () => {
  test('renders logo with link', () => {
    render(<Logo />)
    const logoLink = screen.getByRole('link')
    expect(logoLink).toBeInTheDocument()
  })
})
