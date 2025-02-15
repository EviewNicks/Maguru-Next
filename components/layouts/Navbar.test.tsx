import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import Navbar from '@/components/layouts/Navbar'

// Mock all child components
jest.mock('@/components/layouts/Navbar/Logo', () => {
  return function MockLogo() {
    return <div data-testid="mock-logo">Logo</div>
  }
})

jest.mock('@/components/layouts/Navbar/DarkMode', () => {
  return function MockDarkMode() {
    return <div data-testid="mock-dark-mode">DarkMode</div>
  }
})

jest.mock('@/components/layouts/Navbar/CartButton', () => {
  return function MockCartButton() {
    return <div data-testid="mock-cart-button">CartButton</div>
  }
})

jest.mock('@/components/layouts/Navbar/NavSearch', () => {
  return function MockNavSearch() {
    return <div data-testid="mock-nav-search">NavSearch</div>
  }
})

jest.mock('@/components/layouts/Navbar/LinksDropdown', () => {
  return {
    LinksDropdown: function MockLinksDropdown() {
      return <div data-testid="mock-links-dropdown">LinksDropdown</div>
    },
  }
})

// Update Container mock untuk menangani cn utility
jest.mock('@/components/Layouts/Container', () => {
  return function MockContainer({
    children,
    className,
  }: {
    children: React.ReactNode
    className?: string
  }) {
    // Simulasi behavior cn utility dengan menggabungkan class default dengan class dari props
    const finalClassName = `mx-auto xl:max-w-full ${className || ''}`
    return (
      <div data-testid="mock-container" className={finalClassName}>
        {children}
      </div>
    )
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
    // Container default classes
    expect(container).toHaveClass('mx-auto')
    expect(container).toHaveClass('xl:max-w-full')

    // Navbar specific classes
    const navbarClasses = [
      'flex',
      'flex-col',
      'sm:flex-row',
      'sm:justify-between',
      'sm:items-center',
      'flex-wrap',
      'gap-4',
      'py-6',
    ]

    navbarClasses.forEach((className) => {
      expect(container).toHaveClass(className)
    })
  })

  expect.extend({
    toHaveClasses(received: HTMLElement, classes: string[]) {
      const elementClasses = received.className.split(' ')
      const missingClasses = classes.filter((c) => !elementClasses.includes(c))

      if (missingClasses.length === 0) {
        return {
          message: () =>
            `expected element not to have classes: ${classes.join(', ')}`,
          pass: true,
        }
      } else {
        return {
          message: () =>
            `expected element to have classes: ${missingClasses.join(', ')}`,
          pass: false,
        }
      }
    },
  })

  // Gunakan helper di test
  it('has container with all required classes', () => {
    render(<Navbar />)
    const container = screen.getByTestId('mock-container')

    const expectedClasses = [
      'mx-auto',
      'xl:max-w-full',
      'flex',
      'flex-col',
      'sm:flex-row',
      'sm:justify-between',
      'sm:items-center',
      'flex-wrap',
      'gap-4',
      'py-6',
    ]

    expectedClasses.forEach((className) => {
      expect(container).toHaveClass(className, { exact: false })
    })
  })

  it('maintains responsive layout classes', () => {
    render(<Navbar />)
    const container = screen.getByTestId('mock-container')

    // Check mobile layout
    expect(container).toHaveClass('flex-col')

    // Check desktop layout
    expect(container).toHaveClass('sm:flex-row')
  })

  it('renders action items container with correct classes', () => {
    render(<Navbar />)
    const actionContainer = screen
      .getByTestId('mock-container')
      .querySelector('.flex.gap-4.items-center')
    expect(actionContainer).toBeInTheDocument()
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
