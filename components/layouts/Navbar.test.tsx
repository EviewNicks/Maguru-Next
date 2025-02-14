import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import Navbar from '@/components/layouts/Navbar'

// Mock all child components
jest.mock('./Navbar/Logo', () => {
  return function MockLogo() {
    return <div data-testid="mock-logo">Logo</div>
  }
})

jest.mock('./Navbar/DarkMode', () => {
  return function MockDarkMode() {
    return <div data-testid="mock-dark-mode">DarkMode</div>
  }
})

jest.mock('./Navbar/CartButton', () => {
  return function MockCartButton() {
    return <div data-testid="mock-cart-button">CartButton</div>
  }
})

jest.mock('./Navbar/NavSearch', () => {
  return function MockNavSearch() {
    return <div data-testid="mock-nav-search">NavSearch</div>
  }
})

jest.mock('./Navbar/LinksDropdown', () => {
  return {
    LinksDropdown: function MockLinksDropdown() {
      return <div data-testid="mock-links-dropdown">LinksDropdown</div>
    },
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
    expect(container).toHaveClass(
      'flex',
      'flex-col',
      'sm:flex-row',
      'sm:justify-between',
      'sm:items-center',
      'flex-wrap',
      'gap-4',
      'py-6'
    )
  })

  it('maintains responsive layout classes', () => {
    render(<Navbar />)
    const container = screen.getByTestId('mock-container')

    // Test mobile layout
    expect(container).toHaveClass('flex-col')

    // Test desktop layout
    expect(container).toHaveClass('sm:flex-row')
  })

  it('groups action items correctly', () => {
    render(<Navbar />)
    const actionGroup = screen
      .getByTestId('mock-container')
      .querySelector('.flex.gap-4')
    expect(actionGroup).toBeInTheDocument()
    expect(actionGroup).toContainElement(screen.getByTestId('mock-cart-button'))
    expect(actionGroup).toContainElement(screen.getByTestId('mock-dark-mode'))
    expect(actionGroup).toContainElement(
      screen.getByTestId('mock-links-dropdown')
    )
  })

  // Test for proper component order
  it('renders components in correct order', () => {
    render(<Navbar />)
    const container = screen.getByTestId('mock-container')
    const childNodes = container.childNodes

    expect(childNodes[0]).toHaveTextContent('Logo')
    expect(childNodes[1]).toHaveTextContent('NavSearch')
    expect(childNodes[2]).toContainElement(
      screen.getByTestId('mock-cart-button')
    )
  })
})
