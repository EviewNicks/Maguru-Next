import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { LinksDropdown } from '@/components/layouts/Navbar/LinksDropdown'
import { dropdownLinks } from '@/config/links'
import userEvent from '@testing-library/user-event'

// Add mock for UserIcon
jest.mock('./UserIcon', () => {
  return function MockUserIcon() {
    return <div data-testid="user-icon">UserIcon</div>
  }
})

// Add mock for SignOutLink
jest.mock('./SignOutLink', () => {
  return function MockSignOutLink() {
    return <div data-testid="sign-out-link">Sign Out</div>
  }
})

// Mock next/link
jest.mock('next/link', () => {
  return function MockLink({
    children,
    href,
  }: {
    children: React.ReactNode
    href: string
  }) {
    return <a href={href}>{children}</a>
  }
})

// Mock Clerk components
jest.mock('@clerk/nextjs', () => ({
  SignedIn: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="signed-in">{children}</div>
  ),
  SignedOut: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="signed-out">{children}</div>
  ),
  SignInButton: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="sign-in-button">{children}</div>
  ),
  SignUpButton: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="sign-up-button">{children}</div>
  ),
}))

// Mock shadcn components
jest.mock('@/components/ui/button', () => ({
  Button: ({ children, ...props }: { children: React.ReactNode }) => (
    <button {...props}>{children}</button>
  ),
}))

jest.mock('@/components/ui/dropdown-menu', () => ({
  DropdownMenu: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dropdown-menu">{children}</div>
  ),
  DropdownMenuTrigger: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dropdown-trigger">{children}</div>
  ),
  DropdownMenuContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dropdown-content">{children}</div>
  ),
  DropdownMenuGroup: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dropdown-group">{children}</div>
  ),
  DropdownMenuItem: ({
    children,
    disabled,
  }: {
    children: React.ReactNode
    disabled?: boolean
  }) => (
    <div
      data-testid="dropdown-item"
      aria-disabled={disabled ? 'true' : 'false'}
    >
      {children}
    </div>
  ),
  DropdownMenuLabel: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dropdown-label">{children}</div>
  ),
  DropdownMenuSeparator: () => <hr data-testid="dropdown-separator" />,
  DropdownMenuShortcut: ({ children }: { children: React.ReactNode }) => (
    <span data-testid="dropdown-shortcut">{children}</span>
  ),
}))

describe('LinksDropdown Component', () => {
  it('renders dropdown trigger button', () => {
    render(<LinksDropdown />)
    const trigger = screen.getByTestId('dropdown-trigger')
    expect(trigger).toBeInTheDocument()
  })

  it('renders SignedOut content when user is not authenticated', () => {
    render(<LinksDropdown />)
    expect(screen.getByTestId('signed-out')).toBeInTheDocument()
    expect(screen.getByText('Login')).toBeInTheDocument()
    expect(screen.getByText('register')).toBeInTheDocument()
  })

  it('renders SignedIn content when user is authenticated', () => {
    render(<LinksDropdown />)
    expect(screen.getByTestId('signed-in')).toBeInTheDocument()
    expect(screen.getByText('My Account')).toBeInTheDocument()
  })

  it('renders all dropdown links from configuration', () => {
    render(<LinksDropdown />)

    dropdownLinks.forEach((group) => {
      group.links.forEach((link) => {
        if (!link.disabled) {
          expect(screen.getByText(link.label)).toBeInTheDocument()
        }
      })
    })
  })

  it('renders shortcuts for links that have them', () => {
    render(<LinksDropdown />)

    dropdownLinks.forEach((group) => {
      group.links.forEach((link) => {
        if (link.shortcut) {
          expect(screen.getByText(link.shortcut)).toBeInTheDocument()
        }
      })
    })
  })

  it('properly handles disabled links', () => {
    render(<LinksDropdown />)

    dropdownLinks.forEach((group) => {
      group.links.forEach((link) => {
        if (link.disabled) {
          const item = screen
            .getByText(link.label)
            .closest('[aria-disabled="true"]')
          expect(item).toBeInTheDocument()
        }
      })
    })
  })

  describe('Interaction Tests', () => {
    it('opens dropdown menu when trigger is clicked', async () => {
      const user = userEvent.setup()
      render(<LinksDropdown />)
      const trigger = screen.getByTestId('dropdown-trigger')

      await user.click(trigger)

      expect(screen.getByTestId('dropdown-content')).toBeVisible()
    })

    it('navigates correctly when links are clicked', async () => {
      const user = userEvent.setup()
      render(<LinksDropdown />)
      const trigger = screen.getByTestId('dropdown-trigger')
      await user.click(trigger)

      // Test navigation for each non-disabled link
      for (const group of dropdownLinks) {
        for (const link of group.links) {
          if (!link.disabled && link.href) {
            const linkElement = screen.getByText(link.label)
            expect(linkElement.closest('a')).toHaveAttribute('href', link.href)
          }
        }
      }
    })

    it('handles disabled links correctly', async () => {
      const user = userEvent.setup()
      render(<LinksDropdown />)
      const trigger = screen.getByTestId('dropdown-trigger')
      await user.click(trigger)

      const disabledLinks = dropdownLinks
        .flatMap((group) => group.links)
        .filter((link) => link.disabled)

      disabledLinks.forEach((link) => {
        const linkElement = screen.getByText(link.label)
        expect(
          linkElement.closest('[aria-disabled="true"]')
        ).toBeInTheDocument()
      })
    })
  })

  describe('Authentication State Tests', () => {
    it('shows correct content for authenticated users', () => {
      render(<LinksDropdown />)
      expect(screen.getByTestId('signed-in')).toBeInTheDocument()
      expect(screen.getByTestId('user-icon')).toBeInTheDocument()
      expect(screen.getByTestId('sign-out-link')).toBeInTheDocument()
    })

    it('shows correct content for unauthenticated users', () => {
      render(<LinksDropdown />)
      expect(screen.getByTestId('signed-out')).toBeInTheDocument()
      expect(screen.getByTestId('sign-in-button')).toBeInTheDocument()
      expect(screen.getByTestId('sign-up-button')).toBeInTheDocument()
    })
  })

  describe('Visual Elements Tests', () => {
    it('renders UserIcon component', () => {
      render(<LinksDropdown />)
      expect(screen.getByTestId('user-icon')).toBeInTheDocument()
    })

    it('renders correct button layout', () => {
      render(<LinksDropdown />)
      const button = screen.getByRole('button')
      expect(button).toHaveClass('flex', 'gap-4', 'max-w-[100px]')
    })

    it('renders all separators correctly', () => {
      render(<LinksDropdown />)
      const separators = screen.getAllByTestId('dropdown-separator')
      const expectedSeparators =
        dropdownLinks.filter((group) => group.separator).length + 1 // +1 for the auth separator
      expect(separators).toHaveLength(expectedSeparators)
    })
  })
})
