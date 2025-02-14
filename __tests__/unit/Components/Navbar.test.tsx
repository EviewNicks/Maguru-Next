import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import Navbar from '@/components/layouts/Navbar'

// Mock all child components
jest.mock('@/components/Navbar/Logo', () => {
  return function MockLogo() {
    return <div data-testid="mock-logo">Logo</div>
  }
})

jest.mock('@/components/Navbar/DarkMode', () => {
  return function MockDarkMode() {
    return <div data-testid="mock-dark-mode">DarkMode</div>
  }
})

jest.mock('@/components/Navbar/CartButton', () => {
  return function MockCartButton() {
    return <div data-testid="mock-cart-button">CartButton</div>
  }
})

jest.mock('@/components/Navbar/NavSearch', () => {
  return function MockNavSearch() {
    return <div data-testid="mock-nav-search">NavSearch</div>
  }
})

jest.mock('@/components/Navbar/LinksDropdown', () => {
  return {
    LinksDropdown: function MockLinksDropdown() {
      return <div data-testid="mock-links-dropdown">LinksDropdown</div>
    }
  }
})

jest.mock('@/components/Container', () => {
  return function MockContainer({ children }: { children: React.ReactNode }) {
    return <div data-testid="mock-container">{children}</div>
  }
})

describe('Navbar Component', () => {
  it('renders successfully', () => {
    render(<Navbar />)
    expect(screen.getByRole('navigation')).toBeInTheDocument()
  })

  it('renders all child components', () => {
    render(<Navbar />)
    expect(screen.getByTestId('mock-logo')).toBeInTheDocument()
    expect(screen.getByTestId('mock-dark-mode')).toBeInTheDocument()
    expect(screen.getByTestId('mock-cart-button')).toBeInTheDocument()
    expect(screen.getByTestId('mock-nav-search')).toBeInTheDocument()
    expect(screen.getByTestId('mock-links-dropdown')).toBeInTheDocument()
    expect(screen.getByTestId('mock-container')).toBeInTheDocument()
  })

  it('has correct structure', () => {
    render(<Navbar />)
    const nav = screen.getByRole('navigation')
    expect(nav).toHaveClass('border-b')
    
    const container = screen.getByTestId('mock-container')
    expect(container).toHaveClass('flex', 'flex-col', 'sm:flex-row', 'sm:justify-between', 'sm:items-center', 'flex-wrap', 'gap-4', 'py-6')
  })
})