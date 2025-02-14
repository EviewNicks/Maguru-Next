// __tests__/unit/components/NavSearch.test.tsx
import { render, screen } from '@testing-library/react'
import NavSearch from '@/components/layouts/Navbar/NavSearch'
import '@testing-library/jest-dom'

describe('NavSearch', () => {
  test('renders search input with correct placeholder', () => {
    render(<NavSearch />)
    const searchInput = screen.getByPlaceholderText(/search product/i)
    expect(searchInput).toBeInTheDocument()
  })
})
