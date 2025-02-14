// __tests__/unit/components/CartButton.test.tsx 
import { render, screen, waitFor } from '@testing-library/react'
import CartButton from '@/components/layouts/Navbar/CartButton'
import '@testing-library/jest-dom'

describe('CartButton', () => {
  test('renders CartButton with badge displaying number of items', async () => {
    render(<CartButton />)
    // Karena CartButton adalah fungsi async, gunakan waitFor untuk menunggu badge muncul
    const badge = await waitFor(() => screen.getByText('9'))
    expect(badge).toBeInTheDocument()
  })
})
