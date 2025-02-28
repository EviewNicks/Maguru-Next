import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import SignOutLink from '@/components/layouts/Navbar/SignOutLink'

// Mock useToast hook
const mockToast = jest.fn()
jest.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: mockToast,
  }),
}))

// Mock SignOutButton dari Clerk
jest.mock('@clerk/nextjs', () => ({
  SignOutButton: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="mock-sign-out-button">{children}</div>
  ),
}))

describe('SignOutLink Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders correctly with logout text', () => {
    render(<SignOutLink />)

    const logoutLink = screen.getByText('Log out')
    expect(logoutLink).toBeInTheDocument()
  })

  it('is wrapped with SignOutButton component', () => {
    render(<SignOutLink />)

    const signOutButton = screen.getByTestId('mock-sign-out-button')
    expect(signOutButton).toBeInTheDocument()
  })

  it('has correct href attribute', () => {
    render(<SignOutLink />)

    const link = screen.getByRole('link', { name: /log out/i })
    expect(link).toHaveAttribute('href', '/')
  })

  it('shows toast notification when clicked', () => {
    render(<SignOutLink />)

    const logoutLink = screen.getByText('Log out')
    fireEvent.click(logoutLink)

    expect(mockToast).toHaveBeenCalledWith({
      description: 'Logging Out...',
    })
  })

  it('has correct className for full width and left alignment', () => {
    render(<SignOutLink />)

    const link = screen.getByRole('link', { name: /log out/i })
    expect(link).toHaveClass('w-full text-left')
  })
})
