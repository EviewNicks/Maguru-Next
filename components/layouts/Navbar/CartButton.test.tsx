// CartButton.test.tsx
import { render, screen } from '@testing-library/react'
import CartButton from '@/components/layouts/Navbar/CartButton'
import '@testing-library/jest-dom'

describe('CartButton', () => {
  test('renders CartButton with badge displaying number of items', () => {
    render(<CartButton />)
    const badge = screen.getByText('9')
    expect(badge).toBeInTheDocument()
  })
})
